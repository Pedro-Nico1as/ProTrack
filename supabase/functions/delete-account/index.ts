import { serve, createClient, corsHeaders } from "../_shared/deps.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const token = authHeader.replace('Bearer ', '')

    // Support both Deno.env and process.env patterns
    const SUPABASE_ENV = (typeof process !== 'undefined' && process.env ? process.env.SUPABASE_ENV : undefined) || Deno.env.get('SUPABASE_ENV');
    const isProduction = SUPABASE_ENV === 'production';

    let user;
    let supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    if (token === 'mock-valid-token') {
      if (isProduction) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Mock tokens are blocked in production' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      } else {
        // Dev/Test bypass: Mock the test user
        user = { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', email: 'test@protrack.com' };
        
        // Use service role key to bypass client authorization for mock user in local development/testing
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (serviceRoleKey) {
          supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )
        }
      }
    }

    if (!user) {
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser(token)
      if (userError || !supabaseUser) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      }
      user = supabaseUser;
    }

    // Check request body for a user ID, if provided, to ensure it matches the authenticated user ID
    let requestedUserId: string | null = null
    try {
      const clonedReq = req.clone()
      const body = await clonedReq.json()
      requestedUserId = body?.userId ?? body?.user_id ?? body?.id ?? null
    } catch (_) {
      // Body is either empty or not JSON, ignore
    }

    if (requestedUserId && requestedUserId !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: Authenticated user ID does not match requested user ID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Initialize the Admin Client with Service Role Key to bypass RLS policies
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`Starting account deletion for user: ${user.id}`)

    // 1. Manually delete set logs associated with the user's workouts to be 100% safe
    const { data: userLogs, error: fetchLogsError } = await supabaseAdmin
      .from('user_workout_logs')
      .select('id')
      .eq('user_id', user.id)

    if (fetchLogsError) {
      console.error('Error fetching user workout logs:', fetchLogsError.message)
    }

    if (userLogs && userLogs.length > 0) {
      const logIds = userLogs.map((l) => l.id)
      console.log(`Deleting user_set_logs for logs: ${logIds.join(', ')}`)
      const { error: deleteSetsError } = await supabaseAdmin
        .from('user_set_logs')
        .delete()
        .in('log_id', logIds)
      
      if (deleteSetsError) {
        throw new Error(`Failed to delete user set logs: ${deleteSetsError.message}`)
      }
    }

    // 2. Manually delete workout logs
    console.log(`Deleting user_workout_logs for user: ${user.id}`)
    const { error: deleteWorkoutsError } = await supabaseAdmin
      .from('user_workout_logs')
      .delete()
      .eq('user_id', user.id)

    if (deleteWorkoutsError) {
      throw new Error(`Failed to delete user workout logs: ${deleteWorkoutsError.message}`)
    }

    // 3. Manually delete profile
    console.log(`Deleting profile for user: ${user.id}`)
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (deleteProfileError) {
      throw new Error(`Failed to delete profile: ${deleteProfileError.message}`)
    }

    // 4. Delete the user from auth.users via admin client
    console.log(`Permanently deleting auth user: ${user.id}`)
    const { error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteAuthUserError) {
      throw new Error(`Failed to delete auth user: ${deleteAuthUserError.message}`)
    }

    console.log(`Account deleted successfully for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('[Delete-Account Error]', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}, { port: Number(Deno.env.get('PORT') ?? '8000') })

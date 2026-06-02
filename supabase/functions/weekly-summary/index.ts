import { serve, createClient, corsHeaders } from '../_shared/deps.ts'

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

    // Explicit UTC start of week calculation (Monday 00:00:00.000 UTC)
    const now = new Date()
    const day = now.getUTCDay()
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0))

    // Perform a single nested query to avoid the N+1 query problem!
    const { data: logs, error: logsError } = await supabase
      .from('user_workout_logs')
      .select(`
        id,
        duration_seconds,
        user_set_logs (
          weight_kg,
          reps_done
        )
      `)
      .eq('user_id', user.id) // Crucial to filter by validated user ID
      .gte('completed_at', startOfWeek.toISOString())

    if (logsError) throw logsError

    let totalVolume = 0
    let timeSpent = 0

    for (const log of logs || []) {
      timeSpent += (log.duration_seconds || 0) / 60
      
      const sets = log.user_set_logs || []
      for (const set of sets) {
        const weight = Number(set.weight_kg) || 0
        const reps = Number(set.reps_done) || 0
        totalVolume += weight * reps
      }
    }

    const workoutsCompleted = logs.length
    const durationMinutes = Math.round(timeSpent)

    return new Response(
      JSON.stringify({
        // Mobile application model contract keys
        workouts: workoutsCompleted,
        volume_kg: totalVolume,
        duration_minutes: durationMinutes,
        
        // Documentation & alternative API model contract keys
        workouts_completed: workoutsCompleted,
        total_volume_kg: totalVolume,
        time_spent_minutes: durationMinutes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}, { port: Number(Deno.env.get('PORT') ?? '8000') })

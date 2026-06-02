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

    const url = new URL(req.url)
    const exerciseId = url.searchParams.get('exercise_id')
    if (!exerciseId) throw new Error('exercise_id is required')

    // Strict UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(exerciseId)) {
      throw new Error('Invalid exercise_id format (must be a valid UUID)')
    }

    // Optimize performance: restrict history query to the last 2 years
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const { data: sets, error: setsError } = await supabase
      .from('user_set_logs')
      .select(`
        weight_kg,
        completed_at,
        exercise_id,
        custom_exercise_id,
        session_exercises(exercise_id)
      `)
      .gte('completed_at', twoYearsAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(500) // Additional safety limit
      
    if (setsError) throw setsError

    const filteredSets = (sets || []).filter((s: any) => 
      s.exercise_id === exerciseId || 
      s.custom_exercise_id === exerciseId || 
      (s.session_exercises && s.session_exercises.exercise_id === exerciseId)
    )

    let maxWeight = 0
    let prDate = null
    const historyMap = new Map()

    for (const s of filteredSets) {
      const weight = Number(s.weight_kg) || 0
      if (weight > maxWeight) {
        maxWeight = weight
        prDate = s.completed_at
      }
      const dateKey = s.completed_at.split('T')[0]
      if (!historyMap.has(dateKey) || weight > historyMap.get(dateKey)) {
        historyMap.set(dateKey, weight)
      }
    }

    const history = Array.from(historyMap.entries()).map(([date, max_weight_kg]) => ({
      date, max_weight_kg
    }))

    return new Response(
      JSON.stringify({
        personal_record: prDate ? { weight_kg: maxWeight, achieved_at: prDate } : null,
        history
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

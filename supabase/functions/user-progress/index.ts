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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
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
        session_exercises(exercise_id)
      `)
      .gte('completed_at', twoYearsAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(500) // Additional safety limit
      
    if (setsError) throw setsError

    const filteredSets = (sets || []).filter((s: any) => 
      s.exercise_id === exerciseId || (s.session_exercises && s.session_exercises.exercise_id === exerciseId)
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

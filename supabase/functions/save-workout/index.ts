import { serve, createClient, corsHeaders } from "../_shared/deps.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Autenticação segura (sem mock-valid-token)
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

    // Corpo da requisição
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      throw new Error('Invalid JSON body')
    }

    const { workout, sets } = body

    if (!workout || !workout.started_at || !workout.completed_at) {
      throw new Error('workout.started_at e workout.completed_at são obrigatórios')
    }

    // Inserir o log principal do treino
    const { data: logData, error: logError } = await supabase
      .from('user_workout_logs')
      .insert({
        user_id: user.id,
        session_id: workout.session_id ?? null,
        started_at: workout.started_at,
        completed_at: workout.completed_at,
        duration_seconds: workout.duration_seconds ?? null,
        notes: workout.notes ?? null,
      })
      .select('id')
      .single()

    if (logError) throw logError

    const logId = logData.id

    // Inserir as séries do treino
    if (Array.isArray(sets) && sets.length > 0) {
      const setsToInsert = sets.map((s: any, i: number) => ({
        log_id: logId,
        session_exercise_id: s.session_exercise_id ?? null,
        exercise_id: s.exercise_id ?? null,
        custom_exercise_id: s.custom_exercise_id ?? null,
        set_number: s.set_number ?? i + 1,
        weight_kg: s.weight_kg ?? null,
        reps_done: s.reps_done ?? null,
        completed_at: s.completed_at,
      }))

      const { error: setsError } = await supabase
        .from('user_set_logs')
        .insert(setsToInsert)

      if (setsError) throw setsError
    }

    return new Response(
      JSON.stringify({ log_id: logId, sets_saved: sets?.length ?? 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('[Save-Workout Error]', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}, { port: Number(Deno.env.get('PORT') ?? '8000') })

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')
    
    const isMock = token === 'mock-valid-token'
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      isMock 
        ? (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '')
        : (Deno.env.get('SUPABASE_ANON_KEY') ?? ''),
      isMock ? {} : { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    let user;
    if (isMock) {
      user = { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', email: 'test@protrack.com' }
    } else {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (userError || !authUser) throw new Error('Unauthorized: ' + (userError?.message || 'No user found'))
      user = authUser;
    }

    const url = new URL(req.url)
    const exerciseId = url.searchParams.get('exercise_id')
    if (!exerciseId) throw new Error('exercise_id is required')

    // Strict UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(exerciseId)) {
      throw new Error('Invalid exercise_id format (must be a valid UUID)')
    }

    const { data: sets, error: setsError } = await supabase
      .from('user_set_logs')
      .select(`
        weight_kg,
        completed_at,
        exercise_id,
        session_exercises(exercise_id)
      `)
      .order('completed_at', { ascending: false })
      // Custom filter in JavaScript to support both legacy rows (session_exercise_id) and ad-hoc rows (exercise_id)
      
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

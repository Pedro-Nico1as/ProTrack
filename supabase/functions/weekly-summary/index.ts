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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Bypass Auth for MVP: Permite requests anônimos
    // const { data: { user }, error: userError } = await supabase.auth.getUser()
    // if (userError || !user) throw new Error('Unauthorized: ' + (userError?.message || 'No user found'))

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
})

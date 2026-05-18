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
    const { data: { user } } = await supabase.auth.getUser()
    // if (userError || !user) {
    //   throw new Error('Unauthorized: ' + (userError?.message || 'No user found'))
    // }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      throw new Error('Invalid JSON body')
    }

    const { logs = [], sets = [] } = body
    let syncedCount = 0
    const syncedIds: string[] = []
    const conflictIds: string[] = []

    // 1. Insert logs using upsert (client_id must be unique)
    const logsToInsert = logs.map((l: any) => ({
      user_id: user?.id || null,
      session_id: l.session_id,
      started_at: l.started_at,
      completed_at: l.completed_at,
      duration_seconds: l.duration_seconds,
      notes: l.notes,
      synced_at: new Date().toISOString(),
      client_id: l.client_id
    }))

    if (logsToInsert.length > 0) {
      const { error: logsError } = await supabase
        .from('user_workout_logs')
        .upsert(logsToInsert, { onConflict: 'client_id' })
      if (logsError) throw logsError
      syncedCount += logsToInsert.length
      syncedIds.push(...logsToInsert.map((l: any) => l.client_id))
    }

    // 2. Insert sets
    if (sets.length > 0) {
      const logClientIds = [...new Set(sets.map((s: any) => s.log_client_id))]
      const { data: insertedLogs, error: fetchLogsError } = await supabase
        .from('user_workout_logs')
        .select('id, client_id')
        .in('client_id', logClientIds)

      if (fetchLogsError) throw fetchLogsError

      const logIdMap = new Map(insertedLogs.map((l) => [l.client_id, l.id]))

      const setsToInsert: any[] = []

      for (const s of sets) {
        const logId = logIdMap.get(s.log_client_id)
        if (logId) {
          setsToInsert.push({
            log_id: logId,
            session_exercise_id: s.session_exercise_id,
            exercise_id: s.exercise_id,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps_done: s.reps_done,
            completed_at: s.completed_at,
            client_id: s.client_id
          })
        } else {
          // Parent log does not exist: record as conflict so the client purges it and avoids infinite loop
          conflictIds.push(s.client_id)
        }
      }

      if (setsToInsert.length > 0) {
        const { error: setsError } = await supabase
          .from('user_set_logs')
          .upsert(setsToInsert, { onConflict: 'client_id' })
        if (setsError) throw setsError
        syncedCount += setsToInsert.length
        syncedIds.push(...setsToInsert.map((s: any) => s.client_id))
      }
    }

    return new Response(
      JSON.stringify({
        synced: syncedCount,          // Mobile client v2 contract key
        synced_count: syncedCount,    // Mobile client v1 contract key
        synced_ids: syncedIds,
        conflicts: conflictIds
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

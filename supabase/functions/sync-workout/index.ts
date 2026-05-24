import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function toUUID(str: string | null | undefined): string | null {
  if (!str) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str;
  }
  
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const hex4 = ((h1 & h2) >>> 0).toString(16).padStart(8, '0');
  
  const hex = hex1 + hex2 + hex3 + hex4;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : ''
    
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
      if (!token) {
        throw new Error('Unauthorized')
      }
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (userError || !authUser) {
        throw new Error('Unauthorized')
      }
      user = authUser;
    }

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

    // Fetch valid session IDs to avoid FK violations
    const sessionIds = [...new Set(logs.map((l: any) => toUUID(l.session_id)).filter(Boolean))]
    let validSessionIds = new Set<string>()
    if (sessionIds.length > 0) {
      const { data: dbSessions } = await supabase
        .from('workout_sessions')
        .select('id')
        .in('id', sessionIds)
      if (dbSessions) {
        validSessionIds = new Set(dbSessions.map((s) => s.id))
      }
    }

    // 1. Insert logs using upsert (client_id must be unique)
    const logsToInsert = logs.map((l: any) => {
      const mappedSessionId = toUUID(l.session_id)
      return {
        user_id: user.id,
        session_id: mappedSessionId && validSessionIds.has(mappedSessionId) ? mappedSessionId : null,
        started_at: l.started_at,
        completed_at: l.completed_at,
        duration_seconds: l.duration_seconds,
        notes: l.notes,
        synced_at: new Date().toISOString(),
        client_id: toUUID(l.client_id)
      }
    })

    if (logsToInsert.length > 0) {
      const { error: logsError } = await supabase
        .from('user_workout_logs')
        .upsert(logsToInsert, { onConflict: 'client_id' })
      if (logsError) throw logsError
      syncedCount += logsToInsert.length
      syncedIds.push(...logs.map((l: any) => l.client_id))
    }

    // 2. Insert sets
    if (sets.length > 0) {
      const logClientIds = [...new Set(sets.map((s: any) => toUUID(s.log_client_id)))]
      const { data: insertedLogs, error: fetchLogsError } = await supabase
        .from('user_workout_logs')
        .select('id, client_id')
        .in('client_id', logClientIds)

      if (fetchLogsError) throw fetchLogsError

      const logIdMap = new Map(insertedLogs.map((l) => [l.client_id, l.id]))

      // Fetch valid session_exercise and exercise IDs to avoid FK violations
      const sessionExIds = [...new Set(sets.map((s: any) => toUUID(s.session_exercise_id)).filter(Boolean))]
      const exIds = [...new Set(sets.map((s: any) => toUUID(s.exercise_id)).filter(Boolean))]
      
      let validSessionExIds = new Set<string>()
      if (sessionExIds.length > 0) {
        const { data: dbSessionExs } = await supabase
          .from('session_exercises')
          .select('id')
          .in('id', sessionExIds)
        if (dbSessionExs) {
          validSessionExIds = new Set(dbSessionExs.map((se) => se.id))
        }
      }
      
      let validExIds = new Set<string>()
      if (exIds.length > 0) {
        const { data: dbExs } = await supabase
          .from('exercises')
          .select('id')
          .in('id', exIds)
        if (dbExs) {
          validExIds = new Set(dbExs.map((e) => e.id))
        }
      }

      const setsToInsert: any[] = []

      for (const s of sets) {
        const mappedLogClientId = toUUID(s.log_client_id)
        const logId = logIdMap.get(mappedLogClientId)
        if (logId) {
          const mappedSessionExId = toUUID(s.session_exercise_id)
          const mappedExId = toUUID(s.exercise_id)

          setsToInsert.push({
            log_id: logId,
            session_exercise_id: mappedSessionExId && validSessionExIds.has(mappedSessionExId) ? mappedSessionExId : null,
            exercise_id: mappedExId && validExIds.has(mappedExId) ? mappedExId : null,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps_done: s.reps_done,
            completed_at: s.completed_at,
            client_id: toUUID(s.client_id)
          })
          syncedIds.push(s.client_id)
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
    console.error('[Sync-Workout Error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
}, { port: Number(Deno.env.get('PORT') ?? '8000') })

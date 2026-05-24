require('dotenv').config({ path: 'protrack-mobile/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

async function run() {
  const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  
  // 1. Try to login with a test user to get a JWT
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'pedro@protrack.com',
    password: 'senha123'
  });
  
  let token = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (authData?.session) {
    token = authData.session.access_token;
  } else {
    console.log("Not logged in, using anon key");
  }

  // 2. Call sync-workout
  const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sync-workout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      logs: [{
        client_id: "test-client-id",
        session_id: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: 60,
        total_volume_kg: 100,
        total_sets: 1
      }],
      sets: []
    })
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
run();

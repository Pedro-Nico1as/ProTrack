const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://azwmvqkrwafjpyifjgvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d212cWtyd2FmanB5aWZqZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTA2ODQsImV4cCI6MjA5NDYyNjY4NH0.5v-mYR1GDw-4Ejbuw6c1i0R1qTdfGbrM-XSTxmVCQUA';

async function executeSQL(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // Note: this uses anon key, but we'll use execute_sql tool from MCP or we can use admin client. Since execute_sql is an MCP tool, we will let our main agent handle database setup.
    }
  });
}

async function run() {
  console.log('Initializing Supabase client...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const email = `test_temp_${Date.now()}@protrack.com`;
  const password = 'testpassword123';

  console.log(`Attempting to sign up test user: ${email}...`);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Test Runner'
      }
    }
  });

  if (signUpErr) {
    console.error('Sign Up Error:', signUpErr.message);
    return;
  }

  let session = signUpData.session;
  let userId = signUpData.user?.id;

  if (!session) {
    console.log('User signed up, but no session returned (email confirmation may be enabled).');
    console.log('Please confirm the user in the database to continue. We will handle this by asking the parent agent to run a SQL query.');
    // In this case, we output the userId so the agent can execute the confirmation query
    console.log(`[USER_ID_TO_CONFIRM:${userId}]`);
    return;
  }

  await proceedWithTest(supabase, session.access_token, userId);
}

async function proceedWithTest(supabase, token, userId) {
  console.log(`Proceeding with test for user ID: ${userId}...`);

  // We will use a valid exercise ID (e.g. Supino Reto com Barra: 39d75874-27dd-4709-aec3-cdfd205ba47a)
  const exerciseId = '39d75874-27dd-4709-aec3-cdfd205ba47a';

  const workoutPayload = {
    workout: {
      session_id: null, // Custom workout
      started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      completed_at: new Date().toISOString(),
      duration_seconds: 3600,
      notes: 'Test custom workout'
    },
    sets: [
      {
        session_exercise_id: null, // Custom set
        exercise_id: exerciseId,
        set_number: 1,
        weight_kg: 50,
        reps_done: 10,
        completed_at: new Date().toISOString()
      }
    ]
  };

  console.log('Calling save-workout Edge Function...');
  const functionUrl = `${SUPABASE_URL}/functions/v1/save-workout`;
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(workoutPayload)
  });

  console.log('Response Status:', response.status);
  const result = await response.json();
  console.log('Response Body:', result);

  if (response.status !== 200 || !result.log_id) {
    console.error('Failed to save workout!');
    return;
  }

  const logId = result.log_id;
  console.log(`Workout saved with ID: ${logId}. Querying PostgREST to verify relationship expansion...`);

  // Query PostgREST using the user token to verify RLS and relationship expansion
  const queryUrl = `${SUPABASE_URL}/rest/v1/user_workout_logs?id=eq.${logId}&select=id,completed_at,duration_seconds,user_set_logs(weight_kg,reps_done,exercises(name))`;
  const queryRes = await fetch(queryUrl, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Query Status:', queryRes.status);
  const queryData = await queryRes.json();
  console.log('Query Data:', JSON.stringify(queryData, null, 2));

  // Clean up: delete the user (will cascade delete profiles, workout logs, set logs)
  console.log(`[USER_ID_TO_DELETE:${userId}]`);
}

// Check if we are running in two-step mode
const args = process.argv.slice(2);
if (args[0] === 'continue' && args[1] && args[2]) {
  const token = args[1];
  const userId = args[2];
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  proceedWithTest(supabase, token, userId).catch(console.error);
} else {
  run().catch(console.error);
}

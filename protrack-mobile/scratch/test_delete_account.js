const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://azwmvqkrwafjpyifjgvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d212cWtyd2FmanB5aWZqZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTA2ODQsImV4cCI6MjA5NDYyNjY4NH0.5v-mYR1GDw-4Ejbuw6c1i0R1qTdfGbrM-XSTxmVCQUA';

async function run() {
  console.log('Initializing Supabase client...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const email = `test_delete_${Date.now()}@protrack.com`;
  const password = 'testpassword123';

  console.log(`1. Signing up test user: ${email}...`);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Test Delete User'
      }
    }
  });

  if (signUpErr) {
    console.error('Sign Up Error:', signUpErr.message);
    return;
  }

  const token = signUpData.session?.access_token;
  const userId = signUpData.user?.id;

  if (!token) {
    console.error('Failed to acquire token automatically. Please ensure email confirmation is disabled.');
    return;
  }

  console.log(`User created. User ID: ${userId}`);

  // Create a workout log using the user's token
  console.log('2. Inserting test workout log and sets...');
  const exerciseId = '39d75874-27dd-4709-aec3-cdfd205ba47a';
  
  // Let's call the save-workout Edge function to populate user's history
  const saveWorkoutUrl = `${SUPABASE_URL}/functions/v1/save-workout`;
  const saveWorkoutRes = await fetch(saveWorkoutUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      workout: {
        session_id: null,
        started_at: new Date(Date.now() - 1800000).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: 1800,
        notes: 'Test deletion logs'
      },
      sets: [
        {
          session_exercise_id: null,
          exercise_id: exerciseId,
          set_number: 1,
          weight_kg: 60,
          reps_done: 8,
          completed_at: new Date().toISOString()
        }
      ]
    })
  });

  const saveWorkoutResult = await saveWorkoutRes.json();
  console.log('Workout Save Result:', saveWorkoutResult);

  if (saveWorkoutRes.status !== 200 || !saveWorkoutResult.log_id) {
    console.error('Failed to create test workout logs. Aborting.');
    return;
  }

  // Verify that the profile and logs exist in public schema
  console.log('3. Verifying initial data existence...');
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', userId).single();
  const { count: workoutCount } = await supabase.from('user_workout_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  
  console.log('- Profile exists:', !!profile, profile?.username);
  console.log('- Workout logs count:', workoutCount);

  // 4. Call POST /delete-account
  console.log('4. Calling delete-account Edge Function...');
  const deleteAccountUrl = `${SUPABASE_URL}/functions/v1/delete-account`;
  const deleteRes = await fetch(deleteAccountUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Delete Account Response Status:', deleteRes.status);
  const deleteResult = await deleteRes.json();
  console.log('Delete Account Response Body:', deleteResult);

  // 5. Verify database after deletion
  console.log('5. Verifying database post-deletion (expecting everything to be deleted)...');
  
  // Since we deleted the user, we will query with the anon key to verify that records are no longer present
  const { data: profileAfter } = await supabase.from('profiles').select('username').eq('id', userId).maybeSingle();
  const { data: workoutsAfter } = await supabase.from('user_workout_logs').select('id').eq('user_id', userId);
  
  console.log('- Profile remains:', !!profileAfter);
  console.log('- Workout logs remain count:', workoutsAfter?.length || 0);

  if (!profileAfter && (!workoutsAfter || workoutsAfter.length === 0) && deleteResult.success) {
    console.log('🎉 SUCCESS: All user records and auth user permanently and successfully deleted!');
  } else {
    console.error('❌ FAILURE: Records still exist or deletion response failed.');
  }
}

run().catch(console.error);

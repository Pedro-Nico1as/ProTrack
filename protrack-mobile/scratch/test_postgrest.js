const SUPABASE_URL = 'https://azwmvqkrwafjpyifjgvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d212cWtyd2FmanB5aWZqZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTA2ODQsImV4cCI6MjA5NDYyNjY4NH0.5v-mYR1GDw-4Ejbuw6c1i0R1qTdfGbrM-XSTxmVCQUA';

const url = `${SUPABASE_URL}/rest/v1/user_workout_logs?select=id,completed_at,duration_seconds,user_set_logs(weight_kg,reps_done,exercises(name))&limit=5`;

fetch(url, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(async (res) => {
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
})
.catch(console.error);

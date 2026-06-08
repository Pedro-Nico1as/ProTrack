const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://azwmvqkrwafjpyifjgvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d212cWtyd2FmanB5aWZqZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTA2ODQsImV4cCI6MjA5NDYyNjY4NH0.5v-mYR1GDw-4Ejbuw6c1i0R1qTdfGbrM-XSTxmVCQUA';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function run() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'exp://192.168.18.50:8081/--/auth/callback',
        skipBrowserRedirect: true
      }
    });
    if (error) throw error;
    console.log('Generated OAuth URL:', data.url);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();

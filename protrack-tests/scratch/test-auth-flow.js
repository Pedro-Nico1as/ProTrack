/**
 * End-to-end test: Signup a new user, verify auto-confirm, then login.
 * This simulates exactly what AuthScreen.tsx does.
 */

const SUPABASE_URL = 'https://azwmvqkrwafjpyifjgvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d212cWtyd2FmanB5aWZqZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTA2ODQsImV4cCI6MjA5NDYyNjY4NH0.5v-mYR1GDw-4Ejbuw6c1i0R1qTdfGbrM-XSTxmVCQUA';

const testEmail = `e2e-auth-${Date.now()}@protrack.com`;
const testPassword = 'TestPass123!';

async function testAuthFlow() {
  console.log('=== Auth Flow E2E Test ===');
  console.log(`Test email: ${testEmail}`);
  
  // Step 1: Sign Up
  console.log('\n--- Step 1: Sign Up ---');
  const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      data: { full_name: 'E2E Test User' },
    }),
  });
  
  const signUpData = await signUpRes.json();
  console.log('SignUp status:', signUpRes.status);
  console.log('Has user:', !!signUpData.id || !!signUpData.user);
  console.log('Has session (access_token):', !!signUpData.access_token);
  console.log('email_confirmed_at:', signUpData.email_confirmed_at || signUpData.user?.email_confirmed_at || 'null');
  
  if (signUpRes.status !== 200) {
    console.error('FAIL: Signup failed:', signUpData);
    process.exit(1);
  }
  
  // Step 2: Immediately Sign In (this is what AuthScreen.tsx does when session is null)
  console.log('\n--- Step 2: Immediate Sign In ---');
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  
  const signInData = await signInRes.json();
  console.log('SignIn status:', signInRes.status);
  console.log('Has access_token:', !!signInData.access_token);
  console.log('Has refresh_token:', !!signInData.refresh_token);
  console.log('User ID:', signInData.user?.id || 'null');
  
  if (signInRes.status !== 200 || !signInData.access_token) {
    console.error('FAIL: Login after signup failed:', signInData);
    process.exit(1);
  }
  
  console.log('\n✅ SUCCESS: Signup → Immediate Login flow works end-to-end!');
  console.log('   The user would be navigated into MainTabs automatically.');
  
  // Clean up: Delete the test user via admin API is not possible with anon key, skip cleanup
  console.log('\n--- Cleanup ---');
  console.log('Test user created (will remain in DB):', testEmail);
}

testAuthFlow().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

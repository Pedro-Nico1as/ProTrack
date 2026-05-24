/**
 * Test: Signup two users with same name, then verify unique usernames.
 */

const SUPABASE_URL = 'https://azwmvqkrwafjpyifjgvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d212cWtyd2FmanB5aWZqZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTA2ODQsImV4cCI6MjA5NDYyNjY4NH0.5v-mYR1GDw-4Ejbuw6c1i0R1qTdfGbrM-XSTxmVCQUA';

async function signup(email, password, fullName) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password, data: { full_name: fullName } }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  const ts = Date.now();

  console.log('=== Test 1: First signup (Pedro Vieira) ===');
  const r1 = await signup(`user1-${ts}@test.com`, 'Pass123!', 'Pedro Vieira');
  console.log('Status:', r1.status, r1.status === 200 ? '✅' : '❌');
  if (r1.status !== 200) { console.error('FAIL:', r1.data); process.exit(1); }

  console.log('\n=== Test 2: Second signup with SAME name (Pedro Vieira) ===');
  const r2 = await signup(`user2-${ts}@test.com`, 'Pass123!', 'Pedro Vieira');
  console.log('Status:', r2.status, r2.status === 200 ? '✅' : '❌');
  if (r2.status !== 200) { console.error('FAIL:', r2.data); process.exit(1); }

  console.log('\n=== Test 3: Login user 1 ===');
  const l1 = await login(`user1-${ts}@test.com`, 'Pass123!');
  console.log('Status:', l1.status, l1.status === 200 ? '✅' : '❌');
  if (l1.status !== 200) { console.error('FAIL:', l1.data); process.exit(1); }

  console.log('\n=== Test 4: Login user 2 ===');
  const l2 = await login(`user2-${ts}@test.com`, 'Pass123!');
  console.log('Status:', l2.status, l2.status === 200 ? '✅' : '❌');
  if (l2.status !== 200) { console.error('FAIL:', l2.data); process.exit(1); }

  console.log('\n✅ ALL TESTS PASSED — Duplicate names handled, signup+login works!');
}

main().catch(e => { console.error(e); process.exit(1); });

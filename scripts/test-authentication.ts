import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to log progress
function logProgress(message: string, status: 'start' | 'success' | 'error' = 'start', details?: string) {
  const timestamp = new Date().toLocaleTimeString();
  const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : '🔄';
  
  if (status === 'error') {
    console.log(`${statusIcon} [${timestamp}] ${message}: ${details}`);
  } else if (status === 'success') {
    console.log(`${statusIcon} [${timestamp}] ${message}${details ? `: ${details}` : ''}`);
  } else {
    console.log(`${statusIcon} [${timestamp}] ${message}...`);
  }
}

async function testAllLogins() {
  logProgress('Testing all user logins');
  
  const users = [
    { email: 'manager@buildtrack.com', password: 'password', name: 'Manager' },
    { email: 'admin@buildtrack.com', password: 'password', name: 'Admin' },
    { email: 'worker@buildtrack.com', password: 'password', name: 'Worker' },
    { email: 'dennis@buildtrack.com', password: 'password', name: 'Dennis' },
    { email: 'mike@metroplumbing.com', password: 'password', name: 'Mike' },
  ];
  
  let successCount = 0;
  
  for (const user of users) {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (signInError) {
        logProgress(`${user.name} login`, 'error', signInError.message);
      } else {
        logProgress(`${user.name} login`, 'success', `ID: ${signInData.user?.id}`);
        successCount++;
      }
    } catch (error: any) {
      logProgress(`${user.name} login`, 'error', error.message);
    }
  }
  
  logProgress('Login tests', 'success', `${successCount}/${users.length} successful`);
}

// Main function
async function testAuthentication() {
  logProgress('Testing authentication system');
  
  try {
    await testAllLogins();
    
    console.log('\n📋 Login Status Summary:');
    console.log('   If you see "Email not confirmed" errors, you need to:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Authentication > Settings');
    console.log('   3. Disable "Enable email confirmations" for development');
    console.log('   4. Or check your email for confirmation links');
    console.log('\n🚀 After fixing email confirmation, try logging in again!');
    
  } catch (error: any) {
    logProgress('Authentication test', 'error', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
testAuthentication();


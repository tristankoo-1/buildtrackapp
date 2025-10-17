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

async function createAuthUsers() {
  logProgress('Creating authentication users');
  
  const users = [
    { email: 'manager@buildtrack.com', password: 'password', name: 'John Manager' },
    { email: 'admin@buildtrack.com', password: 'password', name: 'Alex Administrator' },
    { email: 'worker@buildtrack.com', password: 'password', name: 'Sarah Worker' },
    { email: 'dennis@buildtrack.com', password: 'password', name: 'Dennis' },
    { email: 'mike@metroplumbing.com', password: 'password', name: 'Mike Johnson' },
  ];
  
  let createdCount = 0;
  let existingCount = 0;
  
  for (const user of users) {
    try {
      logProgress(`Creating auth user for ${user.email}`);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
          }
        }
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          logProgress(`Auth user for ${user.email}`, 'success', 'already exists');
          existingCount++;
        } else {
          logProgress(`Failed to create ${user.email}`, 'error', signUpError.message);
        }
      } else {
        logProgress(`Created auth user for ${user.email}`, 'success');
        createdCount++;
      }
    } catch (error: any) {
      logProgress(`Error creating ${user.email}`, 'error', error.message);
    }
  }
  
  logProgress('Authentication user creation', 'success', `${createdCount} created, ${existingCount} already existed`);
}

async function testManagerLogin() {
  logProgress('Testing manager login');
  
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'manager@buildtrack.com',
      password: 'password'
    });
    
    if (signInError) {
      logProgress('Manager login test', 'error', signInError.message);
    } else {
      logProgress('Manager login test', 'success', `User ID: ${signInData.user?.id}`);
    }
  } catch (error: any) {
    logProgress('Manager login test', 'error', error.message);
  }
}

// Main function
async function setupAuthentication() {
  logProgress('Starting authentication setup');
  
  try {
    await createAuthUsers();
    await testManagerLogin();
    
    console.log('\n🎉 Authentication setup completed!');
    console.log('\n📋 You can now login with:');
    console.log('   Manager: manager@buildtrack.com / password');
    console.log('   Admin: admin@buildtrack.com / password');
    console.log('   Worker: worker@buildtrack.com / password');
    console.log('   Dennis: dennis@buildtrack.com / password');
    console.log('   Mike: mike@metroplumbing.com / password');
    
  } catch (error: any) {
    logProgress('Authentication setup', 'error', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
setupAuthentication();
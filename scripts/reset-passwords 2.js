#!/usr/bin/env node

/**
 * Reset User Passwords Script
 * 
 * This script resets all test user passwords to ensure they work properly.
 * Run this if you're having login issues.
 * 
 * Usage:
 * node scripts/reset-passwords.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_USERS = [
  { email: 'manager@buildtrack.com', name: 'John Manager' },
  { email: 'worker@buildtrack.com', name: 'Sarah Worker' },
  { email: 'admin@buildtrack.com', name: 'Alex Administrator' },
  { email: 'dennis@buildtrack.com', name: 'Dennis' },
  { email: 'lisa@eliteelectric.com', name: 'Lisa Martinez' },
  { email: 'admin@eliteelectric.com', name: 'Mike Johnson' }
];

async function resetAllPasswords() {
  console.log('🔧 Resetting passwords for all test users...\n');
  
  try {
    // Get all auth users
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }
    
    let successCount = 0;
    
    for (const testUser of TEST_USERS) {
      const authUser = authUsers.users.find(u => u.email === testUser.email);
      
      if (!authUser) {
        console.log(`❌ ${testUser.email} - User not found in auth`);
        continue;
      }
      
      const { error } = await supabase.auth.admin.updateUserById(authUser.id, { 
        password: 'password123' 
      });
      
      if (error) {
        console.log(`❌ ${testUser.email} - Error: ${error.message}`);
      } else {
        console.log(`✅ ${testUser.email} (${testUser.name}) - Password reset`);
        successCount++;
      }
    }
    
    console.log(`\n🎉 Password reset completed! ${successCount}/${TEST_USERS.length} users updated`);
    console.log('🔐 All users now use password: "password123"');
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
resetAllPasswords().catch(console.error);


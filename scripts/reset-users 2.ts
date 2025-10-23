#!/usr/bin/env tsx

/**
 * Reset Users Script
 * This script will:
 * 1. Clear all user data from Supabase
 * 2. Reinitialize with the same 6 users from mock data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please check your .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock users data with correct UUIDs from database
const MOCK_USERS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "manager@buildtrack.com",
    name: "John Manager",
    role: "manager",
    company_id: "4abcba7d-e25a-403f-af39-9e36ee6395b1", // BuildTrack Construction Inc.
    position: "Project Manager",
    phone: "555-0101",
    created_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222", 
    email: "worker@buildtrack.com",
    name: "Sarah Worker",
    role: "worker",
    company_id: "4abcba7d-e25a-403f-af39-9e36ee6395b1", // BuildTrack Construction Inc.
    position: "Construction Worker",
    phone: "555-0102",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "admin@buildtrack.com", 
    name: "Alex Administrator",
    role: "admin",
    company_id: "4abcba7d-e25a-403f-af39-9e36ee6395b1", // BuildTrack Construction Inc.
    position: "System Administrator",
    phone: "555-0103",
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "lisa@eliteelectric.com",
    name: "Lisa Martinez",
    role: "worker",
    company_id: "d89378c4-939f-4ae9-a4e2-97d366ccb82a", // Elite Electric Co.
    position: "Electrician",
    phone: "555-0104",
    created_at: new Date().toISOString(),
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "admin@eliteelectric.com",
    name: "Mike Johnson",
    role: "admin",
    company_id: "d89378c4-939f-4ae9-a4e2-97d366ccb82a", // Elite Electric Co.
    position: "Operations Manager",
    phone: "555-0105",
    created_at: new Date().toISOString(),
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    email: "dennis@buildtrack.com",
    name: "Dennis",
    role: "worker",
    company_id: "4abcba7d-e25a-403f-af39-9e36ee6395b1", // BuildTrack Construction Inc.
    position: "Site Supervisor",
    phone: "555-0106",
    created_at: new Date().toISOString(),
  },
];

function logProgress(message: string, status: 'start' | 'success' | 'error' | 'info' = 'start', details?: string) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const statusIcon = {
    start: '🔄',
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }[status];
  
  console.log(`${statusIcon} [${timestamp}] ${message}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

async function clearAllUsers() {
  logProgress('Clearing all users from database', 'start');
  
  try {
    // First, check how many users exist
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    logProgress(`Found ${userCount} users to delete`, 'info');
    
    if (userCount === 0) {
      logProgress('No users to delete', 'info');
      return;
    }
    
    // Clear related data first to avoid foreign key constraints
    
    // 1. Clear tasks that reference users
    logProgress('Clearing tasks with user references', 'start');
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (tasksError) {
      logProgress('Warning: Could not clear tasks', 'error', tasksError.message);
    } else {
      logProgress('Tasks cleared successfully', 'success');
    }
    
    // 2. Clear user project assignments
    logProgress('Clearing user project assignments', 'start');
    const { error: assignmentsError } = await supabase
      .from('user_project_assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (assignmentsError) {
      logProgress('Warning: Could not clear assignments', 'error', assignmentsError.message);
    } else {
      logProgress('User project assignments cleared successfully', 'success');
    }
    
    // 3. Update projects to remove user references
    logProgress('Clearing user references from projects', 'start');
    const { error: projectsError } = await supabase
      .from('projects')
      .update({ created_by: null })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (projectsError) {
      logProgress('Warning: Could not clear project references', 'error', projectsError.message);
    } else {
      logProgress('Project user references cleared successfully', 'success');
    }
    
    // 4. Now delete all users
    logProgress('Deleting all users', 'start');
    const { error } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all users
    
    if (error) {
      throw error;
    }
    
    logProgress('All users cleared successfully', 'success');
    
  } catch (error: any) {
    logProgress('Error clearing users', 'error', error.message);
    throw error;
  }
}

async function seedUsers() {
  logProgress('Seeding users', 'start');
  
  try {
    // Insert the 6 mock users
    const { data, error } = await supabase
      .from('users')
      .insert(MOCK_USERS)
      .select();
    
    if (error) {
      throw error;
    }
    
    logProgress('Users seeded successfully', 'success', `${data.length} users created`);
    
    // Log the created users
    console.log('\n📋 Created Users:');
    data.forEach(user => {
      console.log(`   - ${user.name} (${user.role}) - ${user.email} - Company: ${user.company_id}`);
    });
    
  } catch (error: any) {
    logProgress('Error seeding users', 'error', error.message);
    throw error;
  }
}

async function verifyUsers() {
  logProgress('Verifying user data', 'start');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, company_id')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    logProgress('User verification complete', 'success', `Total users: ${users.length}`);
    
    // Group by company
    const companyGroups: { [key: string]: any[] } = {};
    users.forEach(user => {
      const companyId = user.company_id;
      if (!companyGroups[companyId]) {
        companyGroups[companyId] = [];
      }
      companyGroups[companyId].push(user);
    });
    
    console.log('\n📊 Users by Company:');
    Object.entries(companyGroups).forEach(([companyId, companyUsers]) => {
      console.log(`   Company ${companyId}: ${companyUsers.length} users`);
      companyUsers.forEach(user => {
        console.log(`     - ${user.name} (${user.role})`);
      });
    });
    
    // Verify expected counts
    const comp1Users = companyGroups['comp-1']?.length || 0;
    const comp2Users = companyGroups['comp-2']?.length || 0;
    
    console.log('\n🎯 Expected Results:');
    console.log(`   BuildTrack (comp-1): ${comp1Users} users (expected: 4)`);
    console.log(`   Elite Electric (comp-2): ${comp2Users} users (expected: 2)`);
    console.log(`   Total: ${users.length} users (expected: 6)`);
    
    if (comp1Users === 4 && comp2Users === 2 && users.length === 6) {
      logProgress('✅ All user counts are correct!', 'success');
    } else {
      logProgress('⚠️ User counts do not match expected values', 'error');
    }
    
  } catch (error: any) {
    logProgress('Error verifying users', 'error', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting User Reset Process...\n');
  
  try {
    // Step 1: Clear all users
    await clearAllUsers();
    
    // Step 2: Seed with 6 users
    await seedUsers();
    
    // Step 3: Verify the data
    await verifyUsers();
    
    console.log('\n🎉 User reset completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Restart your app to clear any cached data');
    console.log('   2. Check the admin dashboard - user count should now be correct');
    console.log('   3. Login as admin@buildtrack.com (should see 4 users)');
    console.log('   4. Login as admin@eliteelectric.com (should see 2 users)');
    
  } catch (error: any) {
    console.error('\n💥 User reset failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

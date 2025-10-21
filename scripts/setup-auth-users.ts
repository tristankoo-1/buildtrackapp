#!/usr/bin/env tsx

/**
 * Setup Auth Users Script
 * 
 * This script creates all the test users in Supabase Auth with the correct credentials
 * to match the login screen. It creates users in both Supabase Auth and the users table.
 * 
 * Usage:
 * 1. Make sure your Supabase database is set up with the schema
 * 2. Run: npx tsx scripts/setup-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users from the login screen
const TEST_USERS = [
  {
    id: "1",
    email: "manager@buildtrack.com",
    name: "John Manager",
    role: "manager",
    companyId: "comp-1",
    position: "Project Manager",
    phone: "555-0101",
    password: "password123"
  },
  {
    id: "2", 
    email: "worker@buildtrack.com",
    name: "Sarah Worker",
    role: "worker",
    companyId: "comp-1",
    position: "Construction Worker",
    phone: "555-0102",
    password: "password123"
  },
  {
    id: "3",
    email: "admin@buildtrack.com", 
    name: "Alex Administrator",
    role: "admin",
    companyId: "comp-1",
    position: "System Administrator",
    phone: "555-0103",
    password: "password123"
  },
  {
    id: "4",
    email: "lisa@eliteelectric.com",
    name: "Lisa Martinez",
    role: "worker",
    companyId: "comp-2",
    position: "Electrician",
    phone: "555-0104",
    password: "password123"
  },
  {
    id: "5",
    email: "admin@eliteelectric.com",
    name: "Mike Johnson",
    role: "admin",
    companyId: "comp-2",
    position: "Operations Manager",
    phone: "555-0105",
    password: "password123"
  },
  {
    id: "6",
    email: "dennis@buildtrack.com",
    name: "Dennis",
    role: "worker",
    companyId: "comp-1",
    position: "Site Supervisor",
    phone: "555-0106",
    password: "password123"
  }
];

async function setupAuthUsers() {
  console.log('🚀 Setting up auth users in Supabase...\n');

  try {
    // First, let's check if companies exist
    console.log('📋 Checking companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError.message);
      return;
    }

    console.log(`✅ Found ${companies.length} companies`);
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.id})`);
    });

    const results = [];

    for (const user of TEST_USERS) {
      try {
        console.log(`\n👤 Setting up user: ${user.name} (${user.email})`);
        
        // Check if user already exists in auth
        const { data: existingAuth } = await supabase.auth.admin.getUserByEmail(user.email);
        
        if (existingAuth.user) {
          console.log(`   ⚠️  User already exists in auth, skipping auth creation`);
        } else {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
              name: user.name,
              phone: user.phone,
              company_id: user.companyId,
              position: user.position,
              role: user.role,
            }
          });

          if (authError) {
            console.error(`   ❌ Auth error:`, authError.message);
            results.push({ user: user.name, success: false, error: authError.message });
            continue;
          }

          console.log(`   ✅ Created auth user`);
        }

        // Check if user exists in users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingUser) {
          console.log(`   ⚠️  User already exists in users table, skipping`);
          results.push({ user: user.name, success: true, message: 'Already exists' });
          continue;
        }

        // Get the auth user ID
        const { data: authUser } = await supabase.auth.admin.getUserByEmail(user.email);
        
        if (!authUser.user) {
          console.error(`   ❌ Could not find auth user`);
          results.push({ user: user.name, success: false, error: 'Auth user not found' });
          continue;
        }

        // Create user record in users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company_id: user.companyId,
            position: user.position,
            phone: user.phone,
          });

        if (userError) {
          console.error(`   ❌ Users table error:`, userError.message);
          results.push({ user: user.name, success: false, error: userError.message });
          continue;
        }

        console.log(`   ✅ Created user record`);
        results.push({ user: user.name, success: true, email: user.email });

      } catch (error: any) {
        console.error(`   ❌ Unexpected error:`, error.message);
        results.push({ user: user.name, success: false, error: error.message });
      }
    }

    // Print summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎉 Successfully Setup Users:');
      successful.forEach(result => {
        console.log(`   ✅ ${result.user}${result.email ? ` (${result.email})` : ''}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Setup:');
      failed.forEach(result => {
        console.log(`   ❌ ${result.user}: ${result.error}`);
      });
    }
    
    console.log('\n🔐 All users use password: "password123"');
    console.log('📱 Users can now log in through the app!');

  } catch (error: any) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
setupAuthUsers().catch(console.error);
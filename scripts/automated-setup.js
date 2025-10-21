#!/usr/bin/env node

/**
 * Automated Supabase Setup Script
 * 
 * This script automatically:
 * 1. Creates companies in the database
 * 2. Creates auth users in Supabase Auth
 * 3. Creates user records in the users table
 * 4. Sets up the complete authentication system
 * 
 * Usage:
 * 1. Make sure you have Node.js installed
 * 2. Run: node scripts/automated-setup.js
 * 3. Or: npm run setup-auth
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test data
const COMPANIES = [
  {
    id: 'comp-1',
    name: 'BuildTrack Construction Inc.',
    type: 'general_contractor',
    description: 'Leading general contractor specializing in commercial projects',
    email: 'contact@buildtrack.com',
    phone: '555-0100',
    website: 'https://buildtrack.com',
    licenseNumber: 'GC-123456',
    isActive: true
  },
  {
    id: 'comp-2',
    name: 'Elite Electric Co.',
    type: 'subcontractor',
    description: 'Professional electrical services',
    email: 'info@eliteelectric.com',
    phone: '555-0200',
    website: 'https://eliteelectric.com',
    licenseNumber: 'EC-789012',
    isActive: true
  }
];

const TEST_USERS = [
  {
    email: 'manager@buildtrack.com',
    name: 'John Manager',
    role: 'manager',
    companyId: 'comp-1',
    position: 'Project Manager',
    phone: '555-0101',
    password: 'password123'
  },
  {
    email: 'worker@buildtrack.com',
    name: 'Sarah Worker',
    role: 'worker',
    companyId: 'comp-1',
    position: 'Construction Worker',
    phone: '555-0102',
    password: 'password123'
  },
  {
    email: 'admin@buildtrack.com',
    name: 'Alex Administrator',
    role: 'admin',
    companyId: 'comp-1',
    position: 'System Administrator',
    phone: '555-0103',
    password: 'password123'
  },
  {
    email: 'dennis@buildtrack.com',
    name: 'Dennis',
    role: 'worker',
    companyId: 'comp-1',
    position: 'Site Supervisor',
    phone: '555-0106',
    password: 'password123'
  },
  {
    email: 'lisa@eliteelectric.com',
    name: 'Lisa Martinez',
    role: 'worker',
    companyId: 'comp-2',
    position: 'Electrician',
    phone: '555-0104',
    password: 'password123'
  },
  {
    email: 'admin@eliteelectric.com',
    name: 'Mike Johnson',
    role: 'admin',
    companyId: 'comp-2',
    position: 'Operations Manager',
    phone: '555-0105',
    password: 'password123'
  }
];

// Utility functions
function logStep(step, status, details = '') {
  const icons = {
    start: '🔄',
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  const statusText = {
    start: 'Starting',
    success: 'Completed',
    error: 'Failed',
    info: 'Info'
  };
  
  console.log(`${icons[status]} ${step} - ${statusText[status]}${details ? `: ${details}` : ''}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main setup functions
async function setupCompanies() {
  logStep('Setting up companies', 'start');
  
  const companyMap = new Map();
  
  for (const company of COMPANIES) {
    try {
      // Check if company already exists
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('id', company.id)
        .single();
      
      if (existing) {
        logStep(`Company ${company.name}`, 'info', 'already exists');
        companyMap.set(company.id, existing.id);
        continue;
      }
      
      // Create company
      const { data, error } = await supabase
        .from('companies')
        .insert({
          id: company.id,
          name: company.name,
          type: company.type,
          description: company.description,
          email: company.email,
          phone: company.phone,
          website: company.website,
          license_number: company.licenseNumber,
          is_active: company.isActive,
          banner: {
            text: company.name,
            backgroundColor: "#3b82f6",
            textColor: "#ffffff",
            isVisible: true
          }
        })
        .select('id')
        .single();
      
      if (error) {
        logStep(`Company ${company.name}`, 'error', error.message);
        continue;
      }
      
      logStep(`Company ${company.name}`, 'success', `created with ID: ${data.id}`);
      companyMap.set(company.id, data.id);
      
    } catch (error) {
      logStep(`Company ${company.name}`, 'error', error.message);
    }
  }
  
  logStep('Setting up companies', 'success', `${companyMap.size} companies ready`);
  return companyMap;
}

async function setupAuthUsers() {
  logStep('Setting up auth users', 'start');
  
  const authUserMap = new Map();
  
  for (const user of TEST_USERS) {
    try {
      // Check if auth user already exists
      const { data: existingAuth } = await supabase.auth.admin.getUserByEmail(user.email);
      
      if (existingAuth.user) {
        logStep(`Auth user ${user.name}`, 'info', 'already exists');
        authUserMap.set(user.email, existingAuth.user.id);
        continue;
      }
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          phone: user.phone,
          company_id: user.companyId,
          position: user.position,
          role: user.role,
        }
      });
      
      if (authError) {
        logStep(`Auth user ${user.name}`, 'error', authError.message);
        continue;
      }
      
      logStep(`Auth user ${user.name}`, 'success', `created with ID: ${authData.user.id}`);
      authUserMap.set(user.email, authData.user.id);
      
      // Small delay to avoid rate limiting
      await delay(100);
      
    } catch (error) {
      logStep(`Auth user ${user.name}`, 'error', error.message);
    }
  }
  
  logStep('Setting up auth users', 'success', `${authUserMap.size} auth users ready`);
  return authUserMap;
}

async function setupUserRecords(companyMap, authUserMap) {
  logStep('Setting up user records', 'start');
  
  let successCount = 0;
  
  for (const user of TEST_USERS) {
    try {
      const authUserId = authUserMap.get(user.email);
      const companyId = companyMap.get(user.companyId);
      
      if (!authUserId) {
        logStep(`User record ${user.name}`, 'error', 'no auth user ID found');
        continue;
      }
      
      if (!companyId) {
        logStep(`User record ${user.name}`, 'error', 'no company ID found');
        continue;
      }
      
      // Check if user record already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (existing) {
        logStep(`User record ${user.name}`, 'info', 'already exists');
        successCount++;
        continue;
      }
      
      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          name: user.name,
          email: user.email,
          role: user.role,
          company_id: companyId,
          position: user.position,
          phone: user.phone,
        });
      
      if (userError) {
        logStep(`User record ${user.name}`, 'error', userError.message);
        continue;
      }
      
      logStep(`User record ${user.name}`, 'success', 'created successfully');
      successCount++;
      
    } catch (error) {
      logStep(`User record ${user.name}`, 'error', error.message);
    }
  }
  
  logStep('Setting up user records', 'success', `${successCount} user records ready`);
  return successCount;
}

async function verifySetup() {
  logStep('Verifying setup', 'start');
  
  try {
    // Check companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      logStep('Verification', 'error', `Companies check failed: ${companiesError.message}`);
      return false;
    }
    
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role');
    
    if (usersError) {
      logStep('Verification', 'error', `Users check failed: ${usersError.message}`);
      return false;
    }
    
    // Check auth users
    const authUsers = [];
    for (const user of TEST_USERS) {
      const { data: authUser } = await supabase.auth.admin.getUserByEmail(user.email);
      if (authUser.user) {
        authUsers.push(authUser.user);
      }
    }
    
    logStep('Verification', 'success', `Found ${companies.length} companies, ${users.length} users, ${authUsers.length} auth users`);
    
    console.log('\n📊 Setup Summary:');
    console.log('='.repeat(50));
    console.log(`Companies: ${companies.length}`);
    companies.forEach(company => {
      console.log(`  - ${company.name} (${company.id})`);
    });
    
    console.log(`\nUsers: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log(`\nAuth Users: ${authUsers.length}`);
    authUsers.forEach(authUser => {
      console.log(`  - ${authUser.email} (${authUser.id})`);
    });
    
    return true;
    
  } catch (error) {
    logStep('Verification', 'error', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting automated Supabase setup...\n');
  
  try {
    // Step 1: Setup companies
    const companyMap = await setupCompanies();
    
    // Step 2: Setup auth users
    const authUserMap = await setupAuthUsers();
    
    // Step 3: Setup user records
    const userRecordCount = await setupUserRecords(companyMap, authUserMap);
    
    // Step 4: Verify setup
    const verificationSuccess = await verifySetup();
    
    if (verificationSuccess) {
      console.log('\n🎉 Automated setup completed successfully!');
      console.log('\n🔐 Login Credentials:');
      console.log('All users use password: "password123"');
      console.log('\n📱 Available Users:');
      TEST_USERS.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
      console.log('\n✨ You can now test login in your app!');
    } else {
      console.log('\n❌ Setup completed with errors. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, setupCompanies, setupAuthUsers, setupUserRecords, verifySetup };

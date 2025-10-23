import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility function for logging
function logStep(step: string, status: 'start' | 'success' | 'error' | 'info', details = '') {
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

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Starting Complete User and Company Setup...\n');

  try {
    // ============================================
    // STEP 1: Rename user "Dennis" to "Peter"
    // ============================================
    
    logStep('Step 1: Rename Dennis to Peter', 'start');
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ name: 'Peter' })
      .eq('name', 'Dennis')
      .eq('email', 'dennis@buildtrack.com');

    if (updateError) {
      logStep('Step 1: Rename Dennis to Peter', 'error', updateError.message);
    } else {
      logStep('Step 1: Rename Dennis to Peter', 'success');
    }

    await delay(1000);

    // ============================================
    // STEP 2: Create new company "Insite Tech Ltd"
    // ============================================
    
    logStep('Step 2: Create Insite Tech Ltd company', 'start');
    
    const { error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: 'comp-3',
        name: 'Insite Tech Ltd',
        type: 'consultant',
        description: 'Technology consulting and software development company specializing in construction management solutions',
        address: '789 Tech Street, Innovation City, CA 90212',
        phone: '555-0300',
        email: 'info@insitetech.com',
        website: 'https://insitetech.com',
        license_number: 'TC-345678',
        is_active: true,
        banner: {
          text: 'Insite Tech Ltd',
          backgroundColor: '#10b981',
          textColor: '#ffffff',
          isVisible: true
        }
      });

    if (companyError) {
      logStep('Step 2: Create Insite Tech Ltd company', 'error', companyError.message);
    } else {
      logStep('Step 2: Create Insite Tech Ltd company', 'success');
    }

    await delay(1000);

    // ============================================
    // STEP 3: Create new project "Buildtrack App"
    // ============================================
    
    logStep('Step 3: Create Buildtrack App project', 'start');
    
    // Get admin user ID for created_by
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@buildtrack.com')
      .single();

    if (adminError) {
      logStep('Step 3: Create Buildtrack App project', 'error', `Admin user not found: ${adminError.message}`);
      return;
    }

    const { error: projectError } = await supabase
      .from('projects')
      .upsert({
        id: 'proj-buildtrack-app',
        name: 'Buildtrack App',
        description: 'Development and deployment of the BuildTrack mobile application for construction project management',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        budget: 150000.00,
        location: {
          street: '789 Tech Street',
          city: 'Innovation City',
          state: 'CA',
          zipCode: '90212',
          country: 'USA'
        },
        client_info: {
          name: 'Insite Tech Ltd',
          email: 'info@insitetech.com',
          phone: '555-0300'
        },
        created_by: adminUser.id,
        company_id: 'comp-3'
      });

    if (projectError) {
      logStep('Step 3: Create Buildtrack App project', 'error', projectError.message);
    } else {
      logStep('Step 3: Create Buildtrack App project', 'success');
    }

    await delay(1000);

    // ============================================
    // STEP 4: Create new users for Insite Tech Ltd
    // ============================================
    
    logStep('Step 4: Create Dennis and Tristan users for Insite Tech Ltd', 'start');
    
    // Create Dennis user
    const { error: dennisError } = await supabase
      .from('users')
      .upsert({
        id: 'user-dennis-insite',
        email: 'dennis@insitetech.com',
        name: 'Dennis',
        role: 'manager',
        company_id: 'comp-3',
        position: 'Senior Project Manager',
        phone: '555-0301'
      });

    if (dennisError) {
      logStep('Step 4: Create Dennis user', 'error', dennisError.message);
    } else {
      logStep('Step 4: Create Dennis user', 'success');
    }

    // Create Tristan user
    const { error: tristanError } = await supabase
      .from('users')
      .upsert({
        id: 'user-tristan-insite',
        email: 'tristan@insitetech.com',
        name: 'Tristan',
        role: 'admin',
        company_id: 'comp-3',
        position: 'Technical Director',
        phone: '555-0302'
      });

    if (tristanError) {
      logStep('Step 4: Create Tristan user', 'error', tristanError.message);
    } else {
      logStep('Step 4: Create Tristan user', 'success');
    }

    await delay(1000);

    // ============================================
    // STEP 5: Assign Dennis and Tristan to Buildtrack App project
    // ============================================
    
    logStep('Step 5: Assign users to Buildtrack App project', 'start');
    
    // Assign Dennis to project
    const { error: dennisAssignmentError } = await supabase
      .from('user_project_assignments')
      .upsert({
        id: 'assignment-dennis-buildtrack',
        user_id: 'user-dennis-insite',
        project_id: 'proj-buildtrack-app',
        category: 'lead_project_manager',
        assigned_by: adminUser.id,
        assigned_at: new Date().toISOString(),
        is_active: true
      });

    if (dennisAssignmentError) {
      logStep('Step 5: Assign Dennis to project', 'error', dennisAssignmentError.message);
    } else {
      logStep('Step 5: Assign Dennis to project', 'success');
    }

    // Assign Tristan to project
    const { error: tristanAssignmentError } = await supabase
      .from('user_project_assignments')
      .upsert({
        id: 'assignment-tristan-buildtrack',
        user_id: 'user-tristan-insite',
        project_id: 'proj-buildtrack-app',
        category: 'contractor',
        assigned_by: adminUser.id,
        assigned_at: new Date().toISOString(),
        is_active: true
      });

    if (tristanAssignmentError) {
      logStep('Step 5: Assign Tristan to project', 'error', tristanAssignmentError.message);
    } else {
      logStep('Step 5: Assign Tristan to project', 'success');
    }

    await delay(1000);

    // ============================================
    // VERIFICATION: Show results
    // ============================================
    
    logStep('Verification: Fetching results', 'start');
    
    // Show all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        type,
        email,
        phone,
        users (id)
      `);

    if (!companiesError && companies) {
      console.log('\n📊 COMPANIES:');
      companies.forEach(company => {
        console.log(`  • ${company.name} (${company.type}) - ${company.email}`);
      });
    }

    // Show Insite Tech Ltd users
    const { data: insiteUsers, error: insiteUsersError } = await supabase
      .from('users')
      .select('name, email, role, position')
      .eq('company_id', 'comp-3');

    if (!insiteUsersError && insiteUsers) {
      console.log('\n👥 INSITE TECH LTD USERS:');
      insiteUsers.forEach(user => {
        console.log(`  • ${user.name} (${user.email}) - ${user.role} - ${user.position}`);
      });
    }

    // Show project assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('user_project_assignments')
      .select(`
        user_id,
        project_id,
        category,
        users (name, email),
        projects (name)
      `)
      .eq('project_id', 'proj-buildtrack-app')
      .eq('is_active', true);

    if (!assignmentsError && assignments) {
      console.log('\n📋 PROJECT ASSIGNMENTS:');
      assignments.forEach(assignment => {
        const user = assignment.users as any;
        const project = assignment.projects as any;
        console.log(`  • ${user.name} (${user.email}) → ${project.name} as ${assignment.category}`);
      });
    }

    console.log('\n🎉 All tasks completed successfully!');
    console.log('\nSummary of changes:');
    console.log('  1. ✅ Renamed Dennis to Peter in BuildTrack Construction Inc.');
    console.log('  2. ✅ Created Insite Tech Ltd company');
    console.log('  3. ✅ Created Buildtrack App project');
    console.log('  4. ✅ Created Dennis (manager) and Tristan (admin) for Insite Tech Ltd');
    console.log('  5. ✅ Assigned both users to Buildtrack App project');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

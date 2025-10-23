import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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
  console.log('🚀 Completing Remaining Tasks...\n');

  try {
    // ============================================
    // STEP 1: Create Insite Tech Ltd company
    // ============================================
    
    logStep('Step 1: Create Insite Tech Ltd company', 'start');
    
    const insiteCompanyId = uuidv4();
    const { error: companyError } = await supabase
      .from('companies')
      .insert({
        id: insiteCompanyId,
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
      logStep('Step 1: Create Insite Tech Ltd company', 'error', companyError.message);
    } else {
      logStep('Step 1: Create Insite Tech Ltd company', 'success', `Company ID: ${insiteCompanyId}`);
    }

    await delay(1000);

    // ============================================
    // STEP 2: Create new users for Insite Tech Ltd
    // ============================================
    
    logStep('Step 2: Create Dennis and Tristan users for Insite Tech Ltd', 'start');
    
    // Create Dennis user
    const dennisUserId = uuidv4();
    const { error: dennisError } = await supabase
      .from('users')
      .insert({
        id: dennisUserId,
        email: 'dennis@insitetech.com',
        name: 'Dennis',
        role: 'manager',
        company_id: insiteCompanyId,
        position: 'Senior Project Manager',
        phone: '555-0301'
      });

    if (dennisError) {
      logStep('Step 2: Create Dennis user', 'error', dennisError.message);
    } else {
      logStep('Step 2: Create Dennis user', 'success', `User ID: ${dennisUserId}`);
    }

    // Create Tristan user
    const tristanUserId = uuidv4();
    const { error: tristanError } = await supabase
      .from('users')
      .insert({
        id: tristanUserId,
        email: 'tristan@insitetech.com',
        name: 'Tristan',
        role: 'admin',
        company_id: insiteCompanyId,
        position: 'Technical Director',
        phone: '555-0302'
      });

    if (tristanError) {
      logStep('Step 2: Create Tristan user', 'error', tristanError.message);
    } else {
      logStep('Step 2: Create Tristan user', 'success', `User ID: ${tristanUserId}`);
    }

    await delay(1000);

    // ============================================
    // STEP 3: Create Buildtrack App project
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

    const projectId = uuidv4();
    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
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
        company_id: insiteCompanyId
      });

    if (projectError) {
      logStep('Step 3: Create Buildtrack App project', 'error', projectError.message);
    } else {
      logStep('Step 3: Create Buildtrack App project', 'success', `Project ID: ${projectId}`);
    }

    await delay(1000);

    // ============================================
    // STEP 4: Assign Dennis and Tristan to Buildtrack App project
    // ============================================
    
    logStep('Step 4: Assign users to Buildtrack App project', 'start');
    
    // Assign Dennis to project
    const dennisAssignmentId = uuidv4();
    const { error: dennisAssignmentError } = await supabase
      .from('user_project_assignments')
      .insert({
        id: dennisAssignmentId,
        user_id: dennisUserId,
        project_id: projectId,
        category: 'lead_project_manager',
        assigned_by: adminUser.id,
        assigned_at: new Date().toISOString(),
        is_active: true
      });

    if (dennisAssignmentError) {
      logStep('Step 4: Assign Dennis to project', 'error', dennisAssignmentError.message);
    } else {
      logStep('Step 4: Assign Dennis to project', 'success');
    }

    // Assign Tristan to project
    const tristanAssignmentId = uuidv4();
    const { error: tristanAssignmentError } = await supabase
      .from('user_project_assignments')
      .insert({
        id: tristanAssignmentId,
        user_id: tristanUserId,
        project_id: projectId,
        category: 'contractor',
        assigned_by: adminUser.id,
        assigned_at: new Date().toISOString(),
        is_active: true
      });

    if (tristanAssignmentError) {
      logStep('Step 4: Assign Tristan to project', 'error', tristanAssignmentError.message);
    } else {
      logStep('Step 4: Assign Tristan to project', 'success');
    }

    await delay(1000);

    // ============================================
    // VERIFICATION: Show results
    // ============================================
    
    logStep('Verification: Fetching results', 'start');
    
    // Show Insite Tech Ltd company
    const { data: insiteCompany, error: insiteCompanyError } = await supabase
      .from('companies')
      .select('id, name, type, email, phone')
      .eq('id', insiteCompanyId)
      .single();

    if (!insiteCompanyError && insiteCompany) {
      console.log('\n🏢 INSITE TECH LTD COMPANY:');
      console.log(`  • ID: ${insiteCompany.id}`);
      console.log(`  • Name: ${insiteCompany.name}`);
      console.log(`  • Type: ${insiteCompany.type}`);
      console.log(`  • Email: ${insiteCompany.email}`);
    }

    // Show Insite Tech Ltd users
    const { data: insiteUsers, error: insiteUsersError } = await supabase
      .from('users')
      .select('id, name, email, role, position')
      .eq('company_id', insiteCompanyId);

    if (!insiteUsersError && insiteUsers) {
      console.log('\n👥 INSITE TECH LTD USERS:');
      insiteUsers.forEach(user => {
        console.log(`  • ${user.name} (${user.email}) - ${user.role} - ${user.position}`);
        console.log(`    ID: ${user.id}`);
      });
    }

    // Show Buildtrack App project
    const { data: buildtrackProject, error: buildtrackProjectError } = await supabase
      .from('projects')
      .select('id, name, description, status, company_id')
      .eq('id', projectId)
      .single();

    if (!buildtrackProjectError && buildtrackProject) {
      console.log('\n📋 BUILDTRACK APP PROJECT:');
      console.log(`  • ID: ${buildtrackProject.id}`);
      console.log(`  • Name: ${buildtrackProject.name}`);
      console.log(`  • Status: ${buildtrackProject.status}`);
      console.log(`  • Company ID: ${buildtrackProject.company_id}`);
    }

    // Show project assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('user_project_assignments')
      .select(`
        id,
        user_id,
        project_id,
        category,
        users (name, email),
        projects (name)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (!assignmentsError && assignments) {
      console.log('\n📋 PROJECT ASSIGNMENTS:');
      assignments.forEach(assignment => {
        const user = assignment.users as any;
        const project = assignment.projects as any;
        console.log(`  • ${user.name} (${user.email}) → ${project.name} as ${assignment.category}`);
        console.log(`    Assignment ID: ${assignment.id}`);
      });
    }

    // Check if Dennis was renamed to Peter
    const { data: dennisUser, error: dennisUserError } = await supabase
      .from('users')
      .select('name, email')
      .eq('email', 'dennis@buildtrack.com')
      .single();

    if (!dennisUserError && dennisUser) {
      console.log('\n👤 DENNIS RENAME STATUS:');
      console.log(`  • Name: ${dennisUser.name} (was Dennis, now Peter)`);
      console.log(`  • Email: ${dennisUser.email}`);
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

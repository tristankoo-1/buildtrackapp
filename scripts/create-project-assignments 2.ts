import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createProjectAssignments() {
  console.log('\n🔧 Creating project assignments for all users...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at');

    if (usersError) throw usersError;

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status')
      .order('created_at');

    if (projectsError) throw projectsError;

    console.log(`👥 Found ${users.length} users and ${projects.length} projects\n`);

    // Create assignments for each user-project combination
    const assignments = [];
    
    for (const user of users) {
      console.log(`👤 Creating assignments for ${user.name} (${user.role})`);
      
      for (const project of projects) {
        // Determine assignment category based on user role
        let category = 'member';
        if (user.role === 'admin') {
          category = 'lead_project_manager';
        } else if (user.role === 'manager') {
          category = 'lead_project_manager';
        } else if (user.role === 'worker') {
          category = 'member';
        }

        assignments.push({
          user_id: user.id,
          project_id: project.id,
          category: category,
          assigned_by: user.id, // Self-assigned for now
          assigned_at: new Date().toISOString()
        });

        console.log(`   ✅ ${project.name} (${category})`);
      }
      console.log('');
    }

    console.log(`📊 Total assignments to create: ${assignments.length}\n`);

    // Insert all assignments at once
    const { error: insertError } = await supabase
      .from('user_project_assignments')
      .insert(assignments);

    if (insertError) {
      console.error('❌ Error inserting assignments:', insertError.message);
      
      // Try inserting one by one to see which ones fail
      console.log('\n🔄 Trying individual inserts...');
      let successCount = 0;
      let failCount = 0;
      
      for (const assignment of assignments) {
        const { error: singleError } = await supabase
          .from('user_project_assignments')
          .insert(assignment);
          
        if (singleError) {
          console.log(`❌ Failed: User ${assignment.user_id} -> Project ${assignment.project_id}: ${singleError.message}`);
          failCount++;
        } else {
          successCount++;
        }
      }
      
      console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed`);
    } else {
      console.log('✅ All assignments created successfully!');
    }

    // Verify assignments
    console.log('\n🔍 Verifying assignments...');
    const { data: allAssignments, error: verifyError } = await supabase
      .from('user_project_assignments')
      .select('*')
      .order('user_id');

    if (verifyError) {
      console.log('❌ Error verifying:', verifyError.message);
    } else {
      console.log(`✅ Total assignments in database: ${allAssignments.length}`);
      
      // Group by user
      const assignmentsByUser = allAssignments.reduce((acc, assignment) => {
        if (!acc[assignment.user_id]) {
          acc[assignment.user_id] = [];
        }
        acc[assignment.user_id].push(assignment);
        return acc;
      }, {} as Record<string, any[]>);

      console.log('\n📋 Assignments by user:');
      for (const [userId, userAssignments] of Object.entries(assignmentsByUser)) {
        const user = users.find(u => u.id === userId);
        console.log(`   ${user?.name || userId}: ${userAssignments.length} projects`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

createProjectAssignments();


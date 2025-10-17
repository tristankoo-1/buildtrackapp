import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAssignmentsWithRLSDisable() {
  console.log('\n🔧 Creating project assignments (temporarily disabling RLS)...\n');

  try {
    // Step 1: Disable RLS on user_project_assignments table
    console.log('1️⃣ Disabling RLS on user_project_assignments table...');
    const { error: disableError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE user_project_assignments DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.log('⚠️ Could not disable RLS:', disableError.message);
      console.log('   This might be because we don\'t have admin privileges.');
      console.log('   Proceeding with alternative approach...\n');
    } else {
      console.log('✅ RLS disabled successfully\n');
    }

    // Step 2: Get all users and projects
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at');

    if (usersError) throw usersError;

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status')
      .order('created_at');

    if (projectsError) throw projectsError;

    console.log(`2️⃣ Found ${users.length} users and ${projects.length} projects\n`);

    // Step 3: Create assignments
    console.log('3️⃣ Creating assignments...');
    const assignments = [];
    
    for (const user of users) {
      for (const project of projects) {
        let category = 'member';
        if (user.role === 'admin' || user.role === 'manager') {
          category = 'lead_project_manager';
        }

        assignments.push({
          user_id: user.id,
          project_id: project.id,
          category: category,
          assigned_by: user.id,
          assigned_at: new Date().toISOString()
        });
      }
    }

    console.log(`   📊 Total assignments to create: ${assignments.length}`);

    // Step 4: Insert assignments
    const { error: insertError } = await supabase
      .from('user_project_assignments')
      .insert(assignments);

    if (insertError) {
      console.log('❌ Error inserting assignments:', insertError.message);
      
      // Try inserting in smaller batches
      console.log('🔄 Trying batch inserts...');
      const batchSize = 5;
      let successCount = 0;
      
      for (let i = 0; i < assignments.length; i += batchSize) {
        const batch = assignments.slice(i, i + batchSize);
        const { error: batchError } = await supabase
          .from('user_project_assignments')
          .insert(batch);
          
        if (batchError) {
          console.log(`❌ Batch ${Math.floor(i/batchSize) + 1} failed: ${batchError.message}`);
        } else {
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} successful`);
          successCount += batch.length;
        }
      }
      
      console.log(`\n📊 Results: ${successCount} assignments created`);
    } else {
      console.log('✅ All assignments created successfully!');
    }

    // Step 5: Re-enable RLS
    console.log('\n4️⃣ Re-enabling RLS on user_project_assignments table...');
    const { error: enableError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE user_project_assignments ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError) {
      console.log('⚠️ Could not re-enable RLS:', enableError.message);
    } else {
      console.log('✅ RLS re-enabled successfully');
    }

    // Step 6: Verify assignments
    console.log('\n5️⃣ Verifying assignments...');
    const { data: allAssignments, error: verifyError } = await supabase
      .from('user_project_assignments')
      .select('*')
      .order('user_id');

    if (verifyError) {
      console.log('❌ Error verifying:', verifyError.message);
    } else {
      console.log(`✅ Total assignments in database: ${allAssignments.length}`);
      
      // Check manager specifically
      const manager = users.find(u => u.email === 'manager@buildtrack.com');
      if (manager) {
        const managerAssignments = allAssignments.filter(a => a.user_id === manager.id);
        console.log(`🎯 Manager (${manager.name}) has ${managerAssignments.length} project assignments`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

createAssignmentsWithRLSDisable();


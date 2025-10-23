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

async function testStoreData() {
  console.log('🧪 Testing Store Data Access');
  console.log('============================\n');

  try {
    // Test tasks
    console.log('📋 Testing Tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, assigned_to, assigned_by')
      .limit(5);

    if (tasksError) {
      console.error('❌ Tasks error:', tasksError.message);
    } else {
      console.log(`✅ Found ${tasks?.length || 0} tasks`);
      tasks?.forEach(task => {
        console.log(`   - ${task.title} (assigned to: ${task.assigned_to?.length || 0} users)`);
      });
    }

    // Test users
    console.log('\n👥 Testing Users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5);

    if (usersError) {
      console.error('❌ Users error:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users`);
      users?.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - ${user.email}`);
      });
    }

    // Test projects
    console.log('\n🏗️  Testing Projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status')
      .limit(5);

    if (projectsError) {
      console.error('❌ Projects error:', projectsError.message);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects`);
      projects?.forEach(project => {
        console.log(`   - ${project.name} (${project.status})`);
      });
    }

    // Test specific manager user
    console.log('\n👤 Testing Manager User...');
    const { data: manager, error: managerError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', 'manager@buildtrack.com')
      .single();

    if (managerError) {
      console.error('❌ Manager error:', managerError.message);
    } else if (manager) {
      console.log(`✅ Found manager: ${manager.name} (ID: ${manager.id})`);
      
      // Test tasks assigned to manager
      const { data: managerTasks, error: managerTasksError } = await supabase
        .from('tasks')
        .select('id, title, assigned_to')
        .contains('assigned_to', [manager.id]);

      if (managerTasksError) {
        console.error('❌ Manager tasks error:', managerTasksError.message);
      } else {
        console.log(`✅ Manager has ${managerTasks?.length || 0} assigned tasks`);
        managerTasks?.forEach(task => {
          console.log(`   - ${task.title}`);
        });
      }
    } else {
      console.log('❌ Manager not found');
    }

    console.log('\n🎉 Store data test completed!');

  } catch (error: any) {
    console.error('❌ Test error:', error.message);
  }
}

testStoreData();


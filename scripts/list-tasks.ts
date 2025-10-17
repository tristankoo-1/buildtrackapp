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

async function listAllTasks() {
  console.log('📋 All Tasks in Supabase Database');
  console.log('=====================================\n');

  try {
    // Get all tasks with related data
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        priority,
        category,
        due_date,
        current_status,
        completion_percentage,
        accepted,
        created_at,
        assigned_to,
        assigned_by,
        projects!tasks_project_id_fkey (
          id,
          name,
          status
        ),
        users!tasks_assigned_by_fkey (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tasks:', error.message);
      return;
    }

    if (!tasks || tasks.length === 0) {
      console.log('📭 No tasks found in the database.');
      return;
    }

    console.log(`📊 Total Tasks: ${tasks.length}\n`);

    // Get user details for assigned_to arrays
    const { data: allUsers } = await supabase.from('users').select('id, name, email');
    const userMap = new Map<string, string>();
    allUsers?.forEach(user => {
      userMap.set(user.id, user.name);
    });

    // Display each task
    tasks.forEach((task, index) => {
      const project = task.projects as any;
      const assignedBy = task.users as any;
      
      // Get assigned user names
      const assignedToNames = task.assigned_to?.map((userId: string) => 
        userMap.get(userId) || 'Unknown User'
      ) || [];

      console.log(`${index + 1}. ${task.title}`);
      console.log(`   📝 Description: ${task.description}`);
      console.log(`   🏷️  Priority: ${task.priority}`);
      console.log(`   📂 Category: ${task.category}`);
      console.log(`   📅 Due Date: ${new Date(task.due_date).toLocaleDateString()}`);
      console.log(`   📊 Status: ${task.current_status}`);
      console.log(`   ✅ Completion: ${task.completion_percentage}%`);
      console.log(`   ✅ Accepted: ${task.accepted === null ? 'Pending' : task.accepted ? 'Yes' : 'No'}`);
      console.log(`   🏗️  Project: ${project?.name || 'Unknown'} (${project?.status || 'Unknown'})`);
      console.log(`   👤 Assigned By: ${assignedBy?.name || 'Unknown'} (${assignedBy?.email || 'Unknown'})`);
      console.log(`   👥 Assigned To: ${assignedToNames.join(', ')}`);
      console.log(`   📅 Created: ${new Date(task.created_at).toLocaleDateString()}`);
      console.log(`   🆔 Task ID: ${task.id}`);
      console.log('');
    });

    // Summary by status
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.current_status] = (acc[task.current_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Summary by Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} tasks`);
    });

    // Summary by priority
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Summary by Priority:');
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count} tasks`);
    });

    // Summary by project
    const projectCounts = tasks.reduce((acc, task) => {
      const project = task.projects as any;
      const projectName = project?.name || 'Unknown';
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Summary by Project:');
    Object.entries(projectCounts).forEach(([project, count]) => {
      console.log(`   ${project}: ${count} tasks`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
listAllTasks();


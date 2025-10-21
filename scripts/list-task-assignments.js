/**
 * Script to list all tasks and their user assignments
 * Run this with: node scripts/list-task-assignments.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zusulknbhaumougqckec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1c3Vsa25iaGF1bW91Z3Fja2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjQ3NzIsImV4cCI6MjA3NjAwMDc3Mn0.MllamzveYfgR0hH1G-1-qv-E7wjMkhzjH8MhWnO-cIA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTaskAssignments() {
  console.log('📋 Fetching tasks and user assignments...\n');

  try {
    // Get all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        priority,
        category,
        current_status,
        due_date,
        assigned_to,
        assigned_by,
        created_at,
        projects (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError.message);
      return;
    }

    if (!tasks || tasks.length === 0) {
      console.log('📭 No tasks found in the database.');
      return;
    }

    // Get all users for lookup
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role, position, phone');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    // Create user lookup map
    const userMap = new Map();
    users?.forEach(user => {
      userMap.set(user.id, user);
    });

    console.log('='.repeat(80));
    console.log(`📊 TASK ASSIGNMENTS REPORT`);
    console.log('='.repeat(80));
    console.log(`Total Tasks: ${tasks.length}`);
    console.log(`Total Users: ${users?.length || 0}`);
    console.log('='.repeat(80));
    console.log('\n');

    // Process and display each task
    tasks.forEach((task, index) => {
      console.log(`${'─'.repeat(80)}`);
      console.log(`Task #${index + 1}`);
      console.log(`${'─'.repeat(80)}`);
      console.log(`📝 Title: ${task.title}`);
      console.log(`📂 Project: ${task.projects?.name || 'N/A'}`);
      console.log(`📊 Status: ${task.current_status.replace('_', ' ').toUpperCase()}`);
      console.log(`⚡ Priority: ${task.priority.toUpperCase()}`);
      console.log(`🏷️  Category: ${task.category}`);
      console.log(`📅 Due Date: ${new Date(task.due_date).toLocaleDateString()}`);
      console.log(`🆔 Task ID: ${task.id}`);
      
      // Show creator
      const creator = userMap.get(task.assigned_by);
      if (creator) {
        console.log(`\n👤 Created By:`);
        console.log(`   Name: ${creator.name}`);
        console.log(`   Role: ${creator.role}`);
        console.log(`   Position: ${creator.position}`);
        console.log(`   Email: ${creator.email || 'N/A'}`);
        console.log(`   Phone: ${creator.phone}`);
      }

      // Show assignees
      console.log(`\n👥 Assigned To (${task.assigned_to?.length || 0} user(s)):`);
      if (task.assigned_to && task.assigned_to.length > 0) {
        task.assigned_to.forEach((userId, idx) => {
          const assignee = userMap.get(userId);
          if (assignee) {
            console.log(`\n   ${idx + 1}. ${assignee.name}`);
            console.log(`      Role: ${assignee.role}`);
            console.log(`      Position: ${assignee.position}`);
            console.log(`      Email: ${assignee.email || 'N/A'}`);
            console.log(`      Phone: ${assignee.phone}`);
            console.log(`      User ID: ${userId}`);
          } else {
            console.log(`\n   ${idx + 1}. Unknown User (ID: ${userId})`);
          }
        });
      } else {
        console.log(`   (No users assigned)`);
      }

      console.log('\n');
    });

    // Summary by user
    console.log('\n');
    console.log('='.repeat(80));
    console.log('📊 ASSIGNMENTS BY USER');
    console.log('='.repeat(80));

    const userTaskCount = new Map();
    tasks.forEach(task => {
      if (task.assigned_to) {
        task.assigned_to.forEach(userId => {
          const count = userTaskCount.get(userId) || 0;
          userTaskCount.set(userId, count + 1);
        });
      }
    });

    // Sort by task count
    const sortedUsers = Array.from(userTaskCount.entries())
      .sort((a, b) => b[1] - a[1]);

    sortedUsers.forEach(([userId, count]) => {
      const user = userMap.get(userId);
      if (user) {
        console.log(`\n👤 ${user.name} (${user.role})`);
        console.log(`   Position: ${user.position}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   📋 Assigned Tasks: ${count}`);
      }
    });

    // Summary by status
    console.log('\n');
    console.log('='.repeat(80));
    console.log('📊 TASKS BY STATUS');
    console.log('='.repeat(80));

    const statusCount = {};
    tasks.forEach(task => {
      const status = task.current_status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    Object.entries(statusCount).forEach(([status, count]) => {
      const statusLabel = status.replace('_', ' ').toUpperCase();
      const percentage = ((count / tasks.length) * 100).toFixed(1);
      console.log(`${statusLabel}: ${count} (${percentage}%)`);
    });

    // Summary by priority
    console.log('\n');
    console.log('='.repeat(80));
    console.log('📊 TASKS BY PRIORITY');
    console.log('='.repeat(80));

    const priorityCount = {};
    tasks.forEach(task => {
      const priority = task.priority;
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });

    Object.entries(priorityCount).forEach(([priority, count]) => {
      const percentage = ((count / tasks.length) * 100).toFixed(1);
      console.log(`${priority.toUpperCase()}: ${count} (${percentage}%)`);
    });

    console.log('\n');
    console.log('='.repeat(80));
    console.log('✅ Report complete!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
listTaskAssignments().catch(console.error);



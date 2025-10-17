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

async function checkCurrentData() {
  console.log('🔍 Checking current data in Supabase...\n');

  // Check companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, type, created_by')
    .order('name');
  
  if (companiesError) {
    console.error('Error fetching companies:', companiesError.message);
  } else {
    console.log('📊 Companies:');
    companies?.forEach(company => {
      console.log(`   - ${company.name} (${company.type}) - ID: ${company.id}`);
    });
    console.log(`   Total: ${companies?.length || 0}\n`);
  }

  // Check users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, role, company_id, position')
    .order('name');
  
  if (usersError) {
    console.error('Error fetching users:', usersError.message);
  } else {
    console.log('👥 Users:');
    users?.forEach(user => {
      console.log(`   - ${user.name} (${user.role}) - ${user.email} - Company: ${user.company_id}`);
    });
    console.log(`   Total: ${users?.length || 0}\n`);
  }

  // Check projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, status, created_by')
    .order('name');
  
  if (projectsError) {
    console.error('Error fetching projects:', projectsError.message);
  } else {
    console.log('🏗️  Projects:');
    projects?.forEach(project => {
      console.log(`   - ${project.name} (${project.status}) - Created by: ${project.created_by}`);
    });
    console.log(`   Total: ${projects?.length || 0}\n`);
  }

  // Check user project assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('user_project_assignments')
    .select(`
      id,
      user_id,
      project_id,
      category,
      assigned_by,
      is_active,
      users!user_project_assignments_user_id_fkey(name),
      projects!user_project_assignments_project_id_fkey(name)
    `)
    .order('assigned_at');
  
  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError.message);
  } else {
    console.log('🔗 User Project Assignments:');
    assignments?.forEach(assignment => {
      const userName = (assignment.users as any)?.name || 'Unknown';
      const projectName = (assignment.projects as any)?.name || 'Unknown';
      console.log(`   - ${userName} → ${projectName} (${assignment.category}) - Active: ${assignment.is_active}`);
    });
    console.log(`   Total: ${assignments?.length || 0}\n`);
  }

  // Check tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      priority,
      current_status,
      completion_percentage,
      assigned_to,
      assigned_by,
      projects!tasks_project_id_fkey(name)
    `)
    .order('created_at');
  
  if (tasksError) {
    console.error('Error fetching tasks:', tasksError.message);
  } else {
    console.log('📋 Tasks:');
    tasks?.forEach(task => {
      const projectName = (task.projects as any)?.name || 'Unknown';
      console.log(`   - ${task.title} (${task.priority}, ${task.current_status}) - Project: ${projectName}`);
      console.log(`     Assigned to: ${task.assigned_to?.length || 0} users, Completion: ${task.completion_percentage}%`);
    });
    console.log(`   Total: ${tasks?.length || 0}\n`);
  }

  console.log('✅ Data check completed!');
}

checkCurrentData();


#!/usr/bin/env tsx

/**
 * Database Seeding Script
 * 
 * This script populates Supabase with mock data from the application.
 * Run this after setting up your Supabase database schema.
 * 
 * Usage:
 * 1. Set up your .env file with Supabase credentials
 * 2. Run: npx tsx scripts/seedDatabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { MOCK_USERS } from '../src/state/mockData';
import { MOCK_COMPANIES } from '../src/state/companyStore';
import { MOCK_PROJECTS } from '../src/state/projectStore';
import { MOCK_TASKS } from '../src/state/taskStore';
import { MOCK_USER_ASSIGNMENTS } from '../src/state/projectStore';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to log progress
function logProgress(step: string, status: 'start' | 'success' | 'error', details?: string) {
  const emoji = status === 'start' ? '🔄' : status === 'success' ? '✅' : '❌';
  console.log(`${emoji} ${step}${details ? ` - ${details}` : ''}`);
}

// Helper function to handle errors
function handleError(step: string, error: any) {
  logProgress(step, 'error', error.message);
  console.error('Full error:', error);
  process.exit(1);
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Step 1: Clear existing data (optional - comment out if you want to keep existing data)
    logProgress('Clearing existing data', 'start');
    await clearExistingData();
    logProgress('Clearing existing data', 'success');

    // Step 2: Seed Companies
    logProgress('Seeding companies', 'start');
    const companyMap = await seedCompanies();
    logProgress('Seeding companies', 'success', `${companyMap.size} companies`);

    // Step 3: Seed Users
    logProgress('Seeding users', 'start');
    const userMap = await seedUsers(companyMap);
    logProgress('Seeding users', 'success', `${userMap.size} users`);

    // Step 4: Seed Projects
    logProgress('Seeding projects', 'start');
    const projectMap = await seedProjects(userMap);
    logProgress('Seeding projects', 'success', `${projectMap.size} projects`);

    // Step 5: Seed User Project Assignments
    logProgress('Seeding user project assignments', 'start');
    await seedUserProjectAssignments(userMap, projectMap);
    logProgress('Seeding user project assignments', 'success');

    // Step 6: Seed Tasks
    logProgress('Seeding tasks', 'start');
    const taskMap = await seedTasks(userMap, projectMap);
    logProgress('Seeding tasks', 'success', `${taskMap.size} tasks`);

    // Step 7: Seed Sub-tasks
    logProgress('Seeding sub-tasks', 'start');
    await seedSubTasks(userMap, projectMap, taskMap);
    logProgress('Seeding sub-tasks', 'success');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${companyMap.size}`);
    console.log(`   Users: ${userMap.size}`);
    console.log(`   Projects: ${projectMap.size}`);
    console.log(`   Tasks: ${taskMap.size}`);
    console.log('\n🚀 Your app is now ready to use Supabase!');

  } catch (error) {
    handleError('Database seeding', error);
  }
}

async function clearExistingData() {
  // Delete in reverse order of dependencies
  const tables = ['sub_tasks', 'tasks', 'user_project_assignments', 'projects', 'users', 'companies'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.warn(`Warning clearing ${table}:`, error.message);
    }
  }
}

async function seedCompanies(): Promise<Map<string, string>> {
  const companyMap = new Map<string, string>();
  
  for (const company of MOCK_COMPANIES) {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        type: company.type,
        description: company.description,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        license_number: company.licenseNumber,
        insurance_expiry: company.insuranceExpiry,
        banner: company.banner,
        created_by: company.createdBy,
        is_active: company.isActive,
      })
      .select('id')
      .single();

    if (error) throw error;
    
    companyMap.set(company.id, data.id);
  }
  
  return companyMap;
}

async function seedUsers(companyMap: Map<string, string>): Promise<Map<string, string>> {
  const userMap = new Map<string, string>();
  
  for (const user of MOCK_USERS) {
    const companyId = companyMap.get(user.companyId);
    if (!companyId) {
      throw new Error(`Company not found for user ${user.name}`);
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: companyId,
        position: user.position,
        phone: user.phone,
      })
      .select('id')
      .single();

    if (error) throw error;
    
    userMap.set(user.id, data.id);
  }
  
  return userMap;
}

async function seedProjects(userMap: Map<string, string>): Promise<Map<string, string>> {
  const projectMap = new Map<string, string>();
  
  for (const project of MOCK_PROJECTS) {
    const createdBy = userMap.get(project.createdBy);
    if (!createdBy) {
      throw new Error(`User not found for project ${project.name}`);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget,
        location: project.location,
        client_info: project.clientInfo,
        created_by: createdBy,
      })
      .select('id')
      .single();

    if (error) throw error;
    
    projectMap.set(project.id, data.id);
  }
  
  return projectMap;
}

async function seedUserProjectAssignments(userMap: Map<string, string>, projectMap: Map<string, string>) {
  for (const assignment of MOCK_USER_ASSIGNMENTS) {
    const userId = userMap.get(assignment.userId);
    const projectId = projectMap.get(assignment.projectId);
    const assignedBy = userMap.get(assignment.assignedBy);

    if (!userId || !projectId || !assignedBy) {
      console.warn(`Skipping assignment: missing user or project`);
      continue;
    }

    const { error } = await supabase
      .from('user_project_assignments')
      .insert({
        user_id: userId,
        project_id: projectId,
        category: assignment.category,
        assigned_by: assignedBy,
        is_active: assignment.isActive,
      });

    if (error) {
      console.warn(`Warning inserting assignment:`, error.message);
    }
  }
}

async function seedTasks(userMap: Map<string, string>, projectMap: Map<string, string>): Promise<Map<string, string>> {
  const taskMap = new Map<string, string>();
  
  for (const task of MOCK_TASKS) {
    const projectId = projectMap.get(task.projectId);
    const assignedBy = userMap.get(task.assignedBy);

    if (!projectId || !assignedBy) {
      console.warn(`Skipping task: missing project or assignedBy`);
      continue;
    }

    // Convert assignedTo array to new user IDs
    const assignedTo = task.assignedTo.map(userId => userMap.get(userId)).filter(Boolean);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        due_date: task.dueDate,
        current_status: task.currentStatus,
        completion_percentage: task.completionPercentage,
        assigned_to: assignedTo,
        assigned_by: assignedBy,
        attachments: task.attachments,
        accepted: task.accepted,
        decline_reason: task.declineReason,
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`Warning inserting task:`, error.message);
      continue;
    }
    
    taskMap.set(task.id, data.id);
  }
  
  return taskMap;
}

async function seedSubTasks(userMap: Map<string, string>, projectMap: Map<string, string>, taskMap: Map<string, string>) {
  for (const task of MOCK_TASKS) {
    if (!task.subTasks || task.subTasks.length === 0) continue;

    const parentTaskId = taskMap.get(task.id);
    const projectId = projectMap.get(task.projectId);

    if (!parentTaskId || !projectId) continue;

    for (const subTask of task.subTasks) {
      const assignedBy = userMap.get(subTask.assignedBy);
      const assignedTo = subTask.assignedTo.map(userId => userMap.get(userId)).filter(Boolean);

      if (!assignedBy) continue;

      const { error } = await supabase
        .from('sub_tasks')
        .insert({
          parent_task_id: parentTaskId,
          project_id: projectId,
          title: subTask.title,
          description: subTask.description,
          priority: subTask.priority,
          category: subTask.category,
          due_date: subTask.dueDate,
          current_status: subTask.currentStatus,
          completion_percentage: subTask.completionPercentage,
          assigned_to: assignedTo,
          assigned_by: assignedBy,
          attachments: subTask.attachments,
          accepted: subTask.accepted,
          decline_reason: subTask.declineReason,
        });

      if (error) {
        console.warn(`Warning inserting sub-task:`, error.message);
      }
    }
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };


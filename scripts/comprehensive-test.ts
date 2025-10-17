#!/usr/bin/env tsx

/**
 * Comprehensive BuildTrack Test Script
 * 
 * This script creates a complete test scenario for the buildtrack app including:
 * - 2 Companies (Company A - General Contractor, Company B - Subcontractor)
 * - 5 Users with full authentication (1 manager + 2 workers for Company A, 1 manager + 1 worker for Company B)
 * - 2 Projects
 * - 5 Tasks under Project A with 1 subtask each
 * - Random subtask assignments to workers from both companies
 * 
 * Usage:
 * 1. Set up your .env file with Supabase credentials including SUPABASE_SERVICE_ROLE_KEY
 * 2. Run: npx tsx scripts/comprehensive-test.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CompanyType, UserRole, UserCategory, Priority, TaskCategory, ProjectStatus } from '../src/types/buildtrack';

// Mock AsyncStorage for Node.js environment
const mockAsyncStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
};

// Set up mock for Node.js environment
if (typeof window === 'undefined') {
  global.window = {
    localStorage: mockAsyncStorage,
  } as any;
}

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test data definitions
const TEST_DATA = {
  companies: [
    {
      id: 'test-comp-a',
      name: 'Company A - General Contractor',
      type: 'general_contractor' as CompanyType,
      description: 'Leading general contractor for test scenario',
      address: '123 Test Construction Ave, Test City, TC 12345',
      phone: '555-0100',
      email: 'contact@companya.test',
      website: 'https://companya.test',
      licenseNumber: 'GC-TEST-001',
      insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'test-comp-b',
      name: 'Company B - Subcontractor',
      type: 'subcontractor' as CompanyType,
      description: 'Specialized subcontractor for test scenario',
      address: '456 Test Subcontractor St, Test City, TC 12346',
      phone: '555-0200',
      email: 'info@companyb.test',
      website: 'https://companyb.test',
      licenseNumber: 'SUB-TEST-002',
      insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  users: [
    // Company A Users
    {
      id: 'test-user-manager-a',
      name: 'John Manager A',
      email: 'john.managera@test.com',
      role: 'manager' as UserRole,
      companyId: 'test-comp-a',
      position: 'Project Manager',
      phone: '555-1001',
    },
    {
      id: 'test-user-worker-a1',
      name: 'Alice Worker A1',
      email: 'alice.workera1@test.com',
      role: 'worker' as UserRole,
      companyId: 'test-comp-a',
      position: 'Construction Worker',
      phone: '555-1002',
    },
    {
      id: 'test-user-worker-a2',
      name: 'Bob Worker A2',
      email: 'bob.workera2@test.com',
      role: 'worker' as UserRole,
      companyId: 'test-comp-a',
      position: 'Construction Worker',
      phone: '555-1003',
    },
    // Company B Users
    {
      id: 'test-user-manager-b',
      name: 'Sarah Manager B',
      email: 'sarah.managerb@test.com',
      role: 'manager' as UserRole,
      companyId: 'test-comp-b',
      position: 'Subcontractor Manager',
      phone: '555-2001',
    },
    {
      id: 'test-user-worker-b',
      name: 'Tom Worker B',
      email: 'tom.workerb@test.com',
      role: 'worker' as UserRole,
      companyId: 'test-comp-b',
      position: 'Subcontractor Worker',
      phone: '555-2002',
    }
  ],
  projects: [
    {
      id: 'test-project-a',
      name: 'Project A - Commercial Building',
      description: 'Construction of a commercial building with multiple phases',
      status: 'active' as ProjectStatus,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
      budget: 2500000,
      location: {
        address: '789 Commercial Blvd',
        city: 'Test City',
        state: 'TC',
        zipCode: '12347',
        coordinates: { latitude: 40.7128, longitude: -74.0060 }
      },
      clientInfo: {
        name: 'Test Commercial Client',
        email: 'client@testcommercial.com',
        phone: '555-3001'
      }
    },
    {
      id: 'test-project-b',
      name: 'Project B - Residential Complex',
      description: 'Construction of a residential apartment complex',
      status: 'active' as ProjectStatus,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(), // 8 months from now
      budget: 1800000,
      location: {
        address: '321 Residential Dr',
        city: 'Test City',
        state: 'TC',
        zipCode: '12348',
        coordinates: { latitude: 40.7589, longitude: -73.9851 }
      },
      clientInfo: {
        name: 'Test Residential Client',
        email: 'client@testresidential.com',
        phone: '555-3002'
      }
    }
  ],
  tasks: [
    {
      id: 'test-task-1',
      title: 'Foundation Inspection',
      description: 'Comprehensive inspection of foundation work including concrete quality and structural integrity',
      priority: 'high' as Priority,
      category: 'structural' as TaskCategory,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    },
    {
      id: 'test-task-2',
      title: 'Electrical Wiring Phase 1',
      description: 'Installation of electrical wiring for ground floor including outlets and switches',
      priority: 'medium' as Priority,
      category: 'electrical' as TaskCategory,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    },
    {
      id: 'test-task-3',
      title: 'Plumbing Installation',
      description: 'Installation of main plumbing lines and connections for the building',
      priority: 'high' as Priority,
      category: 'plumbing' as TaskCategory,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    },
    {
      id: 'test-task-4',
      title: 'Safety Equipment Check',
      description: 'Inspection and maintenance of all safety equipment on site',
      priority: 'critical' as Priority,
      category: 'safety' as TaskCategory,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    },
    {
      id: 'test-task-5',
      title: 'Material Delivery Coordination',
      description: 'Coordinate delivery and storage of construction materials for next phase',
      priority: 'medium' as Priority,
      category: 'materials' as TaskCategory,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    }
  ]
};

// Helper functions
function logProgress(step: string, status: 'start' | 'success' | 'error', details?: string) {
  const emoji = status === 'start' ? '🔄' : status === 'success' ? '✅' : '❌';
  console.log(`${emoji} ${step}${details ? ` - ${details}` : ''}`);
}

function handleError(step: string, error: any) {
  logProgress(step, 'error', error.message);
  console.error('Full error:', error);
  throw error;
}

function getRandomWorkerId(workerIds: string[]): string {
  return workerIds[Math.floor(Math.random() * workerIds.length)];
}

// Main execution function
async function runComprehensiveTest() {
  console.log('🧪 Starting Comprehensive BuildTrack Test...\n');
  console.log('📋 Test Scenario Overview:');
  console.log('   • 2 Companies (General Contractor + Subcontractor)');
  console.log('   • 5 Users with full authentication');
  console.log('   • 2 Projects');
  console.log('   • 5 Tasks under Project A with 1 subtask each');
  console.log('   • Random subtask assignments to workers\n');

  const createdIds = {
    companies: new Map<string, string>(),
    users: new Map<string, string>(),
    projects: new Map<string, string>(),
    tasks: new Map<string, string>(),
  };

  try {
    // Step 1: Setup and validation
    logProgress('Validating environment', 'start');
    
    // Check if we have real Supabase credentials (not placeholders)
    if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-key')) {
      throw new Error('Please update .env file with real Supabase credentials. Current values are placeholders.');
    }
    
    // Test Supabase connection
    try {
      const { data, error } = await supabaseAdmin.from('companies').select('count').limit(1);
      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        throw error;
      }
    } catch (error: any) {
      if (error.message.includes('Invalid supabaseUrl')) {
        throw new Error('Invalid Supabase URL. Please check your EXPO_PUBLIC_SUPABASE_URL in .env file.');
      }
      // Other errors might be expected if tables don't exist yet
    }
    
    logProgress('Validating environment', 'success');

    // Step 2: Create companies (without created_by for now)
    logProgress('Creating companies', 'start');
    
    for (const companyData of TEST_DATA.companies) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .insert({
          name: companyData.name,
          type: companyData.type,
          description: companyData.description,
          address: companyData.address,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          license_number: companyData.licenseNumber,
          insurance_expiry: companyData.insuranceExpiry,
          banner: {
            text: companyData.name,
            backgroundColor: companyData.id === 'test-comp-a' ? '#3b82f6' : '#f59e0b',
            textColor: '#ffffff',
            isVisible: true,
          },
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      
      createdIds.companies.set(companyData.id, data.id);
      logProgress(`Created company: ${companyData.name}`, 'success', `ID: ${data.id}`);
    }

    // Step 3: Create users with authentication
    logProgress('Creating users with authentication', 'start');
    
    for (const userData of TEST_DATA.users) {
      // Create user in database
      const companyId = createdIds.companies.get(userData.companyId);
      if (!companyId) {
        throw new Error(`Company not found for user ${userData.name}`);
      }

      const { data: userDbData, error: userDbError } = await supabaseAdmin
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          company_id: companyId,
          position: userData.position,
          phone: userData.phone,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (userDbError) throw userDbError;

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          company_id: companyId,
        }
      });

      if (authError) {
        throw authError;
      }

      logProgress(`Created user: ${userData.name}`, 'success', `Auth ID: ${authData.user?.id}`);
      createdIds.users.set(userData.id, userDbData.id);
    }

    // Step 4: Create projects
    logProgress('Creating projects', 'start');
    const managerAId = createdIds.users.get('test-user-manager-a');
    
    if (!managerAId) {
      throw new Error('Company A Manager not found');
    }

    // Get Company A ID for projects
    const companyAId = createdIds.companies.get('test-comp-a');
    if (!companyAId) {
      throw new Error('Company A not found');
    }

    for (const projectData of TEST_DATA.projects) {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          budget: projectData.budget,
          location: projectData.location,
          client_info: projectData.clientInfo,
          created_by: managerAId,
          company_id: companyAId, // Set company_id to Company A
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      createdIds.projects.set(projectData.id, data.id);
      logProgress(`Created project: ${projectData.name}`, 'success', `ID: ${data.id}`);
    }

    // Step 5: Assign users to projects
    logProgress('Assigning users to projects', 'start');
    
    const projectAId = createdIds.projects.get('test-project-a');
    const projectBId = createdIds.projects.get('test-project-b');
    
    if (!projectAId || !projectBId) {
      throw new Error('Projects not found');
    }

    // Project A assignments
    const projectAAssignments = [
      { userId: managerAId, category: 'lead_project_manager' },
      { userId: createdIds.users.get('test-user-worker-a1')!, category: 'worker' },
      { userId: createdIds.users.get('test-user-worker-a2')!, category: 'worker' },
      { userId: createdIds.users.get('test-user-manager-b')!, category: 'contractor' },
      { userId: createdIds.users.get('test-user-worker-b')!, category: 'worker' },
    ];

    for (const assignment of projectAAssignments) {
      const { error } = await supabaseAdmin
        .from('user_project_assignments')
        .insert({
          user_id: assignment.userId,
          project_id: projectAId,
          category: assignment.category,
          assigned_by: managerAId,
          assigned_at: new Date().toISOString(),
          is_active: true,
        });
      if (error) throw error;
    }

    // Project B assignments
    const projectBAssignments = [
      { userId: managerAId, category: 'lead_project_manager' },
      { userId: createdIds.users.get('test-user-worker-a1')!, category: 'worker' },
      { userId: createdIds.users.get('test-user-worker-a2')!, category: 'worker' },
    ];

    for (const assignment of projectBAssignments) {
      const { error } = await supabaseAdmin
        .from('user_project_assignments')
        .insert({
          user_id: assignment.userId,
          project_id: projectBId,
          category: assignment.category,
          assigned_by: managerAId,
          assigned_at: new Date().toISOString(),
          is_active: true,
        });
      if (error) throw error;
    }

    logProgress('Assigning users to projects', 'success');

    // Step 6: Create tasks and subtasks
    logProgress('Creating tasks and subtasks', 'start');
    
    const workerIds = [
      createdIds.users.get('test-user-worker-a1')!,
      createdIds.users.get('test-user-worker-a2')!,
      createdIds.users.get('test-user-worker-b')!,
    ];

    for (const taskData of TEST_DATA.tasks) {
      // Create main task
      const { data: taskDbData, error: taskError } = await supabaseAdmin
        .from('tasks')
        .insert({
          project_id: projectAId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          category: taskData.category,
          due_date: taskData.dueDate,
          assigned_to: [managerAId], // Initially assigned to manager
          assigned_by: managerAId,
          attachments: [],
          current_status: 'not_started',
          completion_percentage: 0,
          accepted: false,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (taskError) throw taskError;
      createdIds.tasks.set(taskData.id, taskDbData.id);

      // Create subtask with random worker assignment
      const randomWorkerId = getRandomWorkerId(workerIds);
      const { error: subtaskError } = await supabaseAdmin
        .from('sub_tasks')
        .insert({
          parent_task_id: taskDbData.id,
          project_id: projectAId,
          title: `${taskData.title} - Sub Task`,
          description: `Detailed subtask for ${taskData.title}`,
          priority: taskData.priority,
          category: taskData.category,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          assigned_to: [randomWorkerId],
          assigned_by: managerAId,
          attachments: [],
          current_status: 'not_started',
          completion_percentage: 0,
          accepted: false,
          created_at: new Date().toISOString(),
        });

      if (subtaskError) throw subtaskError;

      logProgress(`Created task: ${taskData.title}`, 'success', `Subtasks assigned to: ${randomWorkerId}`);
    }

    // Step 7: Display summary
    console.log('\n🎉 Comprehensive Test Completed Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Companies: ${createdIds.companies.size}`);
    console.log(`   Users: ${createdIds.users.size}`);
    console.log(`   Projects: ${createdIds.projects.size}`);
    console.log(`   Tasks: ${createdIds.tasks.size}`);

    console.log('\n🔑 Login Credentials (password: "password123"):');
    TEST_DATA.users.forEach(user => {
      const roleEmoji = user.role === 'manager' ? '📋' : '👷';
      console.log(`   ${roleEmoji} ${user.name} (${user.role}): ${user.email}`);
    });

    console.log('\n🏗️ Project Structure:');
    console.log('   Project A (Commercial Building):');
    console.log('     - Team: Alice Worker A1, Bob Worker A2, Sarah Manager B, Tom Worker B');
    console.log('     - Tasks: 5 tasks with 1 subtask each');
    console.log('   Project B (Residential Complex):');
    console.log('     - Team: Alice Worker A1, Bob Worker A2');

    console.log('\n📋 Task Assignments:');
    TEST_DATA.tasks.forEach((task, index) => {
      const taskId = createdIds.tasks.get(task.id);
      console.log(`   ${index + 1}. ${task.title} (${task.priority} priority, ${task.category})`);
      console.log(`      Due: ${new Date(task.dueDate).toLocaleDateString()}`);
    });

    console.log('\n🚀 Test scenario is ready! You can now login and test the application.');

  } catch (error) {
    handleError('Comprehensive test execution', error);
    process.exit(1);
  }
}

// Optional cleanup function
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...\n');
  
  try {
    // Delete in reverse order of dependencies
    const tables = ['sub_tasks', 'tasks', 'user_project_assignments', 'projects', 'users', 'companies'];
    
    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).delete().like('id', 'test-%');
      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.warn(`Warning cleaning ${table}:`, error.message);
      } else {
        console.log(`✅ Cleaned ${table}`);
      }
    }

    console.log('\n🎉 Cleanup completed!');
  } catch (error: any) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'cleanup') {
  cleanupTestData();
} else {
  runComprehensiveTest();
}

export { runComprehensiveTest, cleanupTestData };

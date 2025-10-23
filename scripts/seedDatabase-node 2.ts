#!/usr/bin/env tsx

/**
 * Database Seeding Script (Node.js Version)
 * 
 * This script populates Supabase with mock data from the application.
 * This version works in Node.js environment without React Native dependencies.
 * 
 * Usage:
 * 1. Set up your .env file with Supabase credentials
 * 2. Run: npx tsx scripts/seedDatabase-node.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Mock data (copied from the stores)
const MOCK_COMPANIES = [
  {
    id: "comp-1",
    name: "BuildTrack Construction Inc.",
    type: "general_contractor",
    description: "Leading general contractor specializing in commercial projects",
    address: "123 Builder Street, Construction City, CA 90210",
    phone: "555-0100",
    email: "contact@buildtrack.com",
    website: "https://buildtrack.com",
    licenseNumber: "GC-123456",
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "BuildTrack Construction Inc.",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      isVisible: true,
    },
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "3", // Admin
    isActive: true,
  },
  {
    id: "comp-2",
    name: "Elite Electric Co.",
    type: "subcontractor",
    description: "Professional electrical contracting services",
    address: "456 Voltage Ave, Electric City, CA 90211",
    phone: "555-0200",
    email: "info@eliteelectric.com",
    licenseNumber: "EC-789012",
    insuranceExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "Elite Electric Co.",
      backgroundColor: "#f59e0b",
      textColor: "#ffffff",
      isVisible: true,
    },
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "3",
    isActive: true,
  },
  {
    id: "comp-3",
    name: "Metro Plumbing Services",
    type: "subcontractor",
    description: "Full-service plumbing and pipe fitting",
    address: "789 Pipe Lane, Water City, CA 90212",
    phone: "555-0300",
    email: "service@metroplumbing.com",
    licenseNumber: "PC-345678",
    insuranceExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "Metro Plumbing Services",
      backgroundColor: "#10b981",
      textColor: "#ffffff",
      isVisible: true,
    },
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "3",
    isActive: true,
  },
];

const MOCK_USERS = [
  {
    id: "1",
    email: "manager@buildtrack.com",
    name: "John Manager",
    role: "manager",
    companyId: "comp-1",
    position: "Project Manager",
    phone: "555-0101",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2", 
    email: "worker@buildtrack.com",
    name: "Sarah Worker",
    role: "worker",
    companyId: "comp-1",
    position: "Construction Worker",
    phone: "555-0102",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "admin@buildtrack.com", 
    name: "Alex Administrator",
    role: "admin",
    companyId: "comp-1",
    position: "System Administrator",
    phone: "555-0103",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    email: "lisa@eliteelectric.com",
    name: "Lisa Martinez",
    role: "worker",
    companyId: "comp-2",
    position: "Electrician",
    phone: "555-0104",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    email: "mike@metroplumbing.com",
    name: "Mike Johnson",
    role: "manager",
    companyId: "comp-3",
    position: "Plumbing Supervisor",
    phone: "555-0105",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    email: "dennis@buildtrack.com",
    name: "Dennis",
    role: "worker",
    companyId: "comp-1",
    position: "Site Supervisor",
    phone: "555-0106",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_PROJECTS = [
  {
    id: "proj-1",
    name: "Downtown Office Complex",
    description: "Modern 15-story office building with retail space on ground floor",
    status: "active",
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 2500000,
    location: {
      address: "123 Main Street",
      city: "Downtown",
      state: "CA",
      zipCode: "90210",
    },
    clientInfo: {
      name: "Metro Development Corp",
      email: "contact@metrodev.com",
      phone: "555-0123",
    },
    createdBy: "3", // Alex Administrator (comp-1)
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-2", 
    name: "Residential Housing Development",
    description: "50-unit housing development with community amenities",
    status: "active",
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 1800000,
    location: {
      address: "456 Oak Avenue",
      city: "Riverside",
      state: "CA", 
      zipCode: "92501",
    },
    clientInfo: {
      name: "Family Homes LLC",
      email: "info@familyhomes.com",
      phone: "555-0456",
    },
    createdBy: "3", // Alex Administrator (comp-1)
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_TASKS = [
  {
    id: "1",
    projectId: "proj-1", // Downtown Office Complex
    title: "Foundation Excavation",
    description: "Excavate foundation area for Building A. Ensure proper depth and slope for drainage.",
    priority: "high",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "structural",
    attachments: [],
    assignedTo: ["2"],
    assignedBy: "1",
    createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "2",
    projectId: "proj-1", // Downtown Office Complex
    title: "Electrical Rough-in",
    description: "Install electrical conduits and wiring for first floor offices.",
    priority: "medium",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "electrical",
    attachments: [],
    assignedTo: ["2"],
    assignedBy: "1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [
      {
        id: "update-1",
        description: "Started conduit installation in conference room",
        photos: [],
        completionPercentage: 25,
        status: "in_progress",
        userId: "2",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    currentStatus: "in_progress",
    completionPercentage: 25,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "1",
  },
  {
    id: "7",
    projectId: "proj-1", // Downtown Office Complex
    title: "Project Status Review Meeting",
    description: "Conduct weekly project status review meeting with all stakeholders. Prepare agenda and coordinate with team leads.",
    priority: "high",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    attachments: [],
    assignedTo: ["1"], // Assigned to John Manager
    assignedBy: "3", // Assigned by Alex Admin
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "in_progress",
    completionPercentage: 30,
    accepted: true,
    delegationHistory: [],
    originalAssignedBy: "3",
  },
  {
    id: "8",
    projectId: "proj-1", // Downtown Office Complex
    title: "Budget Analysis and Reporting",
    description: "Analyze current project budget status and prepare detailed financial report for client review.",
    priority: "medium",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    attachments: [],
    assignedTo: ["1"], // Assigned to John Manager
    assignedBy: "3", // Assigned by Alex Admin
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [],
    currentStatus: "not_started",
    completionPercentage: 0,
    accepted: undefined, // Needs to be accepted by John Manager
    delegationHistory: [],
    originalAssignedBy: "3",
  },
];

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

    // Step 2: Seed Companies (without created_by reference)
    logProgress('Seeding companies', 'start');
    const companyMap = await seedCompanies();
    logProgress('Seeding companies', 'success', `${companyMap.size} companies`);

    // Step 3: Seed Users
    logProgress('Seeding users', 'start');
    const userMap = await seedUsers(companyMap);
    logProgress('Seeding users', 'success', `${userMap.size} users`);

    // Step 4: Update Companies with created_by references
    logProgress('Updating company references', 'start');
    await updateCompanyReferences(companyMap, userMap);
    logProgress('Updating company references', 'success');

    // Step 5: Seed Projects
    logProgress('Seeding projects', 'start');
    const projectMap = await seedProjects(userMap);
    logProgress('Seeding projects', 'success', `${projectMap.size} projects`);

    // Step 6: Seed Tasks
    logProgress('Seeding tasks', 'start');
    const taskMap = await seedTasks(userMap, projectMap);
    logProgress('Seeding tasks', 'success', `${taskMap.size} tasks`);

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
  const tables = ['tasks', 'projects', 'users', 'companies'];
  
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
        created_by: null, // Will be updated after users are created
        is_active: company.isActive,
      })
      .select('id')
      .single();

    if (error) throw error;
    
    companyMap.set(company.id, data.id);
  }
  
  return companyMap;
}

async function updateCompanyReferences(companyMap: Map<string, string>, userMap: Map<string, string>) {
  // Update companies with created_by references
  for (const company of MOCK_COMPANIES) {
    const companyId = companyMap.get(company.id);
    const createdByUserId = userMap.get(company.createdBy);
    
    if (companyId && createdByUserId) {
      const { error } = await supabase
        .from('companies')
        .update({ created_by: createdByUserId })
        .eq('id', companyId);
        
      if (error) {
        console.warn(`Warning updating company ${company.name}:`, error.message);
      }
    }
  }
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

// Run the seeding script
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };

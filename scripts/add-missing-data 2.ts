import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
  process.exit(1);
}

// Create Supabase client without AsyncStorage for Node.js environment
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Additional mock data that might be missing
const ADDITIONAL_TASKS = [
  {
    id: "7",
    project_id: "proj-1", // Downtown Office Complex
    title: "Project Status Review Meeting",
    description: "Conduct weekly project status review meeting with all stakeholders. Prepare agenda and coordinate with team leads.",
    priority: "high",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    attachments: [],
    assigned_to: ["1"], // Assigned to John Manager
    assigned_by: "3", // Assigned by Alex Admin
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    current_status: "in_progress",
    completion_percentage: 30,
    accepted: true,
    original_assigned_by: "3",
  },
  {
    id: "8",
    project_id: "proj-1", // Downtown Office Complex
    title: "Budget Analysis and Reporting",
    description: "Analyze current project budget status and prepare detailed financial report for client review.",
    priority: "medium",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    attachments: [],
    assigned_to: ["1"], // Assigned to John Manager
    assigned_by: "3", // Assigned by Alex Admin
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    current_status: "not_started",
    completion_percentage: 0,
    accepted: undefined, // Needs to be accepted by John Manager
    original_assigned_by: "3",
  },
];

// Helper function to log progress
function logProgress(message: string, status: 'start' | 'success' | 'error' = 'start', details?: string) {
  const timestamp = new Date().toLocaleTimeString();
  const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : '🔄';
  
  if (status === 'error') {
    console.log(`${statusIcon} [${timestamp}] ${message}: ${details}`);
  } else if (status === 'success') {
    console.log(`${statusIcon} [${timestamp}] ${message}${details ? `: ${details}` : ''}`);
  } else {
    console.log(`${statusIcon} [${timestamp}] ${message}...`);
  }
}

// Function to get existing data mappings
async function getExistingDataMappings() {
  logProgress('Getting existing data mappings');
  
  // Get companies
  const { data: companies } = await supabase.from('companies').select('id, name');
  const companyMap = new Map<string, string>();
  companies?.forEach(company => {
    if (company.name === "BuildTrack Construction Inc.") {
      companyMap.set("comp-1", company.id);
    } else if (company.name === "Elite Electric Co.") {
      companyMap.set("comp-2", company.id);
    }
  });

  // Get users
  const { data: users } = await supabase.from('users').select('id, name, email');
  const userMap = new Map<string, string>();
  users?.forEach(user => {
    if (user.email === "manager@buildtrack.com") {
      userMap.set("1", user.id);
    } else if (user.email === "worker@buildtrack.com") {
      userMap.set("2", user.id);
    } else if (user.email === "admin@buildtrack.com") {
      userMap.set("3", user.id);
    } else if (user.email === "lisa@eliteelectric.com") {
      userMap.set("4", user.id);
    } else if (user.email === "admin@eliteelectric.com") {
      userMap.set("5", user.id);
    } else if (user.email === "dennis@buildtrack.com") {
      userMap.set("6", user.id);
    }
  });

  // Get projects
  const { data: projects } = await supabase.from('projects').select('id, name');
  const projectMap = new Map<string, string>();
  projects?.forEach(project => {
    if (project.name === "Downtown Office Complex") {
      projectMap.set("proj-1", project.id);
    } else if (project.name === "Residential Housing Development") {
      projectMap.set("proj-2", project.id);
    } else if (project.name === "Industrial Warehouse Electrical") {
      projectMap.set("proj-3", project.id);
    } else if (project.name === "Shopping Mall Power Upgrade") {
      projectMap.set("proj-4", project.id);
    }
  });

  logProgress('Getting existing data mappings', 'success', 
    `${companyMap.size} companies, ${userMap.size} users, ${projectMap.size} projects`);
  
  return { companyMap, userMap, projectMap };
}

// Function to add missing tasks
async function addMissingTasks(userMap: Map<string, string>, projectMap: Map<string, string>) {
  logProgress('Adding missing tasks');
  
  let addedCount = 0;
  
  for (const task of ADDITIONAL_TASKS) {
    const projectUuid = projectMap.get(task.project_id);
    const assignedByUuid = userMap.get(task.assigned_by);

    if (!projectUuid || !assignedByUuid) {
      console.warn(`Skipping task ${task.id} - missing references`);
      continue;
    }

    // Map assigned_to user IDs to UUIDs
    const assignedToUuids = task.assigned_to.map(userId => userMap.get(userId)).filter(Boolean) as string[];

    // Check if task already exists
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('title', task.title)
      .eq('project_id', projectUuid)
      .single();

    if (existingTask) {
      console.log(`Task "${task.title}" already exists, skipping`);
      continue;
    }

    const { error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectUuid,
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        due_date: task.due_date,
        assigned_to: assignedToUuids,
        assigned_by: assignedByUuid,
        attachments: task.attachments,
        created_at: task.created_at,
        current_status: task.current_status,
        completion_percentage: task.completion_percentage,
        accepted: task.accepted,
        original_assigned_by: userMap.get(task.original_assigned_by),
      });

    if (error) {
      console.warn(`Failed to insert task ${task.title}:`, error.message);
    } else {
      addedCount++;
    }
  }

  logProgress('Adding missing tasks', 'success', `${addedCount} tasks added`);
}

// Function to add missing user project assignments
async function addMissingAssignments(userMap: Map<string, string>, projectMap: Map<string, string>) {
  logProgress('Adding missing user project assignments');
  
  const additionalAssignments = [
    {
      user_id: "1", // John Manager
      project_id: "proj-1", // Downtown Office Complex
      category: "lead_project_manager",
      assigned_by: "3", // Alex Administrator
    },
    {
      user_id: "1", // John Manager
      project_id: "proj-2", // Residential Housing Development
      category: "lead_project_manager",
      assigned_by: "3", // Alex Administrator
    },
    {
      user_id: "2", // Sarah Worker
      project_id: "proj-1", // Downtown Office Complex
      category: "worker",
      assigned_by: "1", // John Manager
    },
    {
      user_id: "6", // Dennis
      project_id: "proj-1", // Downtown Office Complex
      category: "supervisor",
      assigned_by: "1", // John Manager
    },
    {
      user_id: "6", // Dennis
      project_id: "proj-2", // Residential Housing Development
      category: "supervisor",
      assigned_by: "1", // John Manager
    },
    {
      user_id: "5", // Mike Johnson
      project_id: "proj-3", // Industrial Warehouse Electrical
      category: "lead_project_manager",
      assigned_by: "5", // Mike Johnson (self-assigned)
    },
    {
      user_id: "5", // Mike Johnson
      project_id: "proj-4", // Shopping Mall Power Upgrade
      category: "lead_project_manager",
      assigned_by: "5", // Mike Johnson (self-assigned)
    },
    {
      user_id: "4", // Lisa Martinez
      project_id: "proj-3", // Industrial Warehouse Electrical
      category: "worker",
      assigned_by: "5", // Mike Johnson
    },
    {
      user_id: "4", // Lisa Martinez
      project_id: "proj-4", // Shopping Mall Power Upgrade
      category: "worker",
      assigned_by: "5", // Mike Johnson
    },
  ];

  let addedCount = 0;
  
  for (const assignment of additionalAssignments) {
    const userUuid = userMap.get(assignment.user_id);
    const projectUuid = projectMap.get(assignment.project_id);
    const assignedByUuid = userMap.get(assignment.assigned_by);

    if (!userUuid || !projectUuid || !assignedByUuid) {
      console.warn(`Skipping assignment - missing references`);
      continue;
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from('user_project_assignments')
      .select('id')
      .eq('user_id', userUuid)
      .eq('project_id', projectUuid)
      .eq('category', assignment.category)
      .single();

    if (existingAssignment) {
      console.log(`Assignment already exists, skipping`);
      continue;
    }

    const { error } = await supabase
      .from('user_project_assignments')
      .insert({
        user_id: userUuid,
        project_id: projectUuid,
        category: assignment.category,
        assigned_at: new Date().toISOString(),
        assigned_by: assignedByUuid,
        is_active: true,
      });

    if (error) {
      console.warn(`Failed to insert assignment:`, error.message);
    } else {
      addedCount++;
    }
  }

  logProgress('Adding missing user project assignments', 'success', `${addedCount} assignments added`);
}

// Main function
async function addMissingData() {
  logProgress('Starting to add missing data to Supabase');
  
  try {
    const { companyMap, userMap, projectMap } = await getExistingDataMappings();
    
    if (companyMap.size === 0 || userMap.size === 0 || projectMap.size === 0) {
      console.log('❌ Missing core data. Please run the initial seeding script first.');
      return;
    }

    await addMissingAssignments(userMap, projectMap);
    await addMissingTasks(userMap, projectMap);

    console.log('\n🎉 Missing data addition completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${companyMap.size}`);
    console.log(`   Users: ${userMap.size}`);
    console.log(`   Projects: ${projectMap.size}`);
    console.log('\n🚀 Your Supabase database now has all the mock data!');
    
  } catch (error: any) {
    logProgress('Adding missing data', 'error', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
addMissingData();


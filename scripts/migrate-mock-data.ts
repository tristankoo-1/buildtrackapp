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

// Mock data from the original stores
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
    license_number: "GC-123456",
    insurance_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "BuildTrack Construction Inc.",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      isVisible: true,
    },
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: null, // Will be updated after users are seeded
    is_active: true,
  },
  {
    id: "comp-2",
    name: "Elite Electric Co.",
    type: "subcontractor",
    description: "Professional electrical contracting services",
    address: "456 Voltage Ave, Electric City, CA 90211",
    phone: "555-0200",
    email: "info@eliteelectric.com",
    license_number: "EC-789012",
    insurance_expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "Elite Electric Co.",
      backgroundColor: "#f59e0b",
      textColor: "#ffffff",
      isVisible: true,
    },
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: null, // Will be updated after users are seeded
    is_active: true,
  },
];

const MOCK_USERS = [
  {
    id: "1",
    email: "manager@buildtrack.com",
    name: "John Manager",
    role: "manager",
    company_id: "comp-1",
    position: "Project Manager",
    phone: "555-0101",
    created_at: new Date().toISOString(),
  },
  {
    id: "2", 
    email: "worker@buildtrack.com",
    name: "Sarah Worker",
    role: "worker",
    company_id: "comp-1",
    position: "Construction Worker",
    phone: "555-0102",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    email: "admin@buildtrack.com", 
    name: "Alex Administrator",
    role: "admin",
    company_id: "comp-1",
    position: "System Administrator",
    phone: "555-0103",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    email: "lisa@eliteelectric.com",
    name: "Lisa Martinez",
    role: "worker",
    company_id: "comp-2",
    position: "Electrician",
    phone: "555-0104",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    email: "admin@eliteelectric.com",
    name: "Mike Johnson",
    role: "admin",
    company_id: "comp-2",
    position: "Operations Manager",
    phone: "555-0105",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    email: "dennis@buildtrack.com",
    name: "Dennis",
    role: "worker",
    company_id: "comp-1",
    position: "Site Supervisor",
    phone: "555-0106",
    created_at: new Date().toISOString(),
  },
];

const MOCK_PROJECTS = [
  {
    id: "proj-1",
    name: "Downtown Office Complex",
    description: "Modern 15-story office building with retail space on ground floor",
    status: "active",
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 2500000,
    location: {
      address: "123 Main Street",
      city: "Downtown",
      state: "CA",
      zipCode: "90210",
    },
    client_info: {
      name: "Metro Development Corp",
      email: "contact@metrodev.com",
      phone: "555-0123",
    },
    created_by: "3", // Alex Administrator (comp-1)
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-2", 
    name: "Residential Housing Development",
    description: "50-unit housing development with community amenities",
    status: "active",
    start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 1800000,
    location: {
      address: "456 Oak Avenue",
      city: "Riverside",
      state: "CA", 
      zipCode: "92501",
    },
    client_info: {
      name: "Family Homes LLC",
      email: "info@familyhomes.com",
      phone: "555-0456",
    },
    created_by: "3", // Alex Administrator (comp-1)
    created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-3",
    name: "Industrial Warehouse Electrical",
    description: "Complete electrical system installation for 100,000 sq ft warehouse",
    status: "active",
    start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 450000,
    location: {
      address: "789 Industrial Blvd",
      city: "Commerce",
      state: "CA",
      zipCode: "90040",
    },
    client_info: {
      name: "Warehouse Logistics Inc",
      email: "projects@warehouselogistics.com",
      phone: "555-0789",
    },
    created_by: "5", // Mike Johnson (comp-2)
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-4",
    name: "Shopping Mall Power Upgrade",
    description: "Upgrade main power distribution and install backup generators",
    status: "planning",
    start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 680000,
    location: {
      address: "321 Shopping Center Dr",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210",
    },
    client_info: {
      name: "Luxury Mall Properties",
      email: "maintenance@luxurymall.com",
      phone: "555-0321",
    },
    created_by: "5", // Mike Johnson (comp-2)
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_USER_PROJECT_ASSIGNMENTS = [
  // BuildTrack Construction Inc. assignments (comp-1)
  {
    id: "assign-1",
    user_id: "1", // John Manager
    project_id: "proj-1", // Downtown Office Complex
    category: "lead_project_manager",
    assigned_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "3", // Alex Administrator
    is_active: true,
  },
  {
    id: "assign-2",
    user_id: "1", // John Manager
    project_id: "proj-2", // Residential Housing Development
    category: "lead_project_manager",
    assigned_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "3", // Alex Administrator
    is_active: true,
  },
  {
    id: "assign-3",
    user_id: "2", // Sarah Worker
    project_id: "proj-1", // Downtown Office Complex
    category: "worker",
    assigned_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "1", // John Manager
    is_active: true,
  },
  {
    id: "assign-4",
    user_id: "6", // Dennis
    project_id: "proj-1", // Downtown Office Complex
    category: "supervisor",
    assigned_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "1", // John Manager
    is_active: true,
  },
  {
    id: "assign-5",
    user_id: "6", // Dennis
    project_id: "proj-2", // Residential Housing Development
    category: "supervisor",
    assigned_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "1", // John Manager
    is_active: true,
  },
  // Elite Electric Co. assignments (comp-2)
  {
    id: "assign-6",
    user_id: "5", // Mike Johnson
    project_id: "proj-3", // Industrial Warehouse Electrical
    category: "lead_project_manager",
    assigned_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "5", // Mike Johnson (self-assigned)
    is_active: true,
  },
  {
    id: "assign-7",
    user_id: "5", // Mike Johnson
    project_id: "proj-4", // Shopping Mall Power Upgrade
    category: "lead_project_manager",
    assigned_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "5", // Mike Johnson (self-assigned)
    is_active: true,
  },
  {
    id: "assign-8",
    user_id: "4", // Lisa Martinez
    project_id: "proj-3", // Industrial Warehouse Electrical
    category: "worker",
    assigned_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "5", // Mike Johnson
    is_active: true,
  },
  {
    id: "assign-9",
    user_id: "4", // Lisa Martinez
    project_id: "proj-4", // Shopping Mall Power Upgrade
    category: "worker",
    assigned_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_by: "5", // Mike Johnson
    is_active: true,
  },
];

const MOCK_TASKS = [
  {
    id: "1",
    project_id: "proj-1", // Assign to Downtown Office Complex
    title: "Fix Roof Leak in Building A",
    description: "Urgent repair needed for roof leak in the east wing of Building A. Water is damaging interior walls.",
    priority: "critical",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "structural",
    attachments: [],
    assigned_to: ["2"],
    assigned_by: "1",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    current_status: "not_started",
    completion_percentage: 0,
    accepted: true,
    original_assigned_by: "1",
  },
  {
    id: "2",
    project_id: "proj-1", // Assign to Downtown Office Complex
    title: "Electrical Safety Inspection",
    description: "Monthly safety inspection of electrical systems in all buildings.",
    priority: "high",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "safety",
    attachments: [],
    assigned_to: ["2"],
    assigned_by: "1",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    current_status: "in_progress",
    completion_percentage: 25,
    accepted: true,
    original_assigned_by: "1",
  },
  {
    id: "3",
    project_id: "proj-1", // Downtown Office Complex
    title: "Install Safety Barriers on 5th Floor",
    description: "Install temporary safety barriers around construction zone on 5th floor to prevent accidents.",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "safety",
    attachments: [],
    assigned_to: ["6"], // Dennis
    assigned_by: "1",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    current_status: "not_started",
    completion_percentage: 0,
    accepted: true,
    original_assigned_by: "1",
  },
  {
    id: "4",
    project_id: "proj-2", // Residential Housing Development
    title: "Inspect Foundation Pouring Quality",
    description: "Perform quality inspection on foundations for units 20-30. Check for cracks and proper curing.",
    priority: "medium",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "structural",
    attachments: [],
    assigned_to: ["6"], // Dennis
    assigned_by: "1",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    current_status: "not_started",
    completion_percentage: 0,
    accepted: true,
    original_assigned_by: "1",
  },
  {
    id: "5",
    project_id: "proj-3", // Industrial Warehouse Electrical
    title: "Install Main Electrical Panel",
    description: "Install and wire the main electrical distribution panel for the warehouse facility.",
    priority: "high",
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: "electrical",
    attachments: [],
    assigned_to: ["4"], // Lisa Martinez
    assigned_by: "5",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    current_status: "not_started",
    completion_percentage: 0,
    accepted: true,
    original_assigned_by: "5",
  },
  {
    id: "6",
    project_id: "proj-3", // Industrial Warehouse Electrical
    title: "Run Conduit for Lighting Circuits",
    description: "Install electrical conduit throughout the warehouse for lighting circuit distribution.",
    priority: "medium",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: "electrical",
    attachments: [],
    assigned_to: ["4"], // Lisa Martinez
    assigned_by: "5",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    current_status: "not_started",
    completion_percentage: 0,
    accepted: true,
    original_assigned_by: "5",
  },
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

// Function to clear existing data
async function clearExistingData() {
  logProgress('Clearing existing data');
  
  try {
    // Clear in reverse dependency order using DELETE with proper conditions
    const { error: taskUpdatesError } = await supabase.from('task_updates').delete().gte('id', '');
    if (taskUpdatesError) console.warn('Error clearing task_updates:', taskUpdatesError.message);

    const { error: subTasksError } = await supabase.from('sub_tasks').delete().gte('id', '');
    if (subTasksError) console.warn('Error clearing sub_tasks:', subTasksError.message);

    const { error: tasksError } = await supabase.from('tasks').delete().gte('id', '');
    if (tasksError) console.warn('Error clearing tasks:', tasksError.message);

    const { error: assignmentsError } = await supabase.from('user_project_assignments').delete().gte('id', '');
    if (assignmentsError) console.warn('Error clearing user_project_assignments:', assignmentsError.message);

    const { error: projectsError } = await supabase.from('projects').delete().gte('id', '');
    if (projectsError) console.warn('Error clearing projects:', projectsError.message);

    const { error: usersError } = await supabase.from('users').delete().gte('id', '');
    if (usersError) console.warn('Error clearing users:', usersError.message);

    const { error: companiesError } = await supabase.from('companies').delete().gte('id', '');
    if (companiesError) console.warn('Error clearing companies:', companiesError.message);

    const { error: readStatusError } = await supabase.from('task_read_status').delete().gte('id', '');
    if (readStatusError) console.warn('Error clearing task_read_status:', readStatusError.message);

  } catch (error: any) {
    console.warn('Error during data clearing:', error.message);
  }
}

// Function to check if data already exists
async function checkExistingData() {
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const { data: projects } = await supabase.from('projects').select('id').limit(1);
  const { data: tasks } = await supabase.from('tasks').select('id').limit(1);
  
  return {
    hasCompanies: companies && companies.length > 0,
    hasUsers: users && users.length > 0,
    hasProjects: projects && projects.length > 0,
    hasTasks: tasks && tasks.length > 0,
  };
}

// Function to seed companies
async function seedCompanies(): Promise<Map<string, string>> {
  logProgress('Seeding companies', 'start');
  
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
        license_number: company.license_number,
        insurance_expiry: company.insurance_expiry,
        banner: company.banner,
        created_at: company.created_at,
        created_by: company.created_by,
        is_active: company.is_active,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert company ${company.name}: ${error.message}`);
    }

    companyMap.set(company.id, data.id);
  }

  logProgress('Seeding companies', 'success', `${companyMap.size} companies`);
  return companyMap;
}

// Function to seed users
async function seedUsers(companyMap: Map<string, string>): Promise<Map<string, string>> {
  logProgress('Seeding users', 'start');
  
  const userMap = new Map<string, string>();
  
  for (const user of MOCK_USERS) {
    const companyUuid = companyMap.get(user.company_id);
    if (!companyUuid) {
      throw new Error(`Company ${user.company_id} not found for user ${user.name}`);
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: companyUuid,
        position: user.position,
        phone: user.phone,
        created_at: user.created_at,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert user ${user.name}: ${error.message}`);
    }

    userMap.set(user.id, data.id);
  }

  logProgress('Seeding users', 'success', `${userMap.size} users`);
  return userMap;
}

// Function to update company references
async function updateCompanyReferences(companyMap: Map<string, string>, userMap: Map<string, string>) {
  logProgress('Updating company references', 'start');
  
  for (const [mockCompanyId, supabaseCompanyId] of companyMap) {
    const mockCompany = MOCK_COMPANIES.find(c => c.id === mockCompanyId);
    if (mockCompany && mockCompany.created_by) {
      const createdByUuid = userMap.get(mockCompany.created_by);
      if (createdByUuid) {
        const { error } = await supabase
          .from('companies')
          .update({ created_by: createdByUuid })
          .eq('id', supabaseCompanyId);

        if (error) {
          throw new Error(`Failed to update company ${mockCompany.name}: ${error.message}`);
        }
      }
    }
  }

  logProgress('Updating company references', 'success');
}

// Function to seed projects
async function seedProjects(userMap: Map<string, string>): Promise<Map<string, string>> {
  logProgress('Seeding projects', 'start');
  
  const projectMap = new Map<string, string>();
  
  for (const project of MOCK_PROJECTS) {
    const createdByUuid = userMap.get(project.created_by);
    if (!createdByUuid) {
      throw new Error(`User ${project.created_by} not found for project ${project.name}`);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        location: project.location,
        client_info: project.client_info,
        created_by: createdByUuid,
        created_at: project.created_at,
        updated_at: project.updated_at,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert project ${project.name}: ${error.message}`);
    }

    projectMap.set(project.id, data.id);
  }

  logProgress('Seeding projects', 'success', `${projectMap.size} projects`);
  return projectMap;
}

// Function to seed user project assignments
async function seedUserProjectAssignments(userMap: Map<string, string>, projectMap: Map<string, string>) {
  logProgress('Seeding user project assignments', 'start');
  
  let assignmentCount = 0;
  
  for (const assignment of MOCK_USER_PROJECT_ASSIGNMENTS) {
    const userUuid = userMap.get(assignment.user_id);
    const projectUuid = projectMap.get(assignment.project_id);
    const assignedByUuid = userMap.get(assignment.assigned_by);

    if (!userUuid || !projectUuid || !assignedByUuid) {
      console.warn(`Skipping assignment ${assignment.id} - missing references`);
      continue;
    }

    const { error } = await supabase
      .from('user_project_assignments')
      .insert({
        user_id: userUuid,
        project_id: projectUuid,
        category: assignment.category,
        assigned_at: assignment.assigned_at,
        assigned_by: assignedByUuid,
        is_active: assignment.is_active,
      });

    if (error) {
      throw new Error(`Failed to insert assignment ${assignment.id}: ${error.message}`);
    }

    assignmentCount++;
  }

  logProgress('Seeding user project assignments', 'success', `${assignmentCount} assignments`);
}

// Function to seed tasks
async function seedTasks(userMap: Map<string, string>, projectMap: Map<string, string>): Promise<Map<string, string>> {
  logProgress('Seeding tasks', 'start');
  
  const taskMap = new Map<string, string>();
  
  for (const task of MOCK_TASKS) {
    const projectUuid = projectMap.get(task.project_id);
    const assignedByUuid = userMap.get(task.assigned_by);

    if (!projectUuid || !assignedByUuid) {
      console.warn(`Skipping task ${task.id} - missing references`);
      continue;
    }

    // Map assigned_to user IDs to UUIDs
    const assignedToUuids = task.assigned_to.map(userId => userMap.get(userId)).filter(Boolean) as string[];

    const { data, error } = await supabase
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
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert task ${task.title}: ${error.message}`);
    }

    taskMap.set(task.id, data.id);
  }

  logProgress('Seeding tasks', 'success', `${taskMap.size} tasks`);
  return taskMap;
}

// Main migration function
async function migrateMockDataToSupabase() {
  logProgress('Starting mock data migration to Supabase');
  
  try {
    // Check if data already exists
    const existingData = await checkExistingData();
    
    if (existingData.hasCompanies || existingData.hasUsers || existingData.hasProjects || existingData.hasTasks) {
      console.log('\n⚠️  Existing data found in Supabase!');
      console.log('This script will clear all existing data and replace it with mock data.');
      console.log('If you want to keep existing data, please cancel this operation.');
      console.log('\nProceeding with data replacement...\n');
    }

    logProgress('Clearing existing data', 'start');
    await clearExistingData();
    logProgress('Clearing existing data', 'success');

    logProgress('Seeding companies', 'start');
    const companyMap = await seedCompanies();
    logProgress('Seeding companies', 'success', `${companyMap.size} companies`);

    logProgress('Seeding users', 'start');
    const userMap = await seedUsers(companyMap);
    logProgress('Seeding users', 'success', `${userMap.size} users`);

    logProgress('Updating company references', 'start');
    await updateCompanyReferences(companyMap, userMap);
    logProgress('Updating company references', 'success');

    logProgress('Seeding projects', 'start');
    const projectMap = await seedProjects(userMap);
    logProgress('Seeding projects', 'success', `${projectMap.size} projects`);

    logProgress('Seeding user project assignments', 'start');
    await seedUserProjectAssignments(userMap, projectMap);
    logProgress('Seeding user project assignments', 'success');

    logProgress('Seeding tasks', 'start');
    const taskMap = await seedTasks(userMap, projectMap);
    logProgress('Seeding tasks', 'success', `${taskMap.size} tasks`);

    console.log('\n🎉 Mock data migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${companyMap.size}`);
    console.log(`   Users: ${userMap.size}`);
    console.log(`   Projects: ${projectMap.size}`);
    console.log(`   User Project Assignments: ${MOCK_USER_PROJECT_ASSIGNMENTS.length}`);
    console.log(`   Tasks: ${taskMap.size}`);
    console.log('\n🚀 Your Supabase stores now have all the mock data!');
    
  } catch (error: any) {
    logProgress('Mock data migration', 'error', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the migration
migrateMockDataToSupabase();

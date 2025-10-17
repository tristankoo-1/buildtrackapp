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

// Function to clean up duplicate companies
async function cleanupDuplicateCompanies() {
  logProgress('Cleaning up duplicate companies');
  
  try {
    // Get all companies
    const { data: companies } = await supabase.from('companies').select('*').order('created_at');
    
    if (!companies) return;
    
    // Group by name
    const companyGroups = companies.reduce((acc, company) => {
      if (!acc[company.name]) {
        acc[company.name] = [];
      }
      acc[company.name].push(company);
      return acc;
    }, {} as Record<string, any[]>);
    
    let deletedCount = 0;
    
    // For each group, keep the first one and delete the rest
    for (const [name, group] of Object.entries(companyGroups)) {
      if (group.length > 1) {
        const toKeep = group[0];
        const toDelete = group.slice(1);
        
        console.log(`   Keeping company "${name}" (${toKeep.id}), deleting ${toDelete.length} duplicates`);
        
        for (const company of toDelete) {
          const { error } = await supabase.from('companies').delete().eq('id', company.id);
          if (error) {
            console.warn(`   Failed to delete duplicate company ${company.id}:`, error.message);
          } else {
            deletedCount++;
          }
        }
      }
    }
    
    logProgress('Cleaning up duplicate companies', 'success', `${deletedCount} duplicates removed`);
  } catch (error: any) {
    logProgress('Cleaning up duplicate companies', 'error', error.message);
  }
}

// Function to add missing projects
async function addMissingProjects() {
  logProgress('Adding missing projects');
  
  try {
    // Get existing projects
    const { data: existingProjects } = await supabase.from('projects').select('name');
    const existingNames = existingProjects?.map(p => p.name) || [];
    
    // Get users for created_by references
    const { data: users } = await supabase.from('users').select('id, email');
    const userMap = new Map<string, string>();
    users?.forEach(user => {
      if (user.email === "admin@buildtrack.com") {
        userMap.set("admin-buildtrack", user.id);
      } else if (user.email === "mike@metroplumbing.com") {
        userMap.set("mike-johnson", user.id);
      }
    });
    
    const missingProjects = [
      {
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
        created_by: userMap.get("mike-johnson"),
      },
      {
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
        created_by: userMap.get("mike-johnson"),
      },
    ];
    
    let addedCount = 0;
    
    for (const project of missingProjects) {
      if (existingNames.includes(project.name)) {
        console.log(`   Project "${project.name}" already exists, skipping`);
        continue;
      }
      
      if (!project.created_by) {
        console.warn(`   Skipping project "${project.name}" - no creator found`);
        continue;
      }
      
      const { error } = await supabase.from('projects').insert({
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        location: project.location,
        client_info: project.client_info,
        created_by: project.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) {
        console.warn(`   Failed to insert project "${project.name}":`, error.message);
      } else {
        addedCount++;
        console.log(`   Added project "${project.name}"`);
      }
    }
    
    logProgress('Adding missing projects', 'success', `${addedCount} projects added`);
  } catch (error: any) {
    logProgress('Adding missing projects', 'error', error.message);
  }
}

// Function to add missing tasks
async function addMissingTasks() {
  logProgress('Adding missing tasks');
  
  try {
    // Get existing tasks
    const { data: existingTasks } = await supabase.from('tasks').select('title');
    const existingTitles = existingTasks?.map(t => t.title) || [];
    
    // Get projects and users for references
    const { data: projects } = await supabase.from('projects').select('id, name');
    const { data: users } = await supabase.from('users').select('id, email');
    
    const projectMap = new Map<string, string>();
    projects?.forEach(project => {
      if (project.name === "Downtown Office Complex") {
        projectMap.set("downtown", project.id);
      } else if (project.name === "Residential Housing Development") {
        projectMap.set("residential", project.id);
      } else if (project.name === "Industrial Warehouse Electrical") {
        projectMap.set("warehouse", project.id);
      } else if (project.name === "Shopping Mall Power Upgrade") {
        projectMap.set("mall", project.id);
      }
    });
    
    const userMap = new Map<string, string>();
    users?.forEach(user => {
      if (user.email === "manager@buildtrack.com") {
        userMap.set("john-manager", user.id);
      } else if (user.email === "worker@buildtrack.com") {
        userMap.set("sarah-worker", user.id);
      } else if (user.email === "admin@buildtrack.com") {
        userMap.set("alex-admin", user.id);
      } else if (user.email === "dennis@buildtrack.com") {
        userMap.set("dennis", user.id);
      } else if (user.email === "lisa@eliteelectric.com") {
        userMap.set("lisa", user.id);
      } else if (user.email === "mike@metroplumbing.com") {
        userMap.set("mike", user.id);
      }
    });
    
    const missingTasks = [
      {
        title: "Fix Roof Leak in Building A",
        description: "Urgent repair needed for roof leak in the east wing of Building A. Water is damaging interior walls.",
        priority: "critical",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: "structural",
        project_key: "downtown",
        assigned_to: ["sarah-worker"],
        assigned_by: "john-manager",
      },
      {
        title: "Install Safety Barriers on 5th Floor",
        description: "Install temporary safety barriers around construction zone on 5th floor to prevent accidents.",
        priority: "high",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: "safety",
        project_key: "downtown",
        assigned_to: ["dennis"],
        assigned_by: "john-manager",
      },
      {
        title: "Inspect Foundation Pouring Quality",
        description: "Perform quality inspection on foundations for units 20-30. Check for cracks and proper curing.",
        priority: "medium",
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: "structural",
        project_key: "residential",
        assigned_to: ["dennis"],
        assigned_by: "john-manager",
      },
      {
        title: "Install Main Electrical Panel",
        description: "Install and wire the main electrical distribution panel for the warehouse facility.",
        priority: "high",
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        category: "electrical",
        project_key: "warehouse",
        assigned_to: ["lisa"],
        assigned_by: "mike",
      },
      {
        title: "Run Conduit for Lighting Circuits",
        description: "Install electrical conduit throughout the warehouse for lighting circuit distribution.",
        priority: "medium",
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        category: "electrical",
        project_key: "warehouse",
        assigned_to: ["lisa"],
        assigned_by: "mike",
      },
    ];
    
    let addedCount = 0;
    
    for (const task of missingTasks) {
      if (existingTitles.includes(task.title)) {
        console.log(`   Task "${task.title}" already exists, skipping`);
        continue;
      }
      
      const projectId = projectMap.get(task.project_key);
      const assignedById = userMap.get(task.assigned_by);
      const assignedToIds = task.assigned_to.map(key => userMap.get(key)).filter(Boolean) as string[];
      
      if (!projectId || !assignedById || assignedToIds.length === 0) {
        console.warn(`   Skipping task "${task.title}" - missing references`);
        continue;
      }
      
      const { error } = await supabase.from('tasks').insert({
        project_id: projectId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        due_date: task.due_date,
        assigned_to: assignedToIds,
        assigned_by: assignedById,
        attachments: [],
        created_at: new Date().toISOString(),
        current_status: "not_started",
        completion_percentage: 0,
        accepted: true,
        original_assigned_by: assignedById,
      });
      
      if (error) {
        console.warn(`   Failed to insert task "${task.title}":`, error.message);
      } else {
        addedCount++;
        console.log(`   Added task "${task.title}"`);
      }
    }
    
    logProgress('Adding missing tasks', 'success', `${addedCount} tasks added`);
  } catch (error: any) {
    logProgress('Adding missing tasks', 'error', error.message);
  }
}

// Main function
async function completeDataMigration() {
  logProgress('Starting complete data migration');
  
  try {
    await cleanupDuplicateCompanies();
    await addMissingProjects();
    await addMissingTasks();
    
    console.log('\n🎉 Complete data migration finished!');
    console.log('\n📊 Final Summary:');
    
    // Get final counts
    const { data: companies } = await supabase.from('companies').select('id');
    const { data: users } = await supabase.from('users').select('id');
    const { data: projects } = await supabase.from('projects').select('id');
    const { data: tasks } = await supabase.from('tasks').select('id');
    
    console.log(`   Companies: ${companies?.length || 0}`);
    console.log(`   Users: ${users?.length || 0}`);
    console.log(`   Projects: ${projects?.length || 0}`);
    console.log(`   Tasks: ${tasks?.length || 0}`);
    console.log('\n🚀 Your Supabase database is now complete with all mock data!');
    
  } catch (error: any) {
    logProgress('Complete data migration', 'error', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
completeDataMigration();


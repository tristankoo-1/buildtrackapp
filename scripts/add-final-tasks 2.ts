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

// Function to add remaining tasks
async function addRemainingTasks() {
  logProgress('Adding remaining tasks');
  
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
    
    const remainingTasks = [
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
    
    for (const task of remainingTasks) {
      if (existingTitles.includes(task.title)) {
        console.log(`   Task "${task.title}" already exists, skipping`);
        continue;
      }
      
      const projectId = projectMap.get(task.project_key);
      const assignedById = userMap.get(task.assigned_by);
      const assignedToIds = task.assigned_to.map(key => userMap.get(key)).filter(Boolean) as string[];
      
      if (!projectId || !assignedById || assignedToIds.length === 0) {
        console.warn(`   Skipping task "${task.title}" - missing references`);
        console.warn(`     Project: ${projectId ? 'found' : 'missing'}, Assigned by: ${assignedById ? 'found' : 'missing'}, Assigned to: ${assignedToIds.length}`);
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
        // Remove original_assigned_by as it doesn't exist in the schema
      });
      
      if (error) {
        console.warn(`   Failed to insert task "${task.title}":`, error.message);
      } else {
        addedCount++;
        console.log(`   Added task "${task.title}"`);
      }
    }
    
    logProgress('Adding remaining tasks', 'success', `${addedCount} tasks added`);
  } catch (error: any) {
    logProgress('Adding remaining tasks', 'error', error.message);
  }
}

// Main function
async function addFinalTasks() {
  logProgress('Adding final missing tasks');
  
  try {
    await addRemainingTasks();
    
    console.log('\n🎉 Final task addition completed!');
    
    // Get final counts
    const { data: companies } = await supabase.from('companies').select('id');
    const { data: users } = await supabase.from('users').select('id');
    const { data: projects } = await supabase.from('projects').select('id');
    const { data: tasks } = await supabase.from('tasks').select('id');
    
    console.log('\n📊 Final Database Summary:');
    console.log(`   Companies: ${companies?.length || 0}`);
    console.log(`   Users: ${users?.length || 0}`);
    console.log(`   Projects: ${projects?.length || 0}`);
    console.log(`   Tasks: ${tasks?.length || 0}`);
    console.log('\n🚀 Your Supabase database migration is now complete!');
    
  } catch (error: any) {
    logProgress('Adding final tasks', 'error', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
addFinalTasks();


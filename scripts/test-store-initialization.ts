#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

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

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!, 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

async function testStoreInitialization() {
  console.log('🧪 Testing Store Initialization...\n');
  
  try {
    // Step 1: Authenticate
    console.log('1️⃣ Authenticating user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'john.managera.new@test.com',
      password: 'password123'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    
    console.log('✅ Authentication successful');
    console.log(`   User ID: ${authData.user?.id}`);
    console.log(`   Email: ${authData.user?.email}\n`);
    
    // Step 2: Test project store logic manually
    console.log('2️⃣ Testing project store fetch logic...');
    
    // Test fetchProjects
    console.log('🔄 Fetching projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    
    if (projectsError) {
      console.error('❌ Projects fetch error:', projectsError);
    } else {
      console.log('✅ Projects fetched:', projects?.length || 0);
      projects?.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
    }
    
    // Test fetchUserProjectAssignments
    console.log('\\n🔄 Fetching user project assignments...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('user_project_assignments')
      .select('*')
      .eq('user_id', authData.user?.id)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });
    
    if (assignmentsError) {
      console.error('❌ Assignments fetch error:', assignmentsError);
    } else {
      console.log('✅ Assignments fetched:', assignments?.length || 0);
      assignments?.forEach(a => console.log(`   - Project ${a.project_id} as ${a.category}`));
    }
    
    // Step 3: Test task store logic manually
    console.log('\\n3️⃣ Testing task store fetch logic...');
    
    // Test fetchTasks
    console.log('🔄 Fetching tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (tasksError) {
      console.error('❌ Tasks fetch error:', tasksError);
    } else {
      console.log('✅ Tasks fetched:', tasks?.length || 0);
      tasks?.forEach(t => console.log(`   - ${t.title} (Project: ${t.project_id})`));
    }
    
    // Step 4: Simulate the getProjectsByUser logic
    console.log('\\n4️⃣ Testing getProjectsByUser logic...');
    const projectIds = assignments?.map(a => a.project_id) || [];
    const userProjects = projects?.filter(p => projectIds.includes(p.id)) || [];
    
    console.log(`📱 App should show ${userProjects.length} projects:`);
    userProjects.forEach(p => console.log(`   - ${p.name}`));
    
    // Step 5: Test user data lookup
    console.log('\\n5️⃣ Testing user data lookup...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id);
    
    if (userError) {
      console.error('❌ User data error:', userError);
    } else {
      const user = userData?.[0];
      console.log('✅ User data found:');
      console.log(`   Name: ${user?.name}`);
      console.log(`   Role: ${user?.role}`);
      
      // Test manager fallback logic
      if (user?.role === 'manager' && projectIds.length === 0) {
        console.log('   → Manager with no assignments: Should see all projects');
      } else if (user?.role === 'manager' && projectIds.length > 0) {
        console.log('   → Manager with assignments: Should see assigned projects only');
      } else {
        console.log('   → Non-manager: Should see assigned projects only');
      }
    }
    
    console.log('\\n🎯 Summary:');
    console.log(`   Projects in database: ${projects?.length || 0}`);
    console.log(`   User assignments: ${assignments?.length || 0}`);
    console.log(`   Tasks in database: ${tasks?.length || 0}`);
    console.log(`   Projects user should see: ${userProjects.length}`);
    
    if (userProjects.length >= 2 && (tasks?.length || 0) >= 5) {
      console.log('✅ Data is ready - app should work correctly!');
    } else {
      console.log('❌ Data issue detected - app may not show projects/tasks');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testStoreInitialization();


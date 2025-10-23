#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!, 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

async function testDataFetch() {
  console.log('🧪 Testing Data Fetch for john.managera.new@test.com...\n');
  
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
    
    // Step 2: Test user record lookup
    console.log('2️⃣ Checking user record...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id);
    
    if (userError) {
      console.error('❌ User record error:', userError);
    } else if (userRecord && userRecord.length > 0) {
      console.log('✅ User record found:');
      console.log(`   Name: ${userRecord[0].name}`);
      console.log(`   Role: ${userRecord[0].role}`);
      console.log(`   Company: ${userRecord[0].company_id}\n`);
    } else {
      console.log('❌ No user record found\n');
    }
    
    // Step 3: Test project assignments
    console.log('3️⃣ Checking project assignments...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('user_project_assignments')
      .select('*')
      .eq('user_id', authData.user?.id);
    
    if (assignmentsError) {
      console.error('❌ Project assignments error:', assignmentsError);
    } else {
      console.log(`✅ Found ${assignments?.length || 0} project assignments:`);
      assignments?.forEach(assignment => {
        console.log(`   - Project ${assignment.project_id} as ${assignment.category}`);
      });
      console.log('');
    }
    
    // Step 4: Test projects
    console.log('4️⃣ Checking projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      console.error('❌ Projects error:', projectsError);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects:`);
      projects?.forEach(project => {
        console.log(`   - ${project.name} (ID: ${project.id})`);
      });
      console.log('');
    }
    
    // Step 5: Test tasks
    console.log('5️⃣ Checking tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      console.error('❌ Tasks error:', tasksError);
    } else {
      console.log(`✅ Found ${tasks?.length || 0} tasks:`);
      tasks?.forEach(task => {
        console.log(`   - ${task.title} (Project: ${task.project_id})`);
      });
      console.log('');
    }
    
    // Step 6: Test app logic simulation
    console.log('6️⃣ Simulating app logic...');
    const projectIds = assignments?.map(a => a.project_id) || [];
    const userProjects = projects?.filter(project => projectIds.includes(project.id)) || [];
    
    console.log(`📱 What the app should show:`);
    console.log(`   Projects: ${userProjects.length} (${projectIds.length} assignments)`);
    console.log(`   Tasks: ${tasks?.length || 0}`);
    
    if (userProjects.length > 0) {
      console.log(`   Project names: ${userProjects.map(p => p.name).join(', ')}`);
    }
    
    console.log('\n🎯 Expected Results:');
    if (userProjects.length >= 2) {
      console.log('✅ User should see 2 projects in project picker');
    } else {
      console.log('❌ User will see 0 projects (this is the problem)');
    }
    
    if ((tasks?.length || 0) >= 5) {
      console.log('✅ User should see 5 tasks');
    } else {
      console.log('❌ User will see 0 tasks');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testDataFetch();


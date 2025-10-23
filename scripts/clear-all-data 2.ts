import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearAllData() {
  console.log('\n🗑️ Clearing all data from Supabase tables...\n');

  try {
    // List of tables to clear (in dependency order to avoid foreign key constraints)
    const tablesToClear = [
      'user_project_assignments',
      'user_task_assignments', 
      'task_read_statuses',
      'sub_tasks',
      'tasks',
      'projects',
      'users',
      'companies'
    ];

    console.log('📋 Tables to clear:');
    tablesToClear.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    console.log('');

    // Clear each table
    for (const table of tablesToClear) {
      console.log(`🧹 Clearing ${table}...`);
      
      const { error } = await supabase
        .from(table)
        .delete()
        .gte('id', ''); // Delete all rows

      if (error) {
        console.log(`   ❌ Error clearing ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table} cleared successfully`);
      }
    }

    // Verify all tables are empty
    console.log('\n🔍 Verifying tables are empty...');
    
    for (const table of tablesToClear) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Error checking ${table}: ${error.message}`);
      } else {
        const count = data ? data.length : 0;
        console.log(`   ${count === 0 ? '✅' : '⚠️'} ${table}: ${count} rows`);
      }
    }

    console.log('\n🎉 Data clearing completed!');
    console.log('📝 You can now start fresh with your testing.');

  } catch (error: any) {
    console.error('❌ Error clearing data:', error.message);
  }
}

clearAllData();


import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearAllDataDirect() {
  console.log('\n🗑️ Clearing all data from Supabase tables (direct method)...\n');

  try {
    // List of tables to clear (in dependency order)
    const tablesToClear = [
      'user_project_assignments',
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

    // Clear each table using different approaches
    for (const table of tablesToClear) {
      console.log(`🧹 Clearing ${table}...`);
      
      // Try method 1: Delete with neq condition
      let { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`   Method 1 failed: ${error.message}`);
        
        // Try method 2: Delete with is not null
        const { error: error2 } = await supabase
          .from(table)
          .delete()
          .not('id', 'is', null);

        if (error2) {
          console.log(`   Method 2 failed: ${error2.message}`);
          
          // Try method 3: Get all IDs first, then delete
          const { data: allRows, error: fetchError } = await supabase
            .from(table)
            .select('id');

          if (fetchError) {
            console.log(`   ❌ Error fetching ${table}: ${fetchError.message}`);
            continue;
          }

          if (allRows && allRows.length > 0) {
            const ids = allRows.map(row => row.id);
            const { error: deleteError } = await supabase
              .from(table)
              .delete()
              .in('id', ids);

            if (deleteError) {
              console.log(`   ❌ Error deleting ${table}: ${deleteError.message}`);
            } else {
              console.log(`   ✅ ${table} cleared successfully (${ids.length} rows)`);
            }
          } else {
            console.log(`   ✅ ${table} was already empty`);
          }
        } else {
          console.log(`   ✅ ${table} cleared successfully`);
        }
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
        .limit(5);

      if (error) {
        console.log(`   ❌ Error checking ${table}: ${error.message}`);
      } else {
        const count = data ? data.length : 0;
        console.log(`   ${count === 0 ? '✅' : '⚠️'} ${table}: ${count} rows`);
        
        if (count > 0) {
          console.log(`      Remaining rows: ${data.map(row => row.id).join(', ')}`);
        }
      }
    }

    console.log('\n🎉 Data clearing completed!');
    console.log('📝 You can now start fresh with your testing.');

  } catch (error: any) {
    console.error('❌ Error clearing data:', error.message);
  }
}

clearAllDataDirect();


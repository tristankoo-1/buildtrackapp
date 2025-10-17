-- Fix RLS policies for user_project_assignments table
-- This script adds the missing RLS policies that are blocking data access

-- Enable RLS on user_project_assignments if not already enabled
ALTER TABLE user_project_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow all operations on user_project_assignments" ON user_project_assignments;
CREATE POLICY "Allow all operations on user_project_assignments" ON user_project_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Also ensure sub_tasks table has RLS policies
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on sub_tasks" ON sub_tasks;
CREATE POLICY "Allow all operations on sub_tasks" ON sub_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Fix task_read_status table RLS policies
ALTER TABLE task_read_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on task_read_status" ON task_read_status;
CREATE POLICY "Allow all operations on task_read_status" ON task_read_status
  FOR ALL USING (true) WITH CHECK (true);

-- Also ensure other related tables have proper RLS policies
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on task_updates" ON task_updates;
CREATE POLICY "Allow all operations on task_updates" ON task_updates
  FOR ALL USING (true) WITH CHECK (true);

-- Task delegation history table
ALTER TABLE task_delegation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on task_delegation_history" ON task_delegation_history;
CREATE POLICY "Allow all operations on task_delegation_history" ON task_delegation_history
  FOR ALL USING (true) WITH CHECK (true);

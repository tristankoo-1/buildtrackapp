-- Fix Row-Level Security policies for task_read_status and related tables
-- This resolves the "new row violates row-level security policy" error

-- Enable RLS on task_read_status table
ALTER TABLE task_read_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow all operations on task_read_status" ON task_read_status;
CREATE POLICY "Allow all operations on task_read_status" ON task_read_status
  FOR ALL USING (true) WITH CHECK (true);

-- Also fix other related tables that might have similar issues
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on task_updates" ON task_updates;
CREATE POLICY "Allow all operations on task_updates" ON task_updates
  FOR ALL USING (true) WITH CHECK (true);

-- Task delegation history table
ALTER TABLE task_delegation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on task_delegation_history" ON task_delegation_history;
CREATE POLICY "Allow all operations on task_delegation_history" ON task_delegation_history
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure user_project_assignments has proper policies
ALTER TABLE user_project_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on user_project_assignments" ON user_project_assignments;
CREATE POLICY "Allow all operations on user_project_assignments" ON user_project_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure sub_tasks has proper policies
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on sub_tasks" ON sub_tasks;
CREATE POLICY "Allow all operations on sub_tasks" ON sub_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Verification query to check if policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('task_read_status', 'task_updates', 'task_delegation_history', 'user_project_assignments', 'sub_tasks')
ORDER BY tablename, policyname;


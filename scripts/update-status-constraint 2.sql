-- Update task status constraint to allow 'rejected' instead of 'blocked'
-- Run this in your Supabase SQL editor

-- First, drop the existing constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_current_status_check;

-- Add the new constraint with 'rejected' instead of 'blocked'
ALTER TABLE tasks ADD CONSTRAINT tasks_current_status_check 
CHECK (current_status IN ('not_started', 'in_progress', 'rejected', 'completed'));

-- Also update sub_tasks table if it exists
ALTER TABLE sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_current_status_check;
ALTER TABLE sub_tasks ADD CONSTRAINT sub_tasks_current_status_check 
CHECK (current_status IN ('not_started', 'in_progress', 'rejected', 'completed'));

-- Update task_updates table if it exists
ALTER TABLE task_updates DROP CONSTRAINT IF EXISTS task_updates_status_check;
ALTER TABLE task_updates ADD CONSTRAINT task_updates_status_check 
CHECK (status IN ('not_started', 'in_progress', 'rejected', 'completed'));

-- Verify the constraints were updated
SELECT conname, consrc FROM pg_constraint 
WHERE conname LIKE '%current_status%' OR conname LIKE '%status_check%';

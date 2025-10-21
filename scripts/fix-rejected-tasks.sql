-- Fix tasks that should be rejected
-- These tasks have accepted=false but status=not_started
-- They should be moved to status=rejected

-- Update tasks that were declined but still show as not_started
UPDATE tasks 
SET current_status = 'rejected' 
WHERE current_status = 'not_started' 
AND accepted = false;

-- Show the updated tasks
SELECT id, title, current_status, accepted, decline_reason 
FROM tasks 
WHERE current_status = 'rejected' 
ORDER BY created_at DESC;

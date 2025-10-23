-- Reset Users Script for Supabase SQL Editor
-- This script will:
-- 1. Clear all user data from Supabase
-- 2. Reinitialize with the same 6 users from mock data

-- Step 1: Clear all existing users
DELETE FROM users;

-- Step 2: Insert the 6 mock users
INSERT INTO users (id, email, name, role, company_id, position, phone, created_at) VALUES
  (
    '1',
    'manager@buildtrack.com',
    'John Manager',
    'manager',
    'comp-1',
    'Project Manager',
    '555-0101',
    NOW()
  ),
  (
    '2', 
    'worker@buildtrack.com',
    'Sarah Worker',
    'worker',
    'comp-1',
    'Construction Worker',
    '555-0102',
    NOW()
  ),
  (
    '3',
    'admin@buildtrack.com', 
    'Alex Administrator',
    'admin',
    'comp-1',
    'System Administrator',
    '555-0103',
    NOW()
  ),
  (
    '4',
    'lisa@eliteelectric.com',
    'Lisa Martinez',
    'worker',
    'comp-2',
    'Electrician',
    '555-0104',
    NOW()
  ),
  (
    '5',
    'admin@eliteelectric.com',
    'Mike Johnson',
    'admin',
    'comp-2',
    'Operations Manager',
    '555-0105',
    NOW()
  ),
  (
    '6',
    'dennis@buildtrack.com',
    'Dennis',
    'worker',
    'comp-1',
    'Site Supervisor',
    '555-0106',
    NOW()
  );

-- Step 3: Verify the data
SELECT 
  company_id,
  COUNT(*) as user_count,
  STRING_AGG(name, ', ') as user_names
FROM users 
GROUP BY company_id
ORDER BY company_id;

-- Step 4: Show total count
SELECT COUNT(*) as total_users FROM users;


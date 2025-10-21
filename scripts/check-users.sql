-- Check Current Users Script for Supabase SQL Editor
-- This script will show you the current state of users in your database

-- Show all users with their company assignments
SELECT 
  id,
  name,
  email,
  role,
  company_id,
  position,
  phone,
  created_at
FROM users 
ORDER BY company_id, name;

-- Show user count by company
SELECT 
  company_id,
  COUNT(*) as user_count,
  STRING_AGG(name, ', ') as user_names
FROM users 
GROUP BY company_id
ORDER BY company_id;

-- Show total user count
SELECT COUNT(*) as total_users FROM users;

-- Show any users without company assignments
SELECT 
  id,
  name,
  email,
  role,
  company_id
FROM users 
WHERE company_id IS NULL;

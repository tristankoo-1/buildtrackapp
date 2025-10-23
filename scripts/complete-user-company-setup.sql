-- Complete User and Company Setup Script
-- This script accomplishes all the requested tasks:
-- 1. Rename user "Dennis" to "Peter"
-- 2. Create new company "Insite Tech Ltd"
-- 3. Create new project "Buildtrack App"
-- 4. Create new users Dennis and Tristan for Insite Tech Ltd
-- 5. Assign Dennis and Tristan to the Buildtrack App project

-- ============================================
-- STEP 1: Rename user "Dennis" to "Peter"
-- ============================================

UPDATE users 
SET name = 'Peter'
WHERE name = 'Dennis' AND email = 'dennis@buildtrack.com';

-- Verify the change
SELECT id, name, email, position, company_id 
FROM users 
WHERE email = 'dennis@buildtrack.com';

-- ============================================
-- STEP 2: Create new company "Insite Tech Ltd"
-- ============================================

INSERT INTO companies (
  id,
  name,
  type,
  description,
  address,
  phone,
  email,
  website,
  license_number,
  is_active,
  banner,
  created_at
) VALUES (
  'comp-3',
  'Insite Tech Ltd',
  'consultant',
  'Technology consulting and software development company specializing in construction management solutions',
  '789 Tech Street, Innovation City, CA 90212',
  '555-0300',
  'info@insitetech.com',
  'https://insitetech.com',
  'TC-345678',
  true,
  '{"text":"Insite Tech Ltd","backgroundColor":"#10b981","textColor":"#ffffff","isVisible":true}',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verify company creation
SELECT id, name, type, description, email 
FROM companies 
WHERE id = 'comp-3';

-- ============================================
-- STEP 3: Create new project "Buildtrack App"
-- ============================================

INSERT INTO projects (
  id,
  name,
  description,
  status,
  start_date,
  end_date,
  budget,
  location,
  client_info,
  created_by,
  company_id,
  created_at,
  updated_at
) VALUES (
  'proj-buildtrack-app',
  'Buildtrack App',
  'Development and deployment of the BuildTrack mobile application for construction project management',
  'active',
  NOW(),
  NOW() + INTERVAL '6 months',
  150000.00,
  '{"street": "789 Tech Street", "city": "Innovation City", "state": "CA", "zipCode": "90212", "country": "USA"}',
  '{"name": "Insite Tech Ltd", "email": "info@insitetech.com", "phone": "555-0300"}',
  (SELECT id FROM users WHERE email = 'admin@buildtrack.com' LIMIT 1),
  'comp-3',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verify project creation
SELECT id, name, description, status, company_id 
FROM projects 
WHERE id = 'proj-buildtrack-app';

-- ============================================
-- STEP 4: Create new users for Insite Tech Ltd
-- ============================================

-- Create Dennis user for Insite Tech Ltd
INSERT INTO users (
  id,
  email,
  name,
  role,
  company_id,
  position,
  phone,
  created_at
) VALUES (
  'user-dennis-insite',
  'dennis@insitetech.com',
  'Dennis',
  'manager',
  'comp-3',
  'Senior Project Manager',
  '555-0301',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Create Tristan user for Insite Tech Ltd
INSERT INTO users (
  id,
  email,
  name,
  role,
  company_id,
  position,
  phone,
  created_at
) VALUES (
  'user-tristan-insite',
  'tristan@insitetech.com',
  'Tristan',
  'admin',
  'comp-3',
  'Technical Director',
  '555-0302',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Verify user creation
SELECT id, name, email, role, position, company_id 
FROM users 
WHERE company_id = 'comp-3'
ORDER BY name;

-- ============================================
-- STEP 5: Assign Dennis and Tristan to Buildtrack App project
-- ============================================

-- Assign Dennis to Buildtrack App project
INSERT INTO user_project_assignments (
  id,
  user_id,
  project_id,
  category,
  assigned_by,
  assigned_at,
  is_active
) VALUES (
  'assignment-dennis-buildtrack',
  'user-dennis-insite',
  'proj-buildtrack-app',
  'lead_project_manager',
  (SELECT id FROM users WHERE email = 'admin@buildtrack.com' LIMIT 1),
  NOW(),
  true
) ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

-- Assign Tristan to Buildtrack App project
INSERT INTO user_project_assignments (
  id,
  user_id,
  project_id,
  category,
  assigned_by,
  assigned_at,
  is_active
) VALUES (
  'assignment-tristan-buildtrack',
  'user-tristan-insite',
  'proj-buildtrack-app',
  'contractor',
  (SELECT id FROM users WHERE email = 'admin@buildtrack.com' LIMIT 1),
  NOW(),
  true
) ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

-- Verify assignments
SELECT 
  u.name as user_name,
  u.email,
  u.position,
  c.name as company_name,
  p.name as project_name,
  upa.category as project_role
FROM user_project_assignments upa
JOIN users u ON upa.user_id = u.id
JOIN companies c ON u.company_id = c.id
JOIN projects p ON upa.project_id = p.id
WHERE upa.project_id = 'proj-buildtrack-app'
ORDER BY u.name;

-- ============================================
-- FINAL VERIFICATION: Show complete setup
-- ============================================

-- Show all companies
SELECT 
  id,
  name,
  type,
  email,
  phone,
  (SELECT COUNT(*) FROM users WHERE company_id = companies.id) as user_count
FROM companies
ORDER BY name;

-- Show all users by company
SELECT 
  c.name as company_name,
  u.name as user_name,
  u.email,
  u.role,
  u.position
FROM users u
JOIN companies c ON u.company_id = c.id
ORDER BY c.name, u.name;

-- Show project assignments
SELECT 
  p.name as project_name,
  c.name as company_name,
  u.name as user_name,
  u.email,
  upa.category as project_role
FROM user_project_assignments upa
JOIN users u ON upa.user_id = u.id
JOIN companies c ON u.company_id = c.id
JOIN projects p ON upa.project_id = p.id
WHERE upa.is_active = true
ORDER BY p.name, u.name;

-- ============================================
-- SUMMARY
-- ============================================

-- Summary of changes made
SELECT 
  'Summary' as info,
  '1. Renamed Dennis to Peter in BuildTrack Construction Inc.' as change_1,
  '2. Created Insite Tech Ltd company' as change_2,
  '3. Created Buildtrack App project' as change_3,
  '4. Created Dennis (manager) and Tristan (admin) for Insite Tech Ltd' as change_4,
  '5. Assigned both users to Buildtrack App project' as change_5;

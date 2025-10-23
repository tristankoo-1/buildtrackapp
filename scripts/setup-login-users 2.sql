-- Setup Login Screen Users - SQL Version
-- Run this in your Supabase SQL Editor to create all 6 login users
-- This is an alternative to the automated scripts for when Node.js isn't available

-- Step 1: Create Companies
INSERT INTO companies (id, name, type, description, address, phone, email, website, license_number, is_active, banner, created_at)
VALUES 
  (
    'comp-1',
    'BuildTrack Construction Inc.',
    'general_contractor',
    'Leading general contractor specializing in commercial projects',
    '123 Builder Street, Construction City, CA 90210',
    '555-0100',
    'contact@buildtrack.com',
    'https://buildtrack.com',
    'GC-123456',
    true,
    '{"text":"BuildTrack Construction Inc.","backgroundColor":"#3b82f6","textColor":"#ffffff","isVisible":true}',
    NOW()
  ),
  (
    'comp-2',
    'Elite Electric Co.',
    'subcontractor',
    'Professional electrical services',
    '456 Electric Avenue, Power City, CA 90211',
    '555-0200',
    'info@eliteelectric.com',
    'https://eliteelectric.com',
    'EC-789012',
    true,
    '{"text":"Elite Electric Co.","backgroundColor":"#3b82f6","textColor":"#ffffff","isVisible":true}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  license_number = EXCLUDED.license_number,
  is_active = EXCLUDED.is_active,
  banner = EXCLUDED.banner;

-- Step 2: Create Auth Users
-- NOTE: This part MUST be done manually in the Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- 
-- Create these 6 users with password "password123" and email confirmation enabled:
--
-- 1. manager@buildtrack.com
-- 2. worker@buildtrack.com
-- 3. admin@buildtrack.com
-- 4. dennis@buildtrack.com
-- 5. lisa@eliteelectric.com
-- 6. admin@eliteelectric.com

-- Step 3: After creating auth users, get their UUIDs and create user records
-- First, check the auth user IDs:
SELECT id, email FROM auth.users 
WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
);

-- Step 4: Insert user records (replace the UUIDs with actual ones from Step 3)
-- Run this AFTER you've created the auth users and have their UUIDs:

/*
INSERT INTO users (id, email, name, role, company_id, position, phone, created_at)
VALUES
  -- BuildTrack users (replace UUID_1, UUID_2, etc. with actual UUIDs from auth.users)
  ('UUID_1', 'manager@buildtrack.com', 'John Manager', 'manager', 'comp-1', 'Project Manager', '555-0101', NOW()),
  ('UUID_2', 'worker@buildtrack.com', 'Sarah Worker', 'worker', 'comp-1', 'Construction Worker', '555-0102', NOW()),
  ('UUID_3', 'admin@buildtrack.com', 'Alex Administrator', 'admin', 'comp-1', 'System Administrator', '555-0103', NOW()),
  ('UUID_4', 'dennis@buildtrack.com', 'Dennis', 'worker', 'comp-1', 'Site Supervisor', '555-0106', NOW()),
  -- Elite Electric users
  ('UUID_5', 'lisa@eliteelectric.com', 'Lisa Martinez', 'worker', 'comp-2', 'Electrician', '555-0104', NOW()),
  ('UUID_6', 'admin@eliteelectric.com', 'Mike Johnson', 'admin', 'comp-2', 'Operations Manager', '555-0105', NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone;
*/

-- Verification: Check that everything is set up
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies WHERE id IN ('comp-1', 'comp-2')
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM users WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
)
UNION ALL
SELECT 'Auth Users' as table_name, COUNT(*) as count FROM auth.users WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
);


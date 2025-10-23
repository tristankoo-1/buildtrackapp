-- Migration Script: Add Separate Roles Table
-- This script migrates the existing database to use a separate roles table
-- Run this in Supabase SQL Editor AFTER backing up your data

-- ============================================
-- STEP 1: Create Roles Table
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_system_role BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Seed Default Roles
-- ============================================

INSERT INTO roles (name, display_name, description, level, is_system_role) 
VALUES
  ('admin', 'Administrator', 'Full system access with all permissions', 1, true),
  ('manager', 'Manager', 'Can manage projects, tasks, and team members', 2, true),
  ('worker', 'Worker', 'Can view and update assigned tasks', 3, true),
  ('lead_project_manager', 'Lead Project Manager', 'Oversees entire project execution', 2, true),
  ('contractor', 'Contractor', 'Main contractor for project work', 2, true),
  ('subcontractor', 'Subcontractor', 'Specialized contractor for specific tasks', 3, true),
  ('inspector', 'Inspector', 'Reviews and inspects work quality', 2, true),
  ('architect', 'Architect', 'Provides architectural guidance and approvals', 2, true),
  ('engineer', 'Engineer', 'Provides engineering guidance and approvals', 2, true),
  ('foreman', 'Foreman', 'Supervises workers on-site', 2, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 3: Add default_role_id to Users Table
-- ============================================

-- Add the new column (nullable initially)
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_role_id UUID REFERENCES roles(id);

-- Update existing users to map their old role to the new role_id
UPDATE users u
SET default_role_id = (
  SELECT r.id FROM roles r 
  WHERE r.name = u.role
)
WHERE u.default_role_id IS NULL AND u.role IS NOT NULL;

-- For users without a role, set to 'worker' as default
UPDATE users u
SET default_role_id = (
  SELECT r.id FROM roles r WHERE r.name = 'worker'
)
WHERE u.default_role_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_default_role_id ON users(default_role_id);

-- Add updated_at column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- STEP 4: Create User Project Roles Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_project_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('lead_project_manager', 'contractor', 'subcontractor', 'inspector', 'architect', 'engineer', 'worker', 'foreman')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, project_id)  -- One role per user per project
);

-- ============================================
-- STEP 5: Migrate Data from user_project_assignments
-- ============================================

-- If user_project_assignments table exists, migrate the data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_project_assignments') THEN
    -- Migrate existing assignments (take the most recent assignment if there are duplicates)
    -- First, try to map category to role name
    INSERT INTO user_project_roles (user_id, project_id, role_id, category, assigned_at, assigned_by, is_active)
    SELECT DISTINCT ON (upa.user_id, upa.project_id)
      upa.user_id,
      upa.project_id,
      COALESCE(
        (SELECT r.id FROM roles r WHERE r.name = upa.category LIMIT 1),
        u.default_role_id
      ) as role_id,
      upa.category,
      upa.assigned_at,
      upa.assigned_by,
      upa.is_active
    FROM user_project_assignments upa
    JOIN users u ON upa.user_id = u.id
    WHERE COALESCE(
        (SELECT r.id FROM roles r WHERE r.name = upa.category LIMIT 1),
        u.default_role_id
      ) IS NOT NULL
    ORDER BY upa.user_id, upa.project_id, upa.assigned_at DESC
    ON CONFLICT (user_id, project_id) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- STEP 6: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_project_roles_user_id ON user_project_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_project_roles_project_id ON user_project_roles(project_id);
CREATE INDEX IF NOT EXISTS idx_user_project_roles_role_id ON user_project_roles(role_id);

-- ============================================
-- STEP 7: Enable RLS on New Tables
-- ============================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 8: Create RLS Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "Users can view company project roles" ON user_project_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Admins can update roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can insert user_project_roles" ON user_project_roles;
DROP POLICY IF EXISTS "Authenticated users can update user_project_roles" ON user_project_roles;

-- Roles: All authenticated users can view roles
CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- User Project Roles: Users can view roles for their company
CREATE POLICY "Users can view company project roles" ON user_project_roles
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Admins can insert roles
CREATE POLICY "Admins can insert roles" ON roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.default_role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admins can update roles
CREATE POLICY "Admins can update roles" ON roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.default_role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Authenticated users can insert user_project_roles
CREATE POLICY "Authenticated users can insert user_project_roles" ON user_project_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update user_project_roles
CREATE POLICY "Authenticated users can update user_project_roles" ON user_project_roles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 9: Update Existing Policies
-- ============================================

-- Update projects policy to use user_project_roles instead of user_project_assignments
DROP POLICY IF EXISTS "Users can view assigned projects" ON projects;
CREATE POLICY "Users can view assigned projects" ON projects
  FOR SELECT USING (
    created_by = auth.uid() OR
    id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Update tasks policy
DROP POLICY IF EXISTS "Users can view project tasks" ON tasks;
CREATE POLICY "Users can view project tasks" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR
    assigned_by = auth.uid() OR
    auth.uid() = ANY(assigned_to)
  );

-- Update sub_tasks policy
DROP POLICY IF EXISTS "Users can view project sub tasks" ON sub_tasks;
CREATE POLICY "Users can view project sub tasks" ON sub_tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR
    assigned_by = auth.uid() OR
    auth.uid() = ANY(assigned_to)
  );

-- Update task_updates policy
DROP POLICY IF EXISTS "Users can view task updates" ON task_updates;
CREATE POLICY "Users can view task updates" ON task_updates
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE 
        project_id IN (
          SELECT project_id FROM user_project_roles 
          WHERE user_id = auth.uid() AND is_active = true
        ) OR
        assigned_by = auth.uid() OR
        auth.uid() = ANY(assigned_to)
    )
  );

-- Update task_delegation_history policy
DROP POLICY IF EXISTS "Users can view delegation history" ON task_delegation_history;
CREATE POLICY "Users can view delegation history" ON task_delegation_history
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE 
        project_id IN (
          SELECT project_id FROM user_project_roles 
          WHERE user_id = auth.uid() AND is_active = true
        ) OR
        assigned_by = auth.uid() OR
        auth.uid() = ANY(assigned_to)
    )
  );

-- ============================================
-- STEP 10: Create Triggers
-- ============================================

-- Add trigger for roles updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for users updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 11: Create Helper Functions
-- ============================================

-- Function to get user's role on a specific project
CREATE OR REPLACE FUNCTION get_user_project_roles(p_user_id UUID, p_project_id UUID)
RETURNS TABLE(role_name TEXT, role_level INTEGER, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.level, upr.category
  FROM user_project_roles upr
  JOIN roles r ON upr.role_id = r.id
  WHERE upr.user_id = p_user_id 
    AND upr.project_id = p_project_id
    AND upr.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has specific role on project
CREATE OR REPLACE FUNCTION user_has_role_on_project(
  p_user_id UUID, 
  p_project_id UUID, 
  p_role_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_project_roles upr
    JOIN roles r ON upr.role_id = r.id
    WHERE upr.user_id = p_user_id 
      AND upr.project_id = p_project_id
      AND r.name = p_role_name
      AND upr.is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's highest role level on project
CREATE OR REPLACE FUNCTION get_user_highest_role_level(p_user_id UUID, p_project_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT MIN(r.level)
    FROM user_project_roles upr
    JOIN roles r ON upr.role_id = r.id
    WHERE upr.user_id = p_user_id 
      AND upr.project_id = p_project_id
      AND upr.is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Optional: Drop old role column from users (only after verifying migration)
-- ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Optional: Rename or drop user_project_assignments table (only after verifying migration)
-- ALTER TABLE user_project_assignments RENAME TO user_project_assignments_old;
-- or
-- DROP TABLE user_project_assignments;

SELECT 'Migration completed successfully!' as status;


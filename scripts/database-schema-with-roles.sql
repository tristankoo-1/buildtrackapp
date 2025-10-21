-- BuildTrack Database Schema with Separate Roles Table
-- Run this in Supabase SQL Editor to create the database structure
-- This version uses a separate roles table for better flexibility

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general_contractor', 'subcontractor', 'supplier', 'consultant', 'owner')),
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo TEXT,
  tax_id TEXT,
  license_number TEXT,
  insurance_expiry TIMESTAMPTZ,
  banner JSONB DEFAULT '{"text":"","backgroundColor":"#3b82f6","textColor":"#ffffff","isVisible":true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

-- Roles Table (NEW - Centralized role definitions)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL, -- For hierarchy: 1=Admin, 2=Manager, 3=Worker, etc.
  permissions JSONB DEFAULT '{}'::jsonb, -- Store role-specific permissions
  is_system_role BOOLEAN DEFAULT true, -- System roles vs custom roles
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (Modified - role removed, added default_role_id)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  default_role_id UUID REFERENCES roles(id), -- Default role for the user across the system
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  budget NUMERIC,
  location JSONB NOT NULL,
  client_info JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATIONSHIP TABLES
-- ============================================

-- User Project Roles Table (NEW - Replaces user_project_assignments)
-- Users have ONE role per project, but different roles across different projects
CREATE TABLE user_project_roles (
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
-- TASK TABLES
-- ============================================

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('safety', 'electrical', 'plumbing', 'structural', 'general', 'materials')),
  due_date TIMESTAMPTZ NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('not_started', 'in_progress', 'rejected', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_to UUID[] NOT NULL,
  assigned_by UUID REFERENCES users(id),
  location JSONB,
  attachments TEXT[] DEFAULT '{}',
  accepted BOOLEAN DEFAULT false,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub Tasks Table
CREATE TABLE sub_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  parent_sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('safety', 'electrical', 'plumbing', 'structural', 'general', 'materials')),
  due_date TIMESTAMPTZ NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('not_started', 'in_progress', 'rejected', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  assigned_to UUID[] NOT NULL,
  assigned_by UUID REFERENCES users(id),
  location JSONB,
  attachments TEXT[] DEFAULT '{}',
  accepted BOOLEAN DEFAULT false,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Updates Table
CREATE TABLE task_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'rejected', 'completed')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Task Delegation History Table
CREATE TABLE task_delegation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Task Read Status Table
CREATE TABLE task_read_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id, sub_task_id)
);

-- ============================================
-- SEED DEFAULT ROLES
-- ============================================

INSERT INTO roles (name, display_name, description, level, is_system_role) VALUES
  ('admin', 'Administrator', 'Full system access with all permissions', 1, true),
  ('manager', 'Manager', 'Can manage projects, tasks, and team members', 2, true),
  ('worker', 'Worker', 'Can view and update assigned tasks', 3, true),
  ('lead_project_manager', 'Lead Project Manager', 'Oversees entire project execution', 2, true),
  ('contractor', 'Contractor', 'Main contractor for project work', 2, true),
  ('subcontractor', 'Subcontractor', 'Specialized contractor for specific tasks', 3, true),
  ('inspector', 'Inspector', 'Reviews and inspects work quality', 2, true),
  ('architect', 'Architect', 'Provides architectural guidance and approvals', 2, true),
  ('engineer', 'Engineer', 'Provides engineering guidance and approvals', 2, true),
  ('foreman', 'Foreman', 'Supervises workers on-site', 2, true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_default_role_id ON users(default_role_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_user_project_roles_user_id ON user_project_roles(user_id);
CREATE INDEX idx_user_project_roles_project_id ON user_project_roles(project_id);
CREATE INDEX idx_user_project_roles_role_id ON user_project_roles(role_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks USING GIN(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_sub_tasks_parent_task_id ON sub_tasks(parent_task_id);
CREATE INDEX idx_sub_tasks_project_id ON sub_tasks(project_id);
CREATE INDEX idx_sub_tasks_assigned_to ON sub_tasks USING GIN(assigned_to);
CREATE INDEX idx_task_updates_task_id ON task_updates(task_id);
CREATE INDEX idx_task_updates_sub_task_id ON task_updates(sub_task_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_delegation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_read_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Roles: All authenticated users can view roles
CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Companies: Users can view their own company
CREATE POLICY "Users can view their company" ON companies
  FOR SELECT USING (
    id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Users: Users can view users from their company
CREATE POLICY "Users can view company users" ON users
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Projects: Users can view projects they're assigned to or created
CREATE POLICY "Users can view assigned projects" ON projects
  FOR SELECT USING (
    created_by = auth.uid() OR
    id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- User Project Roles: Users can view roles for their company
CREATE POLICY "Users can view company project roles" ON user_project_roles
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Tasks: Users can view tasks from projects they're assigned to
CREATE POLICY "Users can view project tasks" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR
    assigned_by = auth.uid() OR
    auth.uid() = ANY(assigned_to)
  );

-- Sub Tasks: Same as tasks
CREATE POLICY "Users can view project sub tasks" ON sub_tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR
    assigned_by = auth.uid() OR
    auth.uid() = ANY(assigned_to)
  );

-- Task Updates: Users can view updates for tasks they can see
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

-- Task Delegation History: Users can view delegation history for tasks they can see
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

-- Task Read Status: Users can view their own read status
CREATE POLICY "Users can view own read status" ON task_read_status
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- INSERT/UPDATE/DELETE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can insert companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies" ON companies
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert roles" ON roles
  FOR INSERT WITH CHECK (
    (SELECT default_role_id FROM users WHERE id = auth.uid()) IN 
    (SELECT id FROM roles WHERE name = 'admin')
  );

CREATE POLICY "Admins can update roles" ON roles
  FOR UPDATE USING (
    (SELECT default_role_id FROM users WHERE id = auth.uid()) IN 
    (SELECT id FROM roles WHERE name = 'admin')
  );

CREATE POLICY "Authenticated users can insert users" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update users" ON users
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert user_project_roles" ON user_project_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update user_project_roles" ON user_project_roles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tasks" ON tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sub_tasks" ON sub_tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sub_tasks" ON sub_tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert task_updates" ON task_updates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert task_delegation_history" ON task_delegation_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert task_read_status" ON task_read_status
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update task_read_status" ON task_read_status
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGERS
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_tasks_updated_at BEFORE UPDATE ON sub_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
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


-- BuildTrack Database Schema
-- Run this in Supabase SQL Editor to create the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- User Project Assignments Table
CREATE TABLE user_project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('lead_project_manager', 'contractor', 'subcontractor', 'inspector', 'architect', 'engineer', 'worker', 'foreman')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, project_id, category)
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('safety', 'electrical', 'plumbing', 'structural', 'general', 'materials')),
  due_date TIMESTAMPTZ NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('not_started', 'in_progress', 'blocked', 'completed')),
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
  current_status TEXT NOT NULL CHECK (current_status IN ('not_started', 'in_progress', 'blocked', 'completed')),
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
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed')),
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

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks USING GIN(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_sub_tasks_parent_task_id ON sub_tasks(parent_task_id);
CREATE INDEX idx_sub_tasks_project_id ON sub_tasks(project_id);
CREATE INDEX idx_sub_tasks_assigned_to ON sub_tasks USING GIN(assigned_to);
CREATE INDEX idx_task_updates_task_id ON task_updates(task_id);
CREATE INDEX idx_task_updates_sub_task_id ON task_updates(sub_task_id);
CREATE INDEX idx_user_project_assignments_user_id ON user_project_assignments(user_id);
CREATE INDEX idx_user_project_assignments_project_id ON user_project_assignments(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_delegation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - users can only see their company's data)
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
      SELECT project_id FROM user_project_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- User Project Assignments: Users can view assignments for their company
CREATE POLICY "Users can view company assignments" ON user_project_assignments
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
      SELECT project_id FROM user_project_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR
    assigned_by = auth.uid() OR
    auth.uid() = ANY(assigned_to)
  );

-- Sub Tasks: Same as tasks
CREATE POLICY "Users can view project sub tasks" ON sub_tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM user_project_assignments 
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
          SELECT project_id FROM user_project_assignments 
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
          SELECT project_id FROM user_project_assignments 
          WHERE user_id = auth.uid() AND is_active = true
        ) OR
        assigned_by = auth.uid() OR
        auth.uid() = ANY(assigned_to)
    )
  );

-- Task Read Status: Users can view their own read status
CREATE POLICY "Users can view own read status" ON task_read_status
  FOR SELECT USING (user_id = auth.uid());

-- Insert/Update/Delete policies (more restrictive)
-- For now, allow all operations for authenticated users
-- You can make these more restrictive based on your needs

CREATE POLICY "Authenticated users can insert companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies" ON companies
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert users" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update users" ON users
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert user_project_assignments" ON user_project_assignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update user_project_assignments" ON user_project_assignments
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_tasks_updated_at BEFORE UPDATE ON sub_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) after seeding
-- Run this AFTER you've successfully seeded the database

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (simplified to avoid recursion)

-- Companies: Allow all operations for now (you can make this more restrictive later)
CREATE POLICY "Allow all operations on companies" ON companies
  FOR ALL USING (true) WITH CHECK (true);

-- Users: Allow all operations for now
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Projects: Allow all operations for now
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

-- Tasks: Allow all operations for now
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Note: These are permissive policies for development.
-- In production, you should implement more restrictive policies based on your security requirements.


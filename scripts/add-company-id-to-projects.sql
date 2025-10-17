-- Add company_id field to projects table
-- This allows direct identification of which company owns each project

-- Step 1: Add the company_id column to projects table
ALTER TABLE projects 
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Step 2: Populate the company_id field for existing projects
-- This gets the company_id from the user who created the project
UPDATE projects 
SET company_id = (
    SELECT u.company_id 
    FROM users u 
    WHERE u.id = projects.created_by
)
WHERE company_id IS NULL;

-- Step 3: Make company_id NOT NULL after populating existing data
-- (Optional - uncomment if you want to enforce that all projects must have a company)
-- ALTER TABLE projects ALTER COLUMN company_id SET NOT NULL;

-- Step 4: Create an index for better query performance
CREATE INDEX idx_projects_company_id ON projects(company_id);

-- Step 5: Add a comment to document the field
COMMENT ON COLUMN projects.company_id IS 'Company that owns this project (inherited from project creator)';

-- Verification query to check the results
SELECT 
    p.id,
    p.name,
    p.company_id,
    c.name as company_name,
    u.name as created_by_name,
    u.company_id as creator_company_id
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users u ON p.created_by = u.id
ORDER BY p.created_at;


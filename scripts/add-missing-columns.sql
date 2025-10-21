-- Add missing columns to projects table
-- Run this in Supabase SQL Editor

-- Add company_id column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Update existing projects with company_id
UPDATE projects 
SET company_id = (
    SELECT u.company_id 
    FROM users u 
    WHERE u.id = projects.created_by
)
WHERE created_by IS NOT NULL;

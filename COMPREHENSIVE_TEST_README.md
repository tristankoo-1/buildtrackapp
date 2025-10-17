# Comprehensive BuildTrack Test Script

This script creates a complete test scenario for the buildtrack app with realistic data for testing all functionality.

## Prerequisites

1. **Supabase Setup**: Ensure your Supabase database is set up with the required tables
2. **Environment Variables**: Create a `.env` file in the project root with:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Required for admin operations (creating auth users)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Test Scenario

The script creates:

### Companies
- **Company A** (General Contractor): 1 Manager + 2 Workers
- **Company B** (Subcontractor): 1 Manager + 1 Worker

### Projects
- **Project A** (Commercial Building): includes all users
- **Project B** (Residential Complex): includes Company A users only

### Tasks & Subtasks
- 5 Tasks under Project A:
  1. Foundation Inspection (high priority, structural)
  2. Electrical Wiring Phase 1 (medium priority, electrical)
  3. Plumbing Installation (high priority, plumbing)
  4. Safety Equipment Check (critical priority, safety)
  5. Material Delivery Coordination (medium priority, materials)
- Each task has 1 subtask randomly assigned to workers from both companies

## Usage

### Run the Test Script
```bash
npx tsx scripts/comprehensive-test.ts
```

### Clean Up Test Data
```bash
npx tsx scripts/comprehensive-test.ts cleanup
```

## Created Users & Login Credentials

All users have the password: `password123`

- **John Manager A** (john.managera@test.com) - Company A Manager
- **Alice Worker A1** (alice.workera1@test.com) - Company A Worker
- **Bob Worker A2** (bob.workera2@test.com) - Company A Worker
- **Sarah Manager B** (sarah.managerb@test.com) - Company B Manager
- **Tom Worker B** (tom.workerb@test.com) - Company B Worker

## What Gets Created

1. **2 Companies** with full company profiles
2. **5 Users** with full authentication (email/password)
3. **2 Projects** with realistic project data
4. **Project Assignments** with appropriate roles
5. **5 Tasks** with realistic construction task details
6. **5 Subtasks** randomly assigned to workers

## Testing Features

After running the script, you can test:

- User authentication and role-based access
- Project management and team assignments
- Task creation and assignment workflows
- Subtask management and delegation
- Cross-company collaboration
- Lead Project Manager functionality
- Company isolation and permissions

## Troubleshooting

### Environment Variables
- Ensure all three Supabase keys are correctly set
- The service role key is required for creating auth users
- Check your Supabase project settings for the correct URLs and keys

### Database Schema
- Ensure your Supabase database has all required tables
- Run the database schema setup scripts first if needed

### Permissions
- The service role key must have admin privileges
- Check your Supabase RLS policies if you encounter permission errors

## Cleanup

The script includes a cleanup function that removes all test data:
- Removes tasks, subtasks, project assignments, projects, users, and companies
- Only removes entities with IDs starting with "test-"
- Safe to run multiple times

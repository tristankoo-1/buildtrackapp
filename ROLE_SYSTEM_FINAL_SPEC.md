# Role System - Final Specification

## ✅ Corrected Design: One Role Per User Per Project

### Key Principle
**Users have exactly ONE role per project, but can have DIFFERENT roles across different projects.**

---

## Database Constraint

```sql
CREATE TABLE user_project_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  role_id UUID REFERENCES roles(id),
  ...
  UNIQUE(user_id, project_id)  -- ⭐ ONE role per user per project
);
```

---

## Examples

### ✅ Correct: Different Roles on Different Projects
```typescript
// John is a Manager on Project A
{
  user_id: "john-id",
  project_id: "project-a",
  role_id: "manager-role-id"
}

// John is a Worker on Project B
{
  user_id: "john-id",
  project_id: "project-b",
  role_id: "worker-role-id"
}

// ✅ This is allowed - different projects
```

### ❌ Incorrect: Multiple Roles on Same Project
```typescript
// John is a Manager on Project A
{
  user_id: "john-id",
  project_id: "project-a",
  role_id: "manager-role-id"
}

// Trying to also make John an Inspector on Project A
{
  user_id: "john-id",
  project_id: "project-a",
  role_id: "inspector-role-id"
}

// ❌ This will FAIL - UNIQUE constraint violation
// Cannot have multiple roles on same project
```

---

## Current System Status

### ✅ What's Implemented

1. **Separate Roles Table**
   - 10 system roles defined
   - Support for custom roles
   - Role hierarchy (levels 1-3)
   - Permission system (JSONB)

2. **User Project Roles Table**
   - Maps users to projects with roles
   - UNIQUE constraint: (user_id, project_id)
   - One role per user per project

3. **Database Schema**
   - `roles` table
   - `user_project_roles` table
   - `users.default_role_id` column
   - Helper functions for role queries

4. **Code & Documentation**
   - TypeScript types updated
   - Role store (Zustand) created
   - Comprehensive documentation
   - Migration scripts
   - Seed scripts

---

## Files Created/Updated

### ✅ Corrected Files
1. `scripts/database-schema-with-roles.sql` - ✅ UNIQUE(user_id, project_id)
2. `scripts/migration-add-roles-table.sql` - ✅ UNIQUE(user_id, project_id)
3. `ROLE_SYSTEM_GUIDE.md` - ✅ Updated examples
4. `ROLE_SYSTEM_BEFORE_AFTER.md` - ✅ Updated examples
5. `ROLE_SYSTEM_IMPLEMENTATION_SUMMARY.md` - ✅ Updated description

### ✅ New Files
6. `TASK_ASSIGNMENTS_REPORT.md` - Task and user assignment report
7. `scripts/list-task-assignments.js` - Script to generate task reports

---

## Task Assignment Report Summary

### Users and Their Task Counts

| User | Role | Position | Tasks Assigned |
|------|------|----------|----------------|
| Alice Worker A1 | worker | Construction Worker | 5 |
| Bob Worker A2 | worker | Construction Worker | 5 |
| Tom Worker B | worker | Subcontractor Worker | 5 |
| John Manager A | manager | Project Manager | 4 |
| Sarah Manager B | manager | Subcontractor Manager | 2 |

### Total Tasks: 11
- All tasks are in "NOT STARTED" status
- Priority distribution:
  - Critical: 3 tasks (27.3%)
  - High: 4 tasks (36.4%)
  - Medium: 4 tasks (36.4%)

---

## Benefits of One Role Per Project

### ✅ Advantages

1. **Simplicity**
   - Clear, single role per user on each project
   - Easy to understand and manage
   - No role conflicts

2. **Performance**
   - Simple queries (no need to aggregate multiple roles)
   - Efficient indexes
   - Fast role checks

3. **Data Integrity**
   - UNIQUE constraint prevents duplicates
   - No ambiguity about permissions
   - Clean data model

4. **Flexibility Where Needed**
   - Still allows different roles across projects
   - Role can be updated/changed per project
   - Supports all real-world use cases

### ✅ Real-World Scenarios

#### Scenario 1: User Changes Role on Project
```typescript
// John starts as Worker on Project A
await assignRole("john-id", "project-a", "worker-role-id");

// Later, John gets promoted to Manager on Project A
await assignRole("john-id", "project-a", "manager-role-id");
// Old role automatically replaced due to UNIQUE constraint
```

#### Scenario 2: User Has Different Expertise on Different Projects
```typescript
// Sarah is an Architect on the Office Building project
await assignRole("sarah-id", "office-building", "architect-role-id");

// Sarah is a Project Manager on the Residential project
await assignRole("sarah-id", "residential-complex", "manager-role-id");

// ✅ Both allowed - different projects
```

#### Scenario 3: User's Default Role
```typescript
// User's system-wide default role
user.defaultRoleId = "manager-role-id";

// But on specific projects, can have different roles
// Project A: Worker
// Project B: Manager (uses default)
// Project C: Inspector
```

---

## Next Steps

### 1. Deploy to Database ⏳
```bash
# Run migration script in Supabase SQL Editor
scripts/migration-add-roles-table.sql
```

### 2. Seed Roles Data ⏳
```bash
export PATH="/path/to/node/bin:$PATH"
node scripts/seed-roles.js
```

### 3. Update Application Code ⏳
```typescript
// Initialize roles on app start
import { useRoleStore } from "./src/state/roleStore";

useEffect(() => {
  useRoleStore.getState().fetchRoles();
}, []);
```

### 4. Test Role Assignment ⏳
```typescript
// Assign user to project with role
const contractorRole = useRoleStore.getState().getRoleByName('contractor');
await supabase.from('user_project_roles').insert({
  user_id: userId,
  project_id: projectId,
  role_id: contractorRole.id
});
```

---

## Summary

| Aspect | Specification |
|--------|--------------|
| Roles per user per project | **Exactly 1** |
| Different roles across projects | ✅ Yes |
| Custom roles | ✅ Yes |
| Role hierarchy | ✅ Yes (levels 1-3) |
| Permissions per role | ✅ Yes (JSONB) |
| Database constraint | `UNIQUE(user_id, project_id)` |
| Status | ✅ Ready for deployment |

---

**Last Updated**: October 21, 2025  
**Status**: ✅ Complete and Corrected  
**Ready for**: Deployment to Supabase


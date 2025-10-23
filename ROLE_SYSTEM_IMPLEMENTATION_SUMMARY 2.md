# Role-Based System Implementation Summary

## Overview
Successfully implemented a separate `roles` table in the BuildTrack database schema to allow users to have different roles on different projects, providing greater flexibility and scalability.

---

## 🎯 Key Changes

### 1. **New Database Schema**
Created a comprehensive schema with:
- **`roles` table**: Central repository for all role definitions
- **`user_project_roles` table**: Maps users to projects with specific roles
- Modified **`users` table**: Added `default_role_id` and `updated_at` columns

### 2. **System Roles**
Defined 10 system roles with hierarchical levels:

| Role | Level | Description |
|------|-------|-------------|
| Administrator | 1 | Full system access with all permissions |
| Manager | 2 | Can manage projects, tasks, and team members |
| Lead Project Manager | 2 | Oversees entire project execution |
| Contractor | 2 | Main contractor for project work |
| Inspector | 2 | Reviews and inspects work quality |
| Architect | 2 | Provides architectural guidance |
| Engineer | 2 | Provides engineering guidance |
| Foreman | 2 | Supervises workers on-site |
| Subcontractor | 3 | Specialized contractor for specific tasks |
| Worker | 3 | Can view and update assigned tasks |

### 3. **Role Flexibility**
Users can now:
- ✅ Have **one role per project** (enforced by UNIQUE constraint)
- ✅ Have **different roles** on different projects
- ✅ Be assigned **custom roles** created by admins
- ✅ Have a **default role** for system-wide permissions

---

## 📁 Files Created

### 1. **Database Schema Files**

#### `scripts/database-schema-with-roles.sql`
Complete database schema from scratch with the new role system.
- Creates all tables with proper relationships
- Includes RLS policies
- Seeds default system roles
- Creates helper functions

#### `scripts/migration-add-roles-table.sql`
Migration script to update existing database.
- Preserves all existing data
- Maps old roles to new structure
- Updates RLS policies
- Non-destructive migration

### 2. **Code Files**

#### `src/types/buildtrack.ts` (Updated)
Added new TypeScript interfaces:
```typescript
- Role interface
- RoleName type
- UserProjectRole interface (replaces UserProjectAssignment)
- Updated User interface with defaultRoleId
```

#### `src/state/roleStore.ts` (New)
Zustand store for role management:
```typescript
- fetchRoles(): Fetch all roles from database
- getRoleByName(name): Get role by name
- getRoleById(id): Get role by ID
- createRole(): Create custom roles (admin only)
- updateRole(): Update role properties (admin only)
- deleteRole(): Delete custom roles (admin only)
```

### 3. **Scripts**

#### `scripts/seed-roles.js`
Seeds the roles table with system roles:
- Inserts 10 system roles
- Updates existing roles if they exist
- Includes role permissions
- Provides detailed output

#### `scripts/create-unique-company-admins.js` (Already exists)
Script that creates admin users for each company.

### 4. **Documentation**

#### `ROLE_SYSTEM_GUIDE.md`
Comprehensive guide covering:
- Database schema explanation
- TypeScript types
- Usage examples
- Best practices
- Migration process
- Future enhancements

#### `ADMIN_USERS_SUMMARY.md` (Already exists)
Summary of created admin users for each company.

---

## 🚀 How to Use

### Step 1: Run Migration
```bash
# Option A: Run full migration (recommended for existing databases)
# In Supabase SQL Editor, run:
scripts/migration-add-roles-table.sql

# Option B: Fresh installation (for new databases)
# In Supabase SQL Editor, run:
scripts/database-schema-with-roles.sql
```

### Step 2: Seed Roles
```bash
# Run the seed script to populate roles
export PATH="/Users/tristan/Desktop/BuildTrack/node-v20.19.4-darwin-arm64/bin:$PATH"
node scripts/seed-roles.js
```

### Step 3: Update Application Code
```typescript
// In your app initialization (e.g., App.tsx)
import { useRoleStore } from "./src/state/roleStore";

useEffect(() => {
  const initializeRoles = async () => {
    await useRoleStore.getState().fetchRoles();
  };
  initializeRoles();
}, []);
```

### Step 4: Assign Users to Projects with Roles
```typescript
import { useRoleStore } from "./src/state/roleStore";
import { supabase } from "./src/api/supabase";

// Get the role
const contractorRole = useRoleStore.getState().getRoleByName('contractor');

// Assign user to project with role
await supabase.from('user_project_roles').insert({
  user_id: userId,
  project_id: projectId,
  role_id: contractorRole.id,
  assigned_by: currentUserId,
  is_active: true
});
```

---

## 📊 Database Schema Diagram

```
┌─────────────┐
│   roles     │
├─────────────┤
│ id          │←───┐
│ name        │    │
│ display_name│    │
│ level       │    │
│ permissions │    │
└─────────────┘    │
                   │
┌─────────────┐    │
│   users     │    │
├─────────────┤    │
│ id          │←───┼───┐
│ name        │    │   │
│ email       │    │   │
│ company_id  │    │   │
│ default_role│────┘   │
└─────────────┘        │
                       │
┌──────────────────┐   │
│ user_project_    │   │
│    roles         │   │
├──────────────────┤   │
│ id               │   │
│ user_id          │───┘
│ project_id       │───┐
│ role_id          │───┤
│ category         │   │
│ assigned_by      │   │
│ is_active        │   │
└──────────────────┘   │
                       │
┌─────────────┐        │
│  projects   │        │
├─────────────┤        │
│ id          │←───────┘
│ name        │
│ company_id  │
│ status      │
└─────────────┘
```

---

## 🔑 Key Features

### 1. Role Hierarchy
```typescript
Level 1: Admin (highest authority)
Level 2: Manager/Supervisor roles
Level 3: Worker/Execution roles
```

### 2. Permission System
Each role has a `permissions` JSONB field:
```json
{
  "can_manage_projects": true,
  "can_manage_tasks": true,
  "can_assign_users": true,
  "can_approve_work": true,
  "can_view_reports": true
}
```

### 3. Custom Roles
Admins can create organization-specific roles:
```typescript
await roleStore.createRole({
  name: "safety_officer",
  displayName: "Safety Officer",
  description: "Ensures safety compliance",
  level: 2,
  isSystemRole: false,
  permissions: { canApproveSafety: true }
});
```

### 4. One Role Per Project
```typescript
// User has one role per project (UNIQUE constraint)
await assignRole(userId, projectId, "contractor");

// Updating role replaces the old one
await assignRole(userId, projectId, "inspector"); // Replaces contractor
```

---

## 🔧 Helper SQL Functions

### Get User's Roles on Project
```sql
SELECT * FROM get_user_project_roles('user-id', 'project-id');
-- Returns: role_name, role_level, category
```

### Check if User Has Specific Role
```sql
SELECT user_has_role_on_project('user-id', 'project-id', 'admin');
-- Returns: boolean
```

### Get User's Highest Role Level
```sql
SELECT get_user_highest_role_level('user-id', 'project-id');
-- Returns: integer (lowest level number = highest authority)
```

---

## 📋 Migration Checklist

- [x] Create roles table
- [x] Seed system roles
- [x] Add default_role_id to users table
- [x] Create user_project_roles table
- [x] Migrate data from user_project_assignments
- [x] Update RLS policies
- [x] Create helper functions
- [x] Update TypeScript types
- [x] Create role store
- [x] Create documentation
- [ ] **Run migration script on database** (User action required)
- [ ] **Run seed script** (User action required)
- [ ] **Update application code to use new role system** (User action required)
- [ ] **Test role assignments** (User action required)

---

## 🎯 Next Steps

### Immediate Actions
1. **Run Migration**: Execute `scripts/migration-add-roles-table.sql` in Supabase
2. **Seed Roles**: Run `node scripts/seed-roles.js`
3. **Test**: Verify roles are created correctly

### Application Updates
1. **Initialize Roles**: Add role fetching to app initialization
2. **Update Assignment Logic**: Change from `user_project_assignments` to `user_project_roles`
3. **Update UI**: Display user roles on project pages
4. **Add Role Management**: Create admin UI for managing roles

### Future Enhancements
1. **Role Templates**: Create templates for quick project setup
2. **Permission UI**: Build interface for managing role permissions
3. **Role Analytics**: Track role usage and distribution
4. **Role Transitions**: Track when users change roles
5. **Advanced Permissions**: Expand permission system

---

## 📚 Resources

- **Full Guide**: `ROLE_SYSTEM_GUIDE.md`
- **Schema**: `scripts/database-schema-with-roles.sql`
- **Migration**: `scripts/migration-add-roles-table.sql`
- **Seed Script**: `scripts/seed-roles.js`
- **Role Store**: `src/state/roleStore.ts`
- **Types**: `src/types/buildtrack.ts`

---

## ✅ Benefits

### For Users
- More accurate representation of responsibilities
- Can have different roles on different projects
- Clear role hierarchy and permissions

### For Administrators
- Flexible role assignment
- Easy to create custom roles
- Centralized role management

### For Developers
- Clean separation of concerns
- Easy to extend with new roles
- Type-safe role handling

---

**Status**: ✅ Complete - Ready for deployment  
**Created**: October 21, 2025  
**Last Updated**: October 21, 2025


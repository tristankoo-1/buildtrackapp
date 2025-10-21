# Role-Based System Implementation Guide

## Overview

This document describes the new role-based system for BuildTrack, which uses a separate `roles` table to allow users to have different roles on different projects.

## Database Schema Changes

### New Tables

#### 1. **roles** Table
Centralized role definitions that can be reused across projects.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,           -- 1=Admin, 2=Manager, 3=Worker
  permissions JSONB DEFAULT '{}',   -- Role-specific permissions
  is_system_role BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**System Roles:**
- `admin` (level 1): Full system access
- `manager` (level 2): Project and team management
- `worker` (level 3): Task execution
- `lead_project_manager` (level 2): Project oversight
- `contractor` (level 2): Main contractor work
- `subcontractor` (level 3): Specialized tasks
- `inspector` (level 2): Quality inspection
- `architect` (level 2): Architectural guidance
- `engineer` (level 2): Engineering guidance
- `foreman` (level 2): On-site supervision

#### 2. **user_project_roles** Table
Maps users to projects with specific roles (replaces `user_project_assignments`).

```sql
CREATE TABLE user_project_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  role_id UUID REFERENCES roles(id),
  category TEXT,                    -- Optional: Additional categorization
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, project_id, role_id, category)
);
```

### Modified Tables

#### **users** Table
```sql
ALTER TABLE users 
  ADD COLUMN default_role_id UUID REFERENCES roles(id),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

The `role` column is kept for backward compatibility but is deprecated in favor of `default_role_id`.

## Key Features

### 1. One Role Per Project
Users have exactly one role per project (but can have different roles on different projects):
```typescript
// User is a contractor on Project A
userProjectRoles = [
  { userId: "user1", projectId: "projectA", roleId: "contractor-role-id" }
]

// Cannot add another role for same user on same project
// UNIQUE constraint: (user_id, project_id)
```

### 2. Different Roles Across Projects
Users can have different roles on different projects:
```typescript
// User is a manager on Project A but a worker on Project B
userProjectRoles = [
  { userId: "user1", projectId: "projectA", roleId: "manager-role-id" },
  { userId: "user1", projectId: "projectB", roleId: "worker-role-id" }
]
```

### 3. Role Hierarchy
Roles have a `level` field for hierarchy:
- Level 1: Admin (highest authority)
- Level 2: Manager/Supervisor roles
- Level 3: Worker/Execution roles

### 4. Custom Roles
Admins can create custom roles beyond the system roles:
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

## TypeScript Types

### New Types
```typescript
export type RoleName = "admin" | "manager" | "worker" | 
  "lead_project_manager" | "contractor" | "subcontractor" | 
  "inspector" | "architect" | "engineer" | "foreman";

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  description?: string;
  level: number;
  permissions?: Record<string, boolean>;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProjectRole {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  category?: UserCategory;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}
```

### Updated User Interface
```typescript
export interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;              // DEPRECATED: For backward compatibility
  defaultRole?: Role;          // NEW: Default role reference
  defaultRoleId?: string;      // NEW: Default role ID
  companyId: string;
  position: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;          // NEW
}
```

## State Management

### New RoleStore
```typescript
import { useRoleStore } from "../state/roleStore";

// Fetch all roles
const { roles, fetchRoles } = useRoleStore();
await fetchRoles();

// Get specific role
const adminRole = useRoleStore(state => state.getRoleByName("admin"));

// Create custom role (admin only)
await useRoleStore.getState().createRole({
  name: "custom_role",
  displayName: "Custom Role",
  level: 2,
  isSystemRole: false
});
```

## Helper Functions

### SQL Helper Functions

#### Get User's Roles on Project
```sql
SELECT * FROM get_user_project_roles('user-id', 'project-id');
```

#### Check if User Has Role on Project
```sql
SELECT user_has_role_on_project('user-id', 'project-id', 'admin');
```

#### Get User's Highest Role Level
```sql
SELECT get_user_highest_role_level('user-id', 'project-id');
```

## Migration Process

### 1. Run Migration Script
```bash
# In Supabase SQL Editor, run:
scripts/migration-add-roles-table.sql
```

This will:
- Create `roles` table with system roles
- Add `default_role_id` to `users` table
- Create `user_project_roles` table
- Migrate data from `user_project_assignments`
- Update RLS policies
- Create helper functions

### 2. Update Application Code

#### Fetch Roles on App Start
```typescript
// In App.tsx or initialization
import { useRoleStore } from "./src/state/roleStore";

useEffect(() => {
  const initializeRoles = async () => {
    await useRoleStore.getState().fetchRoles();
  };
  initializeRoles();
}, []);
```

#### Update User Assignment Logic
```typescript
// OLD: user_project_assignments
await supabase.from('user_project_assignments').insert({
  user_id: userId,
  project_id: projectId,
  category: 'contractor',
  assigned_by: currentUserId
});

// NEW: user_project_roles
const contractorRole = useRoleStore.getState().getRoleByName('contractor');
await supabase.from('user_project_roles').insert({
  user_id: userId,
  project_id: projectId,
  role_id: contractorRole.id,
  category: 'contractor',
  assigned_by: currentUserId
});
```

### 3. Backward Compatibility

The old `role` field in the `User` interface is maintained for backward compatibility. Your existing code will continue to work, but you should gradually migrate to using `defaultRoleId` and `UserProjectRole`.

## Usage Examples

### Example 1: Assign User to Project with Role
```typescript
import { useRoleStore } from "./src/state/roleStore";
import { supabase } from "./src/api/supabase";

async function assignUserToProject(
  userId: string, 
  projectId: string, 
  roleName: RoleName,
  assignedBy: string
) {
  const role = useRoleStore.getState().getRoleByName(roleName);
  
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  const { error } = await supabase
    .from('user_project_roles')
    .insert({
      user_id: userId,
      project_id: projectId,
      role_id: role.id,
      assigned_by: assignedBy,
      is_active: true
    });

  if (error) throw error;
}
```

### Example 2: Get User's Roles on Project
```typescript
async function getUserProjectRoles(userId: string, projectId: string) {
  const { data, error } = await supabase
    .from('user_project_roles')
    .select(`
      *,
      roles (
        id,
        name,
        display_name,
        level
      )
    `)
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('is_active', true);

  if (error) throw error;
  return data;
}
```

### Example 3: Check User Permission
```typescript
async function canUserManageProject(userId: string, projectId: string): Promise<boolean> {
  const roles = await getUserProjectRoles(userId, projectId);
  
  // Check if user has any role with level <= 2 (manager level or higher)
  return roles.some(r => r.roles.level <= 2);
}
```

### Example 4: Display User Role Badge
```typescript
function UserRoleBadge({ userId, projectId }: { userId: string; projectId: string }) {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    loadUserRoles();
  }, [userId, projectId]);

  async function loadUserRoles() {
    const data = await getUserProjectRoles(userId, projectId);
    setRoles(data.map(d => d.roles));
  }

  return (
    <View>
      {roles.map(role => (
        <View key={role.id} className="bg-blue-100 px-2 py-1 rounded">
          <Text className="text-blue-800">{role.displayName}</Text>
        </View>
      ))}
    </View>
  );
}
```

## Benefits

### 1. Flexibility
- Users can have different roles on different projects
- Users can have multiple roles on the same project
- Easy to add new roles without code changes

### 2. Maintainability
- Centralized role definitions
- Easy to update role permissions
- Clear separation of concerns

### 3. Scalability
- Support for custom roles
- Role hierarchy for permissions
- Future-proof for complex role requirements

### 4. Security
- Fine-grained access control
- Role-based RLS policies
- Audit trail for role assignments

## Best Practices

### 1. Always Use Role IDs
Don't hardcode role names; use the role ID from the database:
```typescript
// ❌ Bad
const isAdmin = user.role === 'admin';

// ✅ Good
const adminRole = useRoleStore.getState().getRoleByName('admin');
const isAdmin = user.defaultRoleId === adminRole?.id;
```

### 2. Check Roles at Project Level
For project-specific operations, always check the user's role on that project:
```typescript
// ✅ Good
const hasManagerRole = await user_has_role_on_project(userId, projectId, 'manager');
```

### 3. Use Role Levels for Permissions
Use the role level for hierarchical permissions:
```typescript
// ✅ Good
const canManage = userRole.level <= 2;
```

### 4. Keep System Roles Immutable
Never modify system roles directly. Create custom roles instead:
```typescript
// ✅ Good
if (!role.isSystemRole) {
  await roleStore.updateRole(role.id, updates);
}
```

## Future Enhancements

1. **Permission System**: Expand the `permissions` JSONB field for granular permissions
2. **Role Templates**: Create role templates for quick project setup
3. **Role Transitions**: Track when users change roles on projects
4. **Role Notifications**: Notify users when their roles change
5. **Role Analytics**: Track role distribution and usage

---

**Last Updated**: October 21, 2025
**Version**: 1.0.0


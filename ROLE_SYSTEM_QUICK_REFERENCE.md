# Role System Quick Reference

## Common Operations

### Import Role Store
```typescript
import { useRoleStore } from "./src/state/roleStore";
```

### Fetch All Roles
```typescript
const { roles, fetchRoles } = useRoleStore();
await fetchRoles();
```

### Get Role by Name
```typescript
const adminRole = useRoleStore.getState().getRoleByName("admin");
```

### Get Role by ID
```typescript
const role = useRoleStore.getState().getRoleById(roleId);
```

### Assign User to Project with Role
```typescript
const contractorRole = useRoleStore.getState().getRoleByName('contractor');
await supabase.from('user_project_roles').insert({
  user_id: userId,
  project_id: projectId,
  role_id: contractorRole.id,
  assigned_by: currentUserId
});
```

### Get User's Roles on Project
```typescript
const { data } = await supabase
  .from('user_project_roles')
  .select('*, roles(*)')
  .eq('user_id', userId)
  .eq('project_id', projectId)
  .eq('is_active', true);
```

### Check if User Has Role on Project (SQL)
```sql
SELECT user_has_role_on_project('user-id', 'project-id', 'admin');
```

### Create Custom Role (Admin Only)
```typescript
await useRoleStore.getState().createRole({
  name: "safety_officer",
  displayName: "Safety Officer",
  level: 2,
  isSystemRole: false
});
```

## Role Levels
- **Level 1**: Admin (highest)
- **Level 2**: Manager/Supervisor
- **Level 3**: Worker/Executor

## System Roles
- admin, manager, worker
- lead_project_manager, contractor, subcontractor
- inspector, architect, engineer, foreman

## File Locations
- Types: `src/types/buildtrack.ts`
- Store: `src/state/roleStore.ts`
- Schema: `scripts/database-schema-with-roles.sql`
- Migration: `scripts/migration-add-roles-table.sql`
- Seed: `scripts/seed-roles.js`


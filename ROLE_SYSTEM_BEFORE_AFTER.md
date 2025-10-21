# Role System: Before vs After

## 📊 Schema Comparison

### BEFORE (Old System)
```
┌─────────────────────────────────┐
│          users                  │
├─────────────────────────────────┤
│ id: UUID                        │
│ name: TEXT                      │
│ email: TEXT                     │
│ role: TEXT ◄─── Fixed role      │
│   ├─ 'admin'                    │
│   ├─ 'manager'                  │
│   └─ 'worker'                   │
│ company_id: UUID                │
│ phone: TEXT                     │
└─────────────────────────────────┘
          │
          │
          ▼
┌─────────────────────────────────┐
│  user_project_assignments       │
├─────────────────────────────────┤
│ user_id: UUID                   │
│ project_id: UUID                │
│ category: TEXT ◄─ Mixed concept │
│   ├─ 'lead_project_manager'     │
│   ├─ 'contractor'               │
│   └─ 'worker' (etc)             │
└─────────────────────────────────┘

❌ LIMITATIONS:
• User has ONE fixed role system-wide
• Role and category concepts mixed
• Cannot have multiple roles per project
• Cannot have different roles on different projects
• Hard to add new roles (requires code changes)
```

### AFTER (New System)
```
┌─────────────────────────────────┐
│          roles                  │ ◄─── NEW: Centralized
├─────────────────────────────────┤
│ id: UUID                        │
│ name: TEXT (unique)             │
│ display_name: TEXT              │
│ description: TEXT               │
│ level: INTEGER (1-3)            │
│ permissions: JSONB              │
│ is_system_role: BOOLEAN         │
└─────────────────────────────────┘
          △
          │ References
          │
┌─────────────────────────────────┐
│          users                  │
├─────────────────────────────────┤
│ id: UUID                        │
│ name: TEXT                      │
│ email: TEXT                     │
│ default_role_id: UUID ◄─── NEW  │
│ company_id: UUID                │
│ phone: TEXT                     │
│ updated_at: TIMESTAMPTZ ◄─ NEW  │
└─────────────────────────────────┘
          │
          │
          ▼
┌─────────────────────────────────┐
│    user_project_roles           │ ◄─── NEW: Flexible
├─────────────────────────────────┤
│ id: UUID                        │
│ user_id: UUID                   │
│ project_id: UUID                │
│ role_id: UUID ◄───────────────┐ │
│ category: TEXT (optional)      │ │
│ assigned_by: UUID              │ │
│ is_active: BOOLEAN             │ │
└─────────────────────────────────┘ │
          △                          │
          └──────────────────────────┘

✅ BENEFITS:
• User has flexible roles per project
• Clear separation: role vs category
• Can have multiple roles per project
• Can have different roles per project
• Easy to add custom roles (no code changes)
• Role hierarchy (levels 1-3)
• Permission system (JSONB)
```

---

## 🔄 Use Case Examples

### Example 1: User with One Role Per Project

#### BEFORE ❌
```
FIXED ROLE SYSTEM-WIDE
• John is 'manager' everywhere
• On Project A: assigned as 'contractor' category
• On Project B: assigned as 'worker' category
• System still shows him as 'manager' everywhere
• Confusing and inaccurate
```

#### AFTER ✅
```typescript
// John has ONE role per project, but can be different roles
user_project_roles:
[
  {
    user_id: "john-id",
    project_id: "project-a",
    role_id: "contractor-role-id"  // Contractor on Project A
  },
  {
    user_id: "john-id", 
    project_id: "project-b",
    role_id: "worker-role-id"      // Worker on Project B
  }
]

// UNIQUE constraint enforces: (user_id, project_id)
// One role per user per project
```

---

### Example 2: Different Roles on Different Projects

#### BEFORE ❌
```
WORKAROUND ONLY
• Sarah is 'manager' system-wide
• On Project A: assigned as 'lead_project_manager'
• On Project B: wants to work as 'worker'
• System shows her as 'manager' everywhere
• Confusing and inaccurate
```

#### AFTER ✅
```typescript
// Sarah's roles adapt per project
default_role: "manager"          // System-wide default

user_project_roles:
[
  {
    user_id: "sarah-id",
    project_id: "project-a",
    role_id: "lead-pm-role-id"   // Manager role on Project A
  },
  {
    user_id: "sarah-id",
    project_id: "project-b", 
    role_id: "worker-role-id"     // Worker role on Project B
  }
]
```

---

### Example 3: Custom Organization Roles

#### BEFORE ❌
```
NOT POSSIBLE
• Stuck with 3 system roles: admin, manager, worker
• Need 'Safety Officer' role? → Code changes required
• Need 'Quality Manager' role? → Code changes required
• Deployment needed for each new role
```

#### AFTER ✅
```typescript
// Create custom roles on the fly
await roleStore.createRole({
  name: "safety_officer",
  displayName: "Safety Officer",
  level: 2,
  isSystemRole: false,
  permissions: {
    can_approve_safety: true,
    can_stop_work: true
  }
});

// Use immediately
const safetyRole = roleStore.getRoleByName('safety_officer');
await assignToProject(userId, projectId, safetyRole.id);
```

---

## 📈 Scalability Comparison

### Data Growth

#### BEFORE
```
10 users × 5 projects = 50 assignments
• 50 rows in user_project_assignments
• Each user: 1 system role
• Total role data: 10 role values
```

#### AFTER
```
10 users × 5 projects × 2 roles avg = 100 assignments
• 100 rows in user_project_roles
• 10 system roles + unlimited custom roles in roles table
• Rich metadata per role (permissions, levels, etc.)
• More data but MUCH more flexible
```

---

## 🔐 Permission System

### BEFORE
```typescript
// Hard-coded in application code
if (user.role === 'admin') {
  // Can do everything
} else if (user.role === 'manager') {
  // Can manage some things
} else {
  // Limited access
}

❌ Problems:
• Permissions scattered across codebase
• Hard to maintain
• No role-specific permissions
• All managers have same permissions
```

### AFTER
```typescript
// Stored in database, easily configurable
const userRole = await getRoleById(user.defaultRoleId);

if (userRole.permissions.can_manage_projects) {
  // Allow project management
}

if (userRole.permissions.can_approve_work) {
  // Allow work approval
}

// Check project-specific role
const projectRoles = await getUserProjectRoles(userId, projectId);
const canManage = projectRoles.some(r => r.level <= 2);

✅ Benefits:
• Permissions centralized in database
• Easy to update without code changes
• Fine-grained per-role permissions
• Different permissions per project role
```

---

## 🎯 Migration Impact

### Database Changes
```sql
-- Tables Added
+ roles (new table with 10 system roles)
+ user_project_roles (replaces user_project_assignments)

-- Tables Modified  
~ users (+ default_role_id, + updated_at)

-- Tables Deprecated
- user_project_assignments (can be dropped after migration)
```

### Application Changes
```typescript
// Old way (still works for backward compatibility)
user.role // 'admin', 'manager', 'worker'

// New way (recommended)
user.defaultRoleId // UUID reference to roles table
user.defaultRole // Full role object with permissions

// Role assignments
// OLD: user_project_assignments with category
// NEW: user_project_roles with role_id + optional category
```

---

## 🚀 Performance

### Query Complexity

#### BEFORE
```sql
-- Simple but inflexible
SELECT * FROM user_project_assignments 
WHERE user_id = ? AND project_id = ?;

-- Returns: 1 row with category
```

#### AFTER
```sql
-- Slightly more complex but much more powerful
SELECT upr.*, r.name, r.level, r.permissions
FROM user_project_roles upr
JOIN roles r ON upr.role_id = r.id
WHERE upr.user_id = ? 
  AND upr.project_id = ?
  AND upr.is_active = true;

-- Returns: Multiple rows with full role details
-- Indexes ensure performance stays excellent
```

### Caching Strategy
```typescript
// Role data rarely changes, perfect for caching
roleStore.fetchRoles(); // Fetch once on app start
roleStore.getRoleByName('admin'); // Instant from cache

// User-project-roles fetched per project
// Cached in project-specific stores
```

---

## 📊 Statistics

### System Flexibility Score

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Roles per user system-wide | 1 | 1 (default) | Same |
| Roles per user per project | 1 | ∞ | ∞ |
| Total available roles | 3 | 10 + custom | 3x-∞ |
| Role customization | ❌ | ✅ | N/A |
| Permission granularity | None | Fine-grained | ∞ |
| Code changes for new role | Yes | No | 100% |

---

## ✅ Conclusion

The new role system provides:
- **Flexibility**: Multiple roles per project
- **Scalability**: Unlimited custom roles
- **Maintainability**: Centralized role management
- **Power**: Fine-grained permissions
- **Future-proof**: Easy to extend

**Backward Compatible**: Old code continues to work during migration.

---

*For detailed implementation guide, see: `ROLE_SYSTEM_GUIDE.md`*  
*For quick reference, see: `ROLE_SYSTEM_QUICK_REFERENCE.md`*


# Refactoring Plan: User Roles vs User Categories

**Date:** October 22, 2025  
**Status:** Proposed Changes  
**Risk Level:** Low to Medium

---

## 🎯 Goal

Make the distinction between **Job Titles** (User Roles) and **Project Roles** (User Categories) crystal clear in the codebase.

---

## 📋 Phase 1: Type Renaming (Low Risk)

### Step 1.1: Update Type Definitions

**File:** `src/types/buildtrack.ts`

```typescript
// ============================================
// BEFORE (Current - Confusing)
// ============================================

export type UserRole = "admin" | "manager" | "worker";
export type UserCategory = "lead_project_manager" | "contractor" | "subcontractor" | "inspector" | "architect" | "engineer" | "worker" | "foreman";
export type RoleName = "admin" | "manager" | "worker" | "lead_project_manager" | "contractor" | "subcontractor" | "inspector" | "architect" | "engineer" | "foreman";

// ============================================
// AFTER (Proposed - Clear)
// ============================================

/**
 * JOB TITLE (System-wide permission level)
 * - Defines what a user CAN do across the entire system
 * - Examples: admin, manager, worker
 * - Stored in: users.role
 * - Controls: Feature access, system permissions
 */
export type JobTitle = "admin" | "manager" | "worker";

/**
 * PROJECT ROLE (Project-specific capacity)
 * - Defines what a user DOES on a specific project
 * - Examples: contractor, inspector, lead_project_manager
 * - Stored in: user_project_assignments.category
 * - Controls: Project responsibilities, task visibility
 */
export type ProjectRole = 
  | "lead_project_manager" 
  | "contractor" 
  | "subcontractor" 
  | "inspector" 
  | "architect" 
  | "engineer" 
  | "worker" 
  | "foreman";

/**
 * LEGACY: Keep for backward compatibility
 * @deprecated Use JobTitle instead
 */
export type UserRole = JobTitle;

/**
 * LEGACY: Keep for backward compatibility
 * @deprecated Use ProjectRole instead
 */
export type UserCategory = ProjectRole;

/**
 * Combined type for the new role system
 * Note: This mixes JobTitle and ProjectRole - consider separating in future
 */
export type RoleName = JobTitle | ProjectRole;
```

### Step 1.2: Update Interfaces

```typescript
// ============================================
// User Interface
// ============================================

export interface User {
  id: string;
  email?: string;
  name: string;
  
  // Job title (system-wide permission level)
  role: JobTitle;  // admin | manager | worker
  
  // NEW: For future role system
  defaultRole?: Role;
  defaultRoleId?: string;
  
  companyId: string;
  
  // Human-readable position (e.g., "Senior Construction Manager")
  position: string;
  
  phone: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// Project Assignment Interface
// ============================================

export interface UserProjectAssignment {
  id: string;
  userId: string;
  projectId: string;
  
  // Project role (what they do on THIS project)
  category: ProjectRole;  // contractor | inspector | etc.
  
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

// ============================================
// New Role System Interface
// ============================================

export interface Role {
  id: string;
  name: RoleName;  // Can be either JobTitle or ProjectRole
  displayName: string;
  description?: string;
  level: number;
  permissions?: Record<string, boolean>;
  isSystemRole: boolean;
  
  // NEW: Clarify what type of role this is
  roleType: "job_title" | "project_role";
  
  createdAt: string;
  updatedAt: string;
}
```

---

## 📋 Phase 2: Add Helper Functions (Low Risk)

**File:** `src/types/buildtrack.ts`

```typescript
// ============================================
// Type Guards and Helpers
// ============================================

/**
 * Check if a role name is a job title
 */
export function isJobTitle(role: string): role is JobTitle {
  return ["admin", "manager", "worker"].includes(role);
}

/**
 * Check if a role name is a project role
 */
export function isProjectRole(role: string): role is ProjectRole {
  return [
    "lead_project_manager",
    "contractor",
    "subcontractor",
    "inspector",
    "architect",
    "engineer",
    "worker",
    "foreman"
  ].includes(role);
}

/**
 * Get display name for job title
 */
export function getJobTitleLabel(title: JobTitle): string {
  const labels: Record<JobTitle, string> = {
    admin: "Administrator",
    manager: "Manager",
    worker: "Worker"
  };
  return labels[title];
}

/**
 * Get display name for project role
 */
export function getProjectRoleLabel(role: ProjectRole): string {
  const labels: Record<ProjectRole, string> = {
    lead_project_manager: "Lead Project Manager",
    contractor: "Contractor",
    subcontractor: "Subcontractor",
    inspector: "Inspector",
    architect: "Architect",
    engineer: "Engineer",
    worker: "Worker",
    foreman: "Foreman"
  };
  return labels[role];
}

/**
 * Get color class for project role badge
 */
export function getProjectRoleColor(role: ProjectRole): string {
  const colors: Record<ProjectRole, string> = {
    lead_project_manager: "bg-purple-50 text-purple-600 border-purple-200",
    contractor: "bg-blue-50 text-blue-600 border-blue-200",
    subcontractor: "bg-green-50 text-green-600 border-green-200",
    inspector: "bg-red-50 text-red-600 border-red-200",
    architect: "bg-indigo-50 text-indigo-600 border-indigo-200",
    engineer: "bg-orange-50 text-orange-600 border-orange-200",
    worker: "bg-gray-50 text-gray-600 border-gray-200",
    foreman: "bg-yellow-50 text-yellow-600 border-yellow-200"
  };
  return colors[role];
}
```

---

## 📋 Phase 3: Update Database Schema Comments (Low Risk)

**File:** `scripts/database-schema-with-roles.sql`

```sql
-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  
  -- JOB TITLE: System-wide permission level (admin/manager/worker)
  -- Determines what features the user can access across the entire system
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- NEW ROLE SYSTEM: Links to roles table for future flexibility
  default_role_id UUID REFERENCES roles(id),
  
  -- Human-readable job position (e.g., "Senior Construction Manager")
  position TEXT NOT NULL,
  
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROJECT ASSIGNMENTS TABLE
-- ============================================

CREATE TABLE user_project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- PROJECT ROLE: What this user does on THIS specific project
  -- Examples: contractor, inspector, lead_project_manager
  -- Same user can have different categories on different projects
  category TEXT NOT NULL CHECK (category IN (
    'lead_project_manager',
    'contractor',
    'subcontractor',
    'inspector',
    'architect',
    'engineer',
    'worker',
    'foreman'
  )),
  
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  
  -- One user can have only one role per project
  UNIQUE(user_id, project_id, category)
);

-- ============================================
-- ROLES TABLE (NEW SYSTEM)
-- ============================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_system_role BOOLEAN DEFAULT true,
  
  -- NEW: Distinguish between job titles and project roles
  role_type TEXT CHECK (role_type IN ('job_title', 'project_role')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 Phase 4: Update Seed Data (Low Risk)

**File:** `scripts/seed-roles.js`

```javascript
const ROLES = [
  // ============================================
  // JOB TITLES (System-wide permission levels)
  // ============================================
  {
    name: 'admin',
    display_name: 'Administrator',
    description: 'Full system access with all permissions',
    level: 1,
    is_system_role: true,
    role_type: 'job_title',  // NEW
    permissions: {
      can_manage_users: true,
      can_manage_companies: true,
      can_manage_projects: true,
      can_manage_tasks: true,
      can_manage_roles: true,
      can_view_all: true,
      can_delete_all: true
    }
  },
  {
    name: 'manager',
    display_name: 'Manager',
    description: 'Can manage projects, tasks, and team members',
    level: 2,
    is_system_role: true,
    role_type: 'job_title',  // NEW
    permissions: {
      can_manage_projects: true,
      can_manage_tasks: true,
      can_assign_users: true,
      can_view_reports: true
    }
  },
  {
    name: 'worker',
    display_name: 'Worker',
    description: 'Can view and update assigned tasks',
    level: 3,
    is_system_role: true,
    role_type: 'job_title',  // NEW
    permissions: {
      can_view_assigned_tasks: true,
      can_update_tasks: true,
      can_add_updates: true
    }
  },
  
  // ============================================
  // PROJECT ROLES (Project-specific capacities)
  // ============================================
  {
    name: 'lead_project_manager',
    display_name: 'Lead Project Manager',
    description: 'Oversees entire project execution',
    level: 2,
    is_system_role: true,
    role_type: 'project_role',  // NEW
    permissions: {
      can_manage_projects: true,
      can_manage_tasks: true,
      can_assign_users: true,
      can_approve_work: true,
      can_view_reports: true
    }
  },
  {
    name: 'contractor',
    display_name: 'Contractor',
    description: 'Main contractor for project work',
    level: 2,
    is_system_role: true,
    role_type: 'project_role',  // NEW
    permissions: {
      can_manage_tasks: true,
      can_create_tasks: true,
      can_assign_tasks: true,
      can_view_project: true
    }
  },
  // ... rest of project roles
];
```

---

## 📋 Phase 5: Update UI Components (Medium Risk)

### Update UserManagementScreen.tsx

```typescript
// ============================================
// BEFORE
// ============================================
const getCategoryLabel = (category: UserCategory) => {
  // ...
};

// ============================================
// AFTER
// ============================================
import { getProjectRoleLabel, getProjectRoleColor } from '@/types/buildtrack';

// Use imported helper functions instead
// Remove local getCategoryLabel and getCategoryColor
```

### Update Component Comments

```typescript
// ============================================
// User Project Assignment Section
// ============================================

// Shows what PROJECT ROLE (category) the user has on each project
{assignments.map(assignment => {
  const project = getProjectById(assignment.projectId);
  
  return (
    <View key={assignment.projectId}>
      <Text>{project.name}</Text>
      {/* Display project role (contractor, inspector, etc.) */}
      <Badge className={getProjectRoleColor(assignment.category)}>
        {getProjectRoleLabel(assignment.category)}
      </Badge>
    </View>
  );
})}
```

---

## 📋 Phase 6: Update UI Labels (Low Risk)

### Make Labels Crystal Clear

**Current (Ambiguous):**
- "Role: Manager"
- "Category: Contractor"

**Proposed (Clear):**
- "Job Title: Manager"
- "Project Role: Contractor"

OR

- "System Role: Manager"
- "Project Capacity: Contractor"

### Files to Update

1. **UserManagementScreen.tsx**
   - Label: "Select Category" → "Select Project Role"
   - Label: "Category" → "Project Role"

2. **ProjectDetailScreen.tsx**
   - Display category as "Project Role: Contractor"

3. **User Profile Screens**
   - "Role: Manager" → "Job Title: Manager"
   - Add: "Position: Senior Construction Manager"

---

## 🔄 Migration Checklist

### Phase 1: Type System ✅ (No Breaking Changes)
- [ ] Add new types (JobTitle, ProjectRole) to buildtrack.ts
- [ ] Add helper functions
- [ ] Keep old types (UserRole, UserCategory) as aliases
- [ ] Add comprehensive documentation comments

### Phase 2: Database ✅ (No Breaking Changes)
- [ ] Add role_type column to roles table
- [ ] Update seed data to include role_type
- [ ] Add comments to schema files

### Phase 3: Code Updates ⚠️ (Test Thoroughly)
- [ ] Update component imports to use helpers
- [ ] Remove duplicate helper functions
- [ ] Update inline comments
- [ ] Update UI labels

### Phase 4: Testing 🧪
- [ ] Test user creation with different job titles
- [ ] Test project assignment with different project roles
- [ ] Test that same user can have different project roles
- [ ] Test permission system still works
- [ ] Test UI displays correctly

### Phase 5: Documentation 📚
- [ ] Update README
- [ ] Update developer onboarding guide
- [ ] Create examples in docs

---

## 🚨 Breaking Changes (None for Phase 1-2)

Phase 1 and 2 maintain **full backward compatibility**:
- Old type names still work (aliased to new names)
- Database structure unchanged (just added column)
- All existing code continues to work

Phase 3+ may require code updates but won't break functionality.

---

## 🎯 Benefits

### For Developers
✅ Clear, self-documenting code  
✅ Type-safe with helper functions  
✅ Fewer bugs from confusion  
✅ Easier onboarding

### For Users
✅ Clearer UI labels  
✅ Better understanding of system  
✅ Less confusion about roles vs categories

### For System
✅ Easier to extend in future  
✅ Better separation of concerns  
✅ Cleaner architecture

---

## 📅 Recommended Timeline

**Week 1:**
- Phase 1: Update type definitions
- Phase 2: Add helper functions
- Testing

**Week 2:**
- Phase 3: Update database schema
- Phase 4: Update seed data
- Testing

**Week 3:**
- Phase 5: Update UI components
- Phase 6: Update UI labels
- Full regression testing

**Week 4:**
- Documentation updates
- Code review
- Deploy to staging

---

## 🔧 Implementation Script

```bash
# Step 1: Create backup
git checkout -b refactor/role-vs-category
git add .
git commit -m "Backup before refactoring"

# Step 2: Update types
# Edit src/types/buildtrack.ts
# Add new types, keep old as aliases

# Step 3: Run tests
npm test

# Step 4: Update one component at a time
# Test after each component

# Step 5: Full regression test
npm run test:e2e

# Step 6: Merge when all green
git checkout main
git merge refactor/role-vs-category
```

---

**Last Updated:** October 22, 2025  
**Status:** Ready for Implementation


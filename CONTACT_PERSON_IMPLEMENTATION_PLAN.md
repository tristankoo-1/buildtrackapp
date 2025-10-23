# Contact Person Implementation Plan

## Overview
This document outlines the comprehensive plan to implement a "contact person" system that enables hierarchical company relationships, controlled visibility, and structured communication between companies in a project.

---

## 🎯 Core Concept

### Contact Person Definition
- The **first user from a company** to join a project becomes the **contact person** for that company on that project
- Contact person acts as the **single point of contact** between their company and other companies
- Contact person can:
  - Add/remove members from their own company to the project
  - Invite subcontractor companies (via their contact person)
  - Assign tasks to their team or subcontractor contact persons
  - Accept tasks from upstream and delegate to team/subcontractors

### Hierarchical Structure
```
Project Owner (Company A)
├─ Contact Person: User A (Project Creator)
├─ Team Members: Users from Company A
└─ Subcontractors
    ├─ Company B (Subcontractor)
    │   ├─ Contact Person: User B
    │   ├─ Team Members: Users from Company B
    │   └─ Sub-subcontractors
    │       └─ Company C
    │           ├─ Contact Person: User C
    │           └─ Team Members: Users from Company C
    └─ Company D (Another Subcontractor)
        └─ ...
```

---

## 📊 Database Schema Changes

### 1. New Table: `company_project_relationships`
Tracks which companies are involved in a project and their hierarchical relationships.

```sql
CREATE TABLE company_project_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  parent_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  contact_person_user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('owner', 'contractor', 'subcontractor')),
  invited_by_user_id UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Ensure one record per company per project
  UNIQUE(project_id, company_id),
  
  -- Ensure contact person belongs to the company
  CONSTRAINT fk_contact_person_company 
    CHECK (
      contact_person_user_id IN (
        SELECT id FROM users WHERE company_id = company_project_relationships.company_id
      )
    )
);

-- Indexes for performance
CREATE INDEX idx_company_project_rel_project ON company_project_relationships(project_id);
CREATE INDEX idx_company_project_rel_company ON company_project_relationships(company_id);
CREATE INDEX idx_company_project_rel_parent ON company_project_relationships(parent_company_id);
CREATE INDEX idx_company_project_rel_contact ON company_project_relationships(contact_person_user_id);
```

**Fields Explanation:**
- `project_id`: The project this relationship belongs to
- `company_id`: The company in the project
- `parent_company_id`: The company that invited this company (NULL for project owner)
- `contact_person_user_id`: The designated contact person for this company on this project
- `relationship_type`: Type of relationship (owner, contractor, subcontractor)
- `invited_by_user_id`: User who invited this company to the project
- `is_active`: Whether the relationship is currently active

### 2. New Table: `project_visibility_rules`
Defines visibility rules between users/companies in a project context.

```sql
CREATE TABLE project_visibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  viewer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewer_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  visible_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visible_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  visibility_reason TEXT NOT NULL CHECK (visibility_reason IN (
    'same_company',
    'contact_person',
    'task_owner',
    'task_assignee',
    'upstream_company',
    'direct_subcontractor'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Either viewer_user_id or viewer_company_id must be set
  -- Either visible_user_id or visible_company_id must be set
  CONSTRAINT chk_viewer CHECK (
    (viewer_user_id IS NOT NULL AND viewer_company_id IS NULL) OR
    (viewer_user_id IS NULL AND viewer_company_id IS NOT NULL)
  ),
  CONSTRAINT chk_visible CHECK (
    (visible_user_id IS NOT NULL AND visible_company_id IS NULL) OR
    (visible_user_id IS NULL AND visible_company_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_visibility_project_viewer_user ON project_visibility_rules(project_id, viewer_user_id);
CREATE INDEX idx_visibility_project_viewer_company ON project_visibility_rules(project_id, viewer_company_id);
```

**Note:** This table can be computed on-the-fly using a function rather than stored, for consistency. See "Helper Functions" section.

### 3. Modify Table: `user_project_roles`
Add a flag to indicate if a user is a contact person.

```sql
ALTER TABLE user_project_roles 
ADD COLUMN is_contact_person BOOLEAN DEFAULT false;

-- Index for quick lookup
CREATE INDEX idx_user_project_roles_contact ON user_project_roles(project_id, is_contact_person) 
WHERE is_contact_person = true;
```

### 4. Modify Table: `projects`
Track the initial contact person (project creator).

```sql
-- No changes needed - projects.created_by already tracks the creator
-- projects.company_id already tracks the owner company
```

### 5. New Table: `project_invitations`
Enhanced invitation system to invite external companies/users with contact person designation.

```sql
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  invited_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invited_by_company_id UUID REFERENCES companies(id) NOT NULL,
  
  -- Invitation target (email/phone if new user, or user_id if existing)
  invitee_email TEXT,
  invitee_phone TEXT,
  invitee_user_id UUID REFERENCES users(id),
  invitee_company_id UUID REFERENCES companies(id), -- If known
  
  -- Contact person designation
  will_be_contact_person BOOLEAN DEFAULT false,
  designated_contact_person_user_id UUID REFERENCES users(id), -- If inviting multiple users, who is the contact
  
  -- Proposed role
  proposed_role_id UUID REFERENCES roles(id),
  proposed_category TEXT CHECK (proposed_category IN (
    'lead_project_manager', 'contractor', 'subcontractor', 
    'inspector', 'architect', 'engineer', 'worker', 'foreman'
  )),
  
  -- Invitation status
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  -- Ensure either email or phone is provided for new users
  CONSTRAINT chk_contact_info CHECK (
    invitee_email IS NOT NULL OR invitee_phone IS NOT NULL OR invitee_user_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_project_inv_project ON project_invitations(project_id);
CREATE INDEX idx_project_inv_email ON project_invitations(invitee_email);
CREATE INDEX idx_project_inv_phone ON project_invitations(invitee_phone);
CREATE INDEX idx_project_inv_user ON project_invitations(invitee_user_id);
CREATE INDEX idx_project_inv_status ON project_invitations(status);
```

---

## 🔧 Helper Functions

### 1. Function: Get Contact Person for Company on Project
```sql
CREATE OR REPLACE FUNCTION get_contact_person_for_company_on_project(
  p_project_id UUID,
  p_company_id UUID
) RETURNS UUID AS $$
DECLARE
  v_contact_person_id UUID;
BEGIN
  SELECT contact_person_user_id
  INTO v_contact_person_id
  FROM company_project_relationships
  WHERE project_id = p_project_id
    AND company_id = p_company_id
    AND is_active = true;
  
  RETURN v_contact_person_id;
END;
$$ LANGUAGE plpgsql;
```

### 2. Function: Check if User is Contact Person
```sql
CREATE OR REPLACE FUNCTION is_contact_person(
  p_user_id UUID,
  p_project_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM company_project_relationships cpr
    JOIN users u ON u.id = p_user_id
    WHERE cpr.project_id = p_project_id
      AND cpr.company_id = u.company_id
      AND cpr.contact_person_user_id = p_user_id
      AND cpr.is_active = true
  );
END;
$$ LANGUAGE plpgsql;
```

### 3. Function: Get Visible Users for a User on a Project
```sql
CREATE OR REPLACE FUNCTION get_visible_users_for_user_on_project(
  p_viewer_user_id UUID,
  p_project_id UUID
) RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  company_id UUID,
  company_name TEXT,
  is_contact_person BOOLEAN,
  visibility_reason TEXT
) AS $$
DECLARE
  v_viewer_company_id UUID;
BEGIN
  -- Get viewer's company
  SELECT company_id INTO v_viewer_company_id
  FROM users WHERE id = p_viewer_user_id;
  
  RETURN QUERY
  -- 1. Users from same company on this project
  SELECT 
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    COALESCE(cpr.contact_person_user_id = u.id, false),
    'same_company'::TEXT
  FROM users u
  JOIN companies c ON u.company_id = c.id
  JOIN user_project_roles upr ON upr.user_id = u.id
  LEFT JOIN company_project_relationships cpr 
    ON cpr.project_id = p_project_id 
    AND cpr.company_id = u.company_id
  WHERE u.company_id = v_viewer_company_id
    AND upr.project_id = p_project_id
    AND upr.is_active = true
  
  UNION
  
  -- 2. Contact persons of direct subcontractor companies
  SELECT 
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    true,
    'direct_subcontractor'::TEXT
  FROM company_project_relationships cpr
  JOIN users u ON u.id = cpr.contact_person_user_id
  JOIN companies c ON c.id = u.company_id
  WHERE cpr.project_id = p_project_id
    AND cpr.parent_company_id = v_viewer_company_id
    AND cpr.is_active = true
  
  UNION
  
  -- 3. Contact persons and members of parent/upstream companies
  SELECT 
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    COALESCE(cpr_parent.contact_person_user_id = u.id, false),
    'upstream_company'::TEXT
  FROM company_project_relationships cpr_mine
  JOIN company_project_relationships cpr_parent 
    ON cpr_parent.project_id = cpr_mine.project_id
    AND cpr_parent.company_id = cpr_mine.parent_company_id
  JOIN users u ON u.company_id = cpr_parent.company_id
  JOIN companies c ON c.id = u.company_id
  JOIN user_project_roles upr ON upr.user_id = u.id AND upr.project_id = p_project_id
  WHERE cpr_mine.project_id = p_project_id
    AND cpr_mine.company_id = v_viewer_company_id
    AND cpr_mine.is_active = true
    AND upr.is_active = true
  
  UNION
  
  -- 4. Task owners (users who assigned tasks to me)
  SELECT DISTINCT
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    COALESCE(cpr.contact_person_user_id = u.id, false),
    'task_owner'::TEXT
  FROM tasks t
  JOIN users u ON u.id = t.assigned_by
  JOIN companies c ON c.id = u.company_id
  LEFT JOIN company_project_relationships cpr 
    ON cpr.project_id = t.project_id 
    AND cpr.company_id = u.company_id
  WHERE t.project_id = p_project_id
    AND p_viewer_user_id = ANY(t.assigned_to)
  
  UNION
  
  -- 5. Task assignees (users I assigned tasks to)
  SELECT DISTINCT
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    COALESCE(cpr.contact_person_user_id = u.id, false),
    'task_assignee'::TEXT
  FROM tasks t
  JOIN users u ON u.id = ANY(t.assigned_to)
  JOIN companies c ON c.id = u.company_id
  LEFT JOIN company_project_relationships cpr 
    ON cpr.project_id = t.project_id 
    AND cpr.company_id = u.company_id
  WHERE t.project_id = p_project_id
    AND t.assigned_by = p_viewer_user_id;
END;
$$ LANGUAGE plpgsql;
```

### 4. Function: Get Assignable Users for a User on a Project
```sql
CREATE OR REPLACE FUNCTION get_assignable_users_for_user_on_project(
  p_assigner_user_id UUID,
  p_project_id UUID
) RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  company_id UUID,
  company_name TEXT,
  is_contact_person BOOLEAN
) AS $$
DECLARE
  v_assigner_company_id UUID;
  v_is_contact_person BOOLEAN;
BEGIN
  -- Get assigner's company
  SELECT company_id INTO v_assigner_company_id
  FROM users WHERE id = p_assigner_user_id;
  
  -- Check if assigner is contact person
  v_is_contact_person := is_contact_person(p_assigner_user_id, p_project_id);
  
  RETURN QUERY
  -- 1. Members of own company on this project
  SELECT 
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    COALESCE(cpr.contact_person_user_id = u.id, false)
  FROM users u
  JOIN companies c ON u.company_id = c.id
  JOIN user_project_roles upr ON upr.user_id = u.id
  LEFT JOIN company_project_relationships cpr 
    ON cpr.project_id = p_project_id 
    AND cpr.company_id = u.company_id
  WHERE u.company_id = v_assigner_company_id
    AND upr.project_id = p_project_id
    AND upr.is_active = true
    AND u.id != p_assigner_user_id -- Exclude self
  
  UNION
  
  -- 2. Contact persons of direct subcontractor companies (only if assigner is contact person)
  SELECT 
    u.id,
    u.name,
    u.email,
    u.company_id,
    c.name,
    true
  FROM company_project_relationships cpr
  JOIN users u ON u.id = cpr.contact_person_user_id
  JOIN companies c ON c.id = u.company_id
  WHERE cpr.project_id = p_project_id
    AND cpr.parent_company_id = v_assigner_company_id
    AND cpr.is_active = true
    AND v_is_contact_person = true; -- Only contact persons can assign to subcontractors
END;
$$ LANGUAGE plpgsql;
```

### 5. Function: Get Company Hierarchy for Project
```sql
CREATE OR REPLACE FUNCTION get_company_hierarchy_for_project(
  p_project_id UUID
) RETURNS TABLE(
  company_id UUID,
  company_name TEXT,
  parent_company_id UUID,
  parent_company_name TEXT,
  contact_person_id UUID,
  contact_person_name TEXT,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE company_tree AS (
    -- Root: Project owner company
    SELECT 
      cpr.company_id,
      c.name AS company_name,
      cpr.parent_company_id,
      pc.name AS parent_company_name,
      cpr.contact_person_user_id,
      u.name AS contact_person_name,
      0 AS level
    FROM company_project_relationships cpr
    JOIN companies c ON c.id = cpr.company_id
    LEFT JOIN companies pc ON pc.id = cpr.parent_company_id
    JOIN users u ON u.id = cpr.contact_person_user_id
    WHERE cpr.project_id = p_project_id
      AND cpr.relationship_type = 'owner'
      AND cpr.is_active = true
    
    UNION ALL
    
    -- Recursive: Subcontractors
    SELECT 
      cpr.company_id,
      c.name,
      cpr.parent_company_id,
      pc.name,
      cpr.contact_person_user_id,
      u.name,
      ct.level + 1
    FROM company_project_relationships cpr
    JOIN companies c ON c.id = cpr.company_id
    LEFT JOIN companies pc ON pc.id = cpr.parent_company_id
    JOIN users u ON u.id = cpr.contact_person_user_id
    JOIN company_tree ct ON ct.company_id = cpr.parent_company_id
    WHERE cpr.project_id = p_project_id
      AND cpr.is_active = true
  )
  SELECT * FROM company_tree ORDER BY level, company_name;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 Row Level Security (RLS) Updates

### Update RLS for `users` table
```sql
-- Drop old policy
DROP POLICY IF EXISTS "Users can view company users" ON users;

-- New policy: Users can see users based on project visibility rules
CREATE POLICY "Users can view visible users" ON users
  FOR SELECT USING (
    id IN (
      -- Always see users from own company
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
    OR id IN (
      -- See users visible through project relationships
      SELECT user_id FROM get_visible_users_for_user_on_project(
        auth.uid(),
        (SELECT project_id FROM user_project_roles WHERE user_id = auth.uid() LIMIT 1)
      )
    )
  );
```

### Add RLS for `company_project_relationships`
```sql
ALTER TABLE company_project_relationships ENABLE ROW LEVEL SECURITY;

-- Users can view company relationships for projects they're part of
CREATE POLICY "Users can view project company relationships" ON company_project_relationships
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM user_project_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Only contact persons and admins can insert relationships (invite companies)
CREATE POLICY "Contact persons can invite companies" ON company_project_relationships
  FOR INSERT WITH CHECK (
    invited_by_user_id = auth.uid()
    AND (
      -- User is admin
      EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON r.id = u.default_role_id
        WHERE u.id = auth.uid() AND r.name = 'admin'
      )
      OR
      -- User is contact person on this project
      is_contact_person(auth.uid(), project_id)
    )
  );
```

### Add RLS for `project_invitations`
```sql
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent or received
CREATE POLICY "Users can view relevant invitations" ON project_invitations
  FOR SELECT USING (
    invited_by_user_id = auth.uid()
    OR invitee_user_id = auth.uid()
    OR invitee_email = (SELECT email FROM users WHERE id = auth.uid())
    OR invitee_phone = (SELECT phone FROM users WHERE id = auth.uid())
  );

-- Only contact persons and admins can send invitations
CREATE POLICY "Contact persons can send invitations" ON project_invitations
  FOR INSERT WITH CHECK (
    invited_by_user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON r.id = u.default_role_id
        WHERE u.id = auth.uid() AND r.name = 'admin'
      )
      OR is_contact_person(auth.uid(), project_id)
    )
  );
```

---

## 📱 TypeScript Types

### New Types
```typescript
// Company project relationship
export interface CompanyProjectRelationship {
  id: string;
  projectId: string;
  companyId: string;
  parentCompanyId: string | null;
  contactPersonUserId: string;
  relationshipType: 'owner' | 'contractor' | 'subcontractor';
  invitedByUserId: string | null;
  joinedAt: string;
  isActive: boolean;
}

// Extended user with contact person flag
export interface ProjectUser extends User {
  isContactPerson: boolean;
  visibilityReason?: 'same_company' | 'contact_person' | 'task_owner' | 'task_assignee' | 'upstream_company' | 'direct_subcontractor';
}

// Enhanced project invitation
export interface ProjectInvitation {
  id: string;
  projectId: string;
  invitedByUserId: string;
  invitedByCompanyId: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  inviteeUserId?: string;
  inviteeCompanyId?: string;
  willBeContactPerson: boolean;
  designatedContactPersonUserId?: string;
  proposedRoleId?: string;
  proposedCategory?: UserCategory;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  message?: string;
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
  declineReason?: string;
}

// Company hierarchy node
export interface CompanyHierarchyNode {
  companyId: string;
  companyName: string;
  parentCompanyId: string | null;
  parentCompanyName: string | null;
  contactPersonId: string;
  contactPersonName: string;
  level: number;
  children?: CompanyHierarchyNode[];
}
```

---

## 🏗️ Implementation Phases

### Phase 1: Database Schema & Functions (2-3 days)
**Deliverables:**
1. Create migration scripts for new tables
2. Implement all helper functions
3. Update RLS policies
4. Test database functions thoroughly

**Files to Create/Modify:**
- `scripts/migration-add-contact-person-system.sql`
- `scripts/test-contact-person-functions.sql`

### Phase 2: Backend/State Layer (3-4 days)
**Deliverables:**
1. Create Zustand store for company project relationships
2. Create Zustand store for project invitations
3. Update user store with visibility logic
4. Update project store with contact person logic
5. Add helper methods for contact person operations

**Files to Create/Modify:**
- `src/state/companyProjectRelationshipStore.ts`
- `src/state/projectInvitationStore.ts`
- `src/state/userStore.ts` (update with visibility methods)
- `src/state/projectStore.ts` (update with contact person methods)
- `src/types/buildtrack.ts` (add new types)

### Phase 3: Project Creation & Contact Person Flow (2-3 days)
**Deliverables:**
1. Update project creation to automatically set creator as contact person
2. Update project creation to create company_project_relationships entry
3. Show contact person badge in UI
4. Add "Add Team Member" functionality for contact persons

**Files to Modify:**
- `src/screens/CreateProjectScreen.tsx`
- `src/screens/ProjectDetailScreen.tsx`
- `src/components/UserAvatar.tsx` or create `ContactPersonBadge.tsx`

### Phase 4: Invitation System (3-4 days)
**Deliverables:**
1. Create invitation UI for contact persons
2. Implement "Invite User" flow with contact person designation
3. Implement "Invite Company" flow (invite contact person of new company)
4. Handle invitation acceptance and automatic relationship creation
5. Show pending invitations in project details

**Files to Create/Modify:**
- `src/screens/InviteUserScreen.tsx` (new)
- `src/screens/InvitationListScreen.tsx` (new)
- `src/components/InvitationCard.tsx` (new)
- `src/screens/ProjectDetailScreen.tsx` (add invitation section)

### Phase 5: User Visibility & Selection (3-4 days)
**Deliverables:**
1. Implement visibility filtering in user lists
2. Update "Assign Task" UI to show only assignable users
3. Show user's company and contact person status in lists
4. Add company hierarchy visualization in project details
5. Filter user lists based on contact person rules

**Files to Modify:**
- `src/components/AddMemberModal.tsx`
- `src/screens/CreateTaskScreen.tsx`
- `src/screens/TaskDetailScreen.tsx`
- `src/components/CompanyHierarchyView.tsx` (new)

### Phase 6: Task Assignment Rules (2-3 days)
**Deliverables:**
1. Enforce task assignment rules (only to visible users)
2. Update task creation to respect visibility
3. Update task delegation to respect visibility
4. Show assignable users based on contact person status

**Files to Modify:**
- `src/state/taskStore.ts`
- `src/screens/CreateTaskScreen.tsx`
- `src/screens/TaskDetailScreen.tsx`

### Phase 7: Contact Person Management (2-3 days)
**Deliverables:**
1. Allow contact person to add/remove team members
2. Allow contact person to change contact person (transfer role)
3. Show contact person actions in project settings
4. Handle contact person leaving project (must transfer role first)

**Files to Create/Modify:**
- `src/screens/ManageTeamScreen.tsx` (new)
- `src/screens/TransferContactPersonScreen.tsx` (new)
- `src/screens/ProjectDetailScreen.tsx` (add team management)

### Phase 8: Visibility Rules & Testing (3-4 days)
**Deliverables:**
1. Comprehensive testing of visibility rules
2. Test hierarchical company relationships
3. Test task assignment with multiple levels of subcontractors
4. Edge case handling (contact person leaves, company removed, etc.)
5. Performance testing with large hierarchies

**Files to Create:**
- `src/__tests__/contactPerson.test.ts`
- `src/__tests__/visibility.test.ts`
- `src/__tests__/companyHierarchy.test.ts`

---

## 🎨 UI/UX Changes

### 1. Contact Person Badge
Show a special badge next to contact person's name:
```
👤 John Doe ⭐ Contact Person
   BuildTrack Inc.
```

### 2. Company Hierarchy View
Visual tree showing company relationships:
```
📦 Project: Downtown Construction
├─ 🏢 BuildTrack Inc. (Owner)
│   ├─ ⭐ John Doe (Contact Person)
│   ├─ 👤 Sarah Worker
│   └─ 👤 Alex Admin
├─ 🏢 Elite Electric Co. (Subcontractor)
│   ├─ ⭐ Mike Johnson (Contact Person)
│   └─ 👤 Lisa Martinez
└─ 🏢 Plumbing Pro (Subcontractor)
    └─ ⭐ Bob Smith (Contact Person)
```

### 3. Invite User/Company Modal
```
┌─────────────────────────────────────┐
│ Invite to Project                   │
├─────────────────────────────────────┤
│ ○ Invite Team Member                │
│   (from my company)                 │
│                                      │
│ ● Invite Subcontractor              │
│   (external company)                │
├─────────────────────────────────────┤
│ Email: ___________________________  │
│ Phone: ___________________________  │
│                                      │
│ ☑ Designate as Contact Person      │
│                                      │
│ Message: _________________________  │
│         _________________________   │
│                                      │
│ [Cancel]              [Send Invite] │
└─────────────────────────────────────┘
```

### 4. Assignable Users in Task Creation
```
Assign To:
┌─────────────────────────────────────┐
│ My Team (BuildTrack Inc.)           │
│ ☐ Sarah Worker                      │
│ ☐ Alex Admin                        │
│                                      │
│ Subcontractors                      │
│ ☐ ⭐ Mike Johnson (Elite Electric)  │
│ ☐ ⭐ Bob Smith (Plumbing Pro)       │
└─────────────────────────────────────┘
```

---

## ⚠️ Edge Cases & Considerations

### 1. Contact Person Leaves Project
**Problem:** What happens when a contact person leaves?
**Solution:**
- Prevent contact person from leaving unless they transfer the role
- Show error: "You must transfer Contact Person role before leaving"
- Provide "Transfer Contact Person" flow

### 2. Contact Person User is Deleted
**Problem:** User account is deleted from system
**Solution:**
- Database constraint prevents deletion if user is contact person
- Must transfer contact person role first
- Or, automatically promote next senior user (by role level) from same company

### 3. Company Has No Users on Project
**Problem:** All users from a company leave the project
**Solution:**
- Automatically deactivate company_project_relationships entry
- Tasks assigned to that company's users become "unassigned"
- Notify upstream company

### 4. Circular Company Relationships
**Problem:** Company A invites Company B, Company B invites Company A
**Solution:**
- Database check before creating relationship
- Prevent circular dependencies using recursive query

### 5. Multiple Projects, Same Companies
**Problem:** Company A and Company B work on multiple projects with different contact persons
**Solution:**
- Contact person is project-specific (stored in company_project_relationships)
- Same person can be contact on Project 1 but not Project 2

### 6. User Sees Task Owner from Downstream Subcontractor
**Problem:** User A assigns task to User B (contact person of Company B). User B can see User A. But User B assigns task to User C (contact person of Company C). Should User A see User C?
**Solution:**
- **No** - User A should not see User C (downstream users are hidden)
- User A only sees User B (direct subcontractor contact person)
- Maintains privacy and hierarchy

### 7. Admin Override
**Problem:** System admin needs to see all users/companies
**Solution:**
- Admin users bypass visibility restrictions
- Add special check in visibility functions for admin role

---

## 📊 Data Migration

### For Existing Projects
When deploying this feature to production with existing data:

```sql
-- Step 1: Create company_project_relationships for existing projects
INSERT INTO company_project_relationships (
  project_id,
  company_id,
  parent_company_id,
  contact_person_user_id,
  relationship_type,
  invited_by_user_id,
  joined_at,
  is_active
)
SELECT 
  p.id AS project_id,
  p.company_id,
  NULL AS parent_company_id,
  p.created_by AS contact_person_user_id,
  'owner' AS relationship_type,
  NULL AS invited_by_user_id,
  p.created_at AS joined_at,
  true AS is_active
FROM projects p
WHERE p.company_id IS NOT NULL
  AND p.created_by IS NOT NULL;

-- Step 2: Set is_contact_person flag for existing project creators
UPDATE user_project_roles upr
SET is_contact_person = true
FROM projects p
WHERE upr.project_id = p.id
  AND upr.user_id = p.created_by;

-- Step 3: For projects with multiple companies (infer from user_project_roles)
-- This is a best-effort migration - manual review recommended
INSERT INTO company_project_relationships (
  project_id,
  company_id,
  parent_company_id,
  contact_person_user_id,
  relationship_type,
  joined_at,
  is_active
)
SELECT DISTINCT ON (upr.project_id, u.company_id)
  upr.project_id,
  u.company_id,
  p.company_id AS parent_company_id, -- Assume project owner is parent
  upr.user_id AS contact_person_user_id, -- First user from company
  'subcontractor' AS relationship_type,
  upr.assigned_at AS joined_at,
  upr.is_active
FROM user_project_roles upr
JOIN users u ON u.id = upr.user_id
JOIN projects p ON p.id = upr.project_id
WHERE u.company_id != p.company_id -- Different company than project owner
  AND NOT EXISTS (
    SELECT 1 FROM company_project_relationships cpr
    WHERE cpr.project_id = upr.project_id
      AND cpr.company_id = u.company_id
  )
ORDER BY upr.project_id, u.company_id, upr.assigned_at ASC;
```

---

## 🔍 Testing Checklist

### Unit Tests
- [ ] `get_contact_person_for_company_on_project` returns correct user
- [ ] `is_contact_person` correctly identifies contact persons
- [ ] `get_visible_users_for_user_on_project` respects all visibility rules
- [ ] `get_assignable_users_for_user_on_project` respects assignment rules
- [ ] `get_company_hierarchy_for_project` builds correct tree

### Integration Tests
- [ ] Project creation sets creator as contact person
- [ ] Contact person can add team members
- [ ] Contact person can invite subcontractor
- [ ] Non-contact person cannot invite users
- [ ] Users can only see visible users in lists
- [ ] Task assignment respects visibility rules
- [ ] Invitation acceptance creates relationships correctly

### E2E Tests
- [ ] Complete flow: Create project → Invite subcontractor → Assign task → Subcontractor assigns to team
- [ ] Visibility test: User A cannot see User C (downstream)
- [ ] Contact person transfer flow
- [ ] Multiple levels of subcontractors (3+ levels deep)

---

## 📋 Summary

This implementation plan provides a comprehensive approach to implementing the "contact person" system with:

1. **Hierarchical company relationships** - Parent-child relationships between companies
2. **Contact person designation** - First user from company is contact person, with role transfer capability
3. **Visibility controls** - Users only see relevant users based on relationships
4. **Task assignment rules** - Enforce who can assign to whom
5. **Invitation system** - Structured way to invite users and designate contact persons
6. **Database integrity** - Constraints and RLS to enforce rules at database level
7. **Scalability** - Support for unlimited levels of subcontractors

**Estimated Timeline:** 20-30 days for full implementation

**Key Success Metrics:**
- Contact persons can successfully manage their team
- Visibility rules are enforced correctly
- Users cannot see downstream subcontractor team members
- Task assignment respects hierarchy
- Performance is acceptable with large company hierarchies (100+ companies in a project)

---

## 📝 Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business needs
3. **Set up development environment** for testing
4. **Create development branch** for implementation
5. **Start with Phase 1** (Database Schema)

---

*Last Updated: October 22, 2025*


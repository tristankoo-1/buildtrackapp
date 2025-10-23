# Point of Contact (POC) System - Implementation Plan
## BuildTrack Feature Enhancement

**Date:** October 22, 2025  
**Version:** 1.0  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the implementation plan for a **Point of Contact (POC) system** in BuildTrack. The system introduces hierarchical project management with company-level abstraction, enabling multiple companies to collaborate on projects while maintaining clear boundaries and single points of contact between organizations.

### Key Benefits
- **Company Abstraction**: Upstream members only see POCs, not internal team structures
- **Delegation Authority**: POCs can build teams without upstream visibility
- **Single Communication Channel**: All cross-company communication flows through designated POCs
- **Hierarchical Structure**: Same logic applies recursively at all task levels
- **Enhanced Privacy**: Companies maintain control over their internal operations

---

## Core Concepts

### 1. Point of Contact (POC)
The first person from a company to join a project automatically becomes that company's POC on the project. The POC serves as:
- Primary representative for their company
- Single communication channel to upstream
- Authority to invite team members and subcontractors
- Manager of internal task delegation

### 2. Company Abstraction
Upstream project members see only:
- POC name and contact information
- Overall company progress/status
- **NOT visible**: Internal team structure, individual assignments, sub-contractors

### 3. Delegation Authority
POCs have the power to:
- Add members from their own company
- Invite external companies as subcontractors
- Assign tasks internally without upstream visibility
- Manage their own project hierarchy

### 4. Hierarchical Structure
The POC system applies at every level:
```
Project Owner (Company A)
  └─ POC can invite Contractors
      └─ Contractor POC can invite Subcontractors
          └─ Subcontractor POC can invite their Subcontractors
              └─ ... (infinite depth)
```

---

## Database Schema Changes

### 1. New Table: company_project_memberships

Tracks which companies are involved in each project and their POC.

```sql
CREATE TABLE company_project_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  point_of_contact_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending', 'active', 'declined')) DEFAULT 'active',
  relationship_type TEXT CHECK (relationship_type IN (
    'owner', 'contractor', 'subcontractor', 'supplier', 'consultant'
  )) DEFAULT 'contractor',
  parent_company_membership_id UUID REFERENCES company_project_memberships(id),
  visibility_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(company_id, project_id)
);

CREATE INDEX idx_company_project ON company_project_memberships(company_id, project_id);
CREATE INDEX idx_poc_user ON company_project_memberships(point_of_contact_user_id);
```

### 2. Modify: user_project_assignments

Add POC designation and visibility tracking.

```sql
ALTER TABLE user_project_assignments 
ADD COLUMN is_point_of_contact BOOLEAN DEFAULT false,
ADD COLUMN invited_by UUID REFERENCES users(id),
ADD COLUMN visibility_level INTEGER DEFAULT 0,
ADD COLUMN parent_company_membership_id UUID REFERENCES company_project_memberships(id);

CREATE INDEX idx_poc_assignments ON user_project_assignments(project_id, is_point_of_contact) 
  WHERE is_point_of_contact = true;
```

### 3. New Table: project_invitations

Manages external user invitations via email/phone.

```sql
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id),
  invitee_email TEXT,
  invitee_phone TEXT,
  company_id UUID REFERENCES companies(id),
  invited_user_id UUID REFERENCES users(id),
  should_be_poc BOOLEAN DEFAULT false,
  relationship_type TEXT CHECK (relationship_type IN (
    'contractor', 'subcontractor', 'supplier', 'consultant'
  )),
  invitation_token TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  message TEXT
);

CREATE INDEX idx_invitation_token ON project_invitations(invitation_token);
CREATE INDEX idx_invitation_status ON project_invitations(project_id, status);
```

### 4. Modify: tasks

Add company-level assignment tracking.

```sql
ALTER TABLE tasks
ADD COLUMN assigned_to_companies UUID[],
ADD COLUMN assigned_to_pocs UUID[];

CREATE INDEX idx_task_companies ON tasks USING GIN(assigned_to_companies);
CREATE INDEX idx_task_pocs ON tasks USING GIN(assigned_to_pocs);
```

### 5. New Table: task_visibility_rules

Controls granular task visibility.

```sql
CREATE TABLE task_visibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  visible_to_company_id UUID REFERENCES companies(id),
  visible_to_user_id UUID REFERENCES users(id),
  visibility_scope TEXT CHECK (visibility_scope IN (
    'full', 'summary_only', 'hidden'
  )) DEFAULT 'full',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, visible_to_company_id, visible_to_user_id)
);

CREATE INDEX idx_visibility_task ON task_visibility_rules(task_id);
CREATE INDEX idx_visibility_company ON task_visibility_rules(visible_to_company_id);
```

---

## Feature Architecture

### Phase 1: Foundation (Database & Core Logic)

#### 1.1 Company-Project Membership System
- Track company involvement in projects
- Store POC designation for each company
- Maintain relationship hierarchy (owner → contractor → subcontractor)
- Support visibility levels

#### 1.2 POC Management
- Auto-assign first user from company as POC
- Allow POC transfer within company (admin only)
- Validate POC permissions before actions
- Prevent multiple POCs per company per project

#### 1.3 Visibility Hierarchy
- **Level 0**: Project owner company (visible to all downstream)
- **Level 1**: Direct contractors (visible to owner only)
- **Level 2+**: Subcontractors (visible only to their contractor)

### Phase 2: Invitation System

#### 2.1 Invitation Data Model
```typescript
interface ProjectInvitation {
  id: string;
  projectId: string;
  invitedBy: string; // User ID
  inviteeEmail?: string;
  inviteePhone?: string;
  companyId?: string;
  shouldBePOC: boolean;
  relationshipType: 'contractor' | 'subcontractor' | 'supplier' | 'consultant';
  invitationToken: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  message?: string;
}
```

#### 2.2 Invitation Flow
1. **POC creates invitation**
   - Enter email or phone number
   - Select relationship type
   - Optionally designate as POC
   - Add personal message

2. **System generates unique token**
   - Create secure invitation link
   - Set expiration (7 days default)

3. **Notification sent**
   - Email with invitation link
   - SMS with short link (optional)
   - Push notification if user exists

4. **Invitee accepts**
   - Click link → Accept page
   - If existing user: Add to project immediately
   - If new user: Create account → Add to project
   - Auto-assign POC status if designated

5. **Project updated**
   - Add company to project memberships
   - Create user assignment
   - Notify inviting POC
   - Trigger data sync

#### 2.3 Invitation UI Components
- **Invite Modal**: Input form with email/phone
- **Relationship Selector**: Choose contractor type
- **POC Toggle**: Designate as point of contact
- **Message Field**: Personal invitation message
- **Preview**: Show what invitee will see

### Phase 3: User Selection & Visibility

#### 3.1 Smart User Picker Logic

```typescript
function getAssignableUsers(
  currentUserId: string,
  projectId: string,
  taskId?: string
): User[] {
  const currentUser = getUserById(currentUserId);
  const membership = getCompanyProjectMembership(
    currentUser.companyId,
    projectId
  );

  // Get own company members (always visible)
  const ownTeam = getCompanyMembers(
    currentUser.companyId,
    projectId
  );

  // Get downstream POCs based on visibility level
  const downstreamPOCs = getDownstreamPOCs(
    currentUser.companyId,
    projectId,
    membership.visibilityLevel
  );

  return [...ownTeam, ...downstreamPOCs];
}
```

#### 3.2 Visibility Matrix

| User Type | Can See | Can Assign To | Can Invite |
|-----------|---------|---------------|------------|
| Project Owner | Own team + All direct contractor POCs | Own team + Contractor POCs | New contractors |
| Contractor POC | Own team + Subcontractor POCs | Own team + Subcontractor POCs | New subcontractors |
| Team Member | Only own team | Only own team | None |
| Subcontractor POC | Own team only | Own team only | New subcontractors |

### Phase 4: Task Assignment Logic

#### 4.1 Company-Level Assignment

When assigning tasks to POCs:
1. Task is assigned to the company (company-level)
2. POC is notified and sees the task
3. POC can delegate internally to team members
4. Upstream only sees "Assigned to [Company Name] ([POC Name])"
5. Internal delegation is hidden from upstream

```typescript
function assignTaskToPOC(
  taskId: string,
  pocUserId: string,
  assignerId: string
) {
  const poc = getUserById(pocUserId);
  const task = getTask(taskId);

  // Add company-level assignment
  task.assignedToCompanies.push(poc.companyId);
  task.assignedToPOCs.push(pocUserId);

  // Create visibility rule
  createTaskVisibilityRule({
    taskId: task.id,
    visibleToCompanyId: poc.companyId,
    visibilityScope: 'full'
  });

  // Upstream sees summary only
  createTaskVisibilityRule({
    taskId: task.id,
    visibleToUserId: assignerId,
    visibilityScope: 'summary_only'
  });

  // Notify POC
  notifyUser(pocUserId, {
    type: 'task_assigned',
    taskId: task.id,
    message: `New task assigned to ${poc.companyName}`
  });
}
```

#### 4.2 Internal Delegation

When POC delegates to team members:
1. Add team members to internal assignment list
2. **Do not** update upstream visibility
3. Team members see full task details
4. Upstream still sees only POC

```typescript
function delegateTaskInternally(
  taskId: string,
  pocUserId: string,
  teamMemberIds: string[]
) {
  const task = getTask(taskId);
  const poc = getUserById(pocUserId);

  // Verify POC authority
  if (!isPOC(pocUserId, task.projectId)) {
    throw new Error('Only POC can delegate internally');
  }

  // Add team members (hidden from upstream)
  for (const memberId of teamMemberIds) {
    const member = getUserById(memberId);

    // Verify same company
    if (member.companyId !== poc.companyId) {
      throw new Error('Can only delegate to own company members');
    }

    // Add internal assignment
    task.assignedToUsers.push(memberId);

    // Grant full visibility to team member
    createTaskVisibilityRule({
      taskId: task.id,
      visibleToUserId: memberId,
      visibilityScope: 'full'
    });
  }

  // Upstream visibility unchanged
}
```

#### 4.3 Task Visibility Query

```typescript
function getTasksForUser(userId: string): Task[] {
  const user = getUserById(userId);
  const pocProjects = getUserPOCProjects(userId);

  return getAllTasks().filter(task => {
    // Direct assignment
    if (task.assignedToUsers.includes(userId)) return true;

    // Assigned as POC
    if (task.assignedToPOCs.includes(userId)) return true;

    // Company-level assignment (user is POC)
    if (pocProjects.includes(task.projectId) && 
        task.assignedToCompanies.includes(user.companyId)) {
      return true;
    }

    // Check visibility rules
    const rule = getTaskVisibilityRule(task.id, userId);
    return rule && rule.visibilityScope !== 'hidden';
  });
}
```

### Phase 5: UI Components

#### 5.1 POC Badge Component

```tsx
interface POCBadgeProps {
  userId: string;
  projectId: string;
  size?: 'small' | 'medium' | 'large';
  showCompanyName?: boolean;
}

<POCBadge 
  userId={user.id}
  projectId={project.id}
  size="medium"
  showCompanyName={true}
/>
// Output: "⭐ Point of Contact for Acme Corp"
```

#### 5.2 Company Hierarchy View

Visual representation of project structure:

```
Project: Downtown Tower Construction
│
├─ 🏢 Acme Construction (Owner)
│   ├─ 👤 John Smith ⭐ (POC)
│   ├─ 👤 Sarah Johnson
│   └─ 👤 Mike Davis
│
├─ 🏢 Elite Electrical (Contractor)
│   └─ 👤 David Brown ⭐ (POC)
│       └─ 🔒 Team: 5 members (hidden from owner)
│
└─ 🏢 Premier Plumbing (Contractor)
    └─ 👤 Lisa Garcia ⭐ (POC)
        └─ 🔒 Team: 3 members (hidden from owner)
```

#### 5.3 Enhanced User Picker

**For Project Owner (Acme Construction):**
```
┌─────────────────────────────────────┐
│ Assign Task To                      │
├─────────────────────────────────────┤
│ Your Team (Acme Construction)       │
│ ☐ John Smith (you) ⭐              │
│ ☐ Sarah Johnson                     │
│ ☐ Mike Davis                        │
│                                     │
│ Contractors                         │
│ ☐ 🏢 Elite Electrical               │
│    → David Brown ⭐                 │
│ ☐ 🏢 Premier Plumbing               │
│    → Lisa Garcia ⭐                 │
└─────────────────────────────────────┘
```

**For Contractor POC (Elite Electrical):**
```
┌─────────────────────────────────────┐
│ Assign Task To                      │
├─────────────────────────────────────┤
│ Your Team (Elite Electrical)        │
│ ☐ David Brown (you) ⭐              │
│ ☐ Mark Wilson                       │
│ ☐ Jennifer Lee                      │
│ ☐ Tom Anderson                      │
│ ☐ Amy Chen                          │
│                                     │
│ Your Subcontractors                 │
│ ☐ 🏢 Specialized Wiring             │
│    → Robert Taylor ⭐               │
│                                     │
│ [+ Invite Subcontractor]            │
└─────────────────────────────────────┘
```

#### 5.4 Invitation Modal

```
┌─────────────────────────────────────┐
│ Invite to Project                   │
├─────────────────────────────────────┤
│ Contact Information:                │
│ ○ Email  ● Phone                    │
│ [____________________________]      │
│                                     │
│ Company (optional):                 │
│ [Select Company         ▼]          │
│ or [Create New Company]             │
│                                     │
│ Role on Project:                    │
│ ● Contractor                        │
│ ○ Subcontractor                     │
│ ○ Supplier                          │
│ ○ Consultant                        │
│                                     │
│ ☑ Designate as Point of Contact    │
│                                     │
│ Personal Message (optional):        │
│ ┌──────────────────────────────┐   │
│ │                              │   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                     │
│ [Cancel]         [Send Invitation]  │
└─────────────────────────────────────┘
```

#### 5.5 Team Management Screen

New screen for POCs to manage their team:

```
┌─────────────────────────────────────┐
│ My Team - Elite Electrical          │
├─────────────────────────────────────┤
│ Team Members (5)                    │
│                                     │
│ 👤 David Brown ⭐                   │
│    Point of Contact                 │
│    [Transfer POC] [Remove]          │
│                                     │
│ 👤 Mark Wilson                      │
│    Panel Installer                  │
│    [Make POC] [Remove]              │
│                                     │
│ 👤 Jennifer Lee                     │
│    Electrician                      │
│    [Make POC] [Remove]              │
│                                     │
│ ... (3 more members)                │
│                                     │
│ [+ Add Team Member]                 │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Subcontractors (1)                  │
│                                     │
│ 🏢 Specialized Wiring               │
│    Contact: Robert Taylor ⭐        │
│    Status: Active                   │
│    [View] [Remove]                  │
│                                     │
│ [+ Invite Subcontractor]            │
└─────────────────────────────────────┘
```

### Phase 6: Permissions & Security

#### 6.1 Permission Matrix

| Action | Project Owner | POC | Team Member | Upstream Can See |
|--------|--------------|-----|-------------|------------------|
| Add own company members | ✅ Admin + POC | ✅ | ❌ | ✅ Yes |
| Remove own company members | ✅ Admin + POC | ✅ | ❌ | ✅ Yes |
| Invite external companies | ✅ | ✅ | ❌ | ✅ Yes (POC only) |
| Designate POC for invited company | ✅ | ❌ | ❌ | N/A |
| Change own company POC | ✅ Admin only | ❌ | ❌ | ✅ Yes |
| Transfer POC to team member | ✅ Admin only | ❌ | ❌ | ✅ Yes |
| View upstream team structure | ✅ | ❌ | ❌ | N/A |
| View own team structure | ✅ | ✅ | ✅ | ❌ No |
| View downstream POCs | ✅ | ✅ | ❌ | ✅ Yes |
| View downstream team structure | ❌ | ❌ | ❌ | ❌ No |
| Assign tasks to upstream | ❌ | ❌ | ❌ | N/A |
| Assign tasks to own team | ✅ | ✅ | Limited | ❌ No |
| Assign tasks to downstream POCs | ✅ | ✅ | ❌ | ✅ Summary only |

#### 6.2 Security Rules

```typescript
// Rule 1: Can only invite if POC or Project Creator
function canInviteToProject(
  userId: string,
  projectId: string
): boolean {
  const project = getProject(projectId);
  const isPOC = checkIfPOC(userId, projectId);
  const isCreator = project.createdBy === userId;
  const isAdmin = getUserRole(userId) === 'admin';

  return (isPOC || isCreator) && isAdmin;
}

// Rule 2: Can only see POCs, not their teams
function getVisibleUsers(
  userId: string,
  projectId: string
): User[] {
  const user = getUserById(userId);
  const membership = getCompanyProjectMembership(
    user.companyId,
    projectId
  );

  // Own company members (full visibility)
  const ownTeam = getCompanyMembers(
    user.companyId,
    projectId
  );

  // Downstream POCs only (no team visibility)
  const downstreamPOCs = getDownstreamPOCs(
    user.companyId,
    projectId,
    membership.visibilityLevel
  );

  return [...ownTeam, ...downstreamPOCs];
}

// Rule 3: Can only assign to visible users
function canAssignTaskTo(
  assignerId: string,
  assigneeId: string,
  taskId: string
): boolean {
  const task = getTask(taskId);
  const visibleUsers = getVisibleUsers(
    assignerId,
    task.projectId
  );

  return visibleUsers.some(u => u.id === assigneeId);
}

// Rule 4: POC-only actions
function canPerformPOCAction(
  userId: string,
  projectId: string,
  action: 'invite' | 'delegate' | 'transfer_poc'
): boolean {
  const isPOC = checkIfPOC(userId, projectId);
  const isAdmin = getUserRole(userId) === 'admin';

  switch (action) {
    case 'invite':
    case 'delegate':
      return isPOC;
    case 'transfer_poc':
      return isPOC && isAdmin;
    default:
      return false;
  }
}

// Rule 5: Visibility scope enforcement
function getTaskDetailsForUser(
  taskId: string,
  userId: string
): TaskDetails {
  const task = getTask(taskId);
  const rule = getTaskVisibilityRule(taskId, userId);

  switch (rule?.visibilityScope) {
    case 'full':
      return getFullTaskDetails(task);
    case 'summary_only':
      return getSummaryTaskDetails(task);
    case 'hidden':
      throw new Error('Task not visible to user');
    default:
      return getSummaryTaskDetails(task);
  }
}
```

---

## Workflow Examples

### Scenario 1: Creating New Project

**Step 1: Project Creation**
- User A (Acme Construction - Admin) creates "Downtown Tower Construction"
- System automatically:
  - Sets Acme Construction as owner company
  - Designates User A as POC for Acme Construction
  - Creates company_project_membership record
  - Sets visibility_level = 0 (owner level)

**Step 2: Adding Own Team**
- User A adds Sarah Johnson (same company)
- Validation: ✅ Allowed (POC can add own team)
- Sarah becomes team member (not POC)
- Sarah has full visibility to project

**Step 3: Inviting External Contractor**
- User A sends invitation to david@eliteelectrical.com
- Selects: Relationship = "Contractor"
- Checks: "Designate as Point of Contact"
- System generates invitation token and sends email

**Step 4: Contractor Accepts**
- David clicks invitation link
- System:
  - Creates Elite Electrical company membership
  - Designates David as POC
  - Sets visibility_level = 1 (contractor level)
  - Notifies User A of acceptance

**Result:**
```
Project: Downtown Tower Construction
├─ Acme Construction (Owner) [Level 0]
│   ├─ User A ⭐ (POC)
│   └─ Sarah Johnson
└─ Elite Electrical (Contractor) [Level 1]
    └─ David Brown ⭐ (POC)
```

### Scenario 2: Task Assignment Flow

**Step 1: Owner Creates Task**
- User A creates task: "Install Main Electrical Panel"
- Due date: 2 weeks
- Priority: High

**Step 2: Owner Assigns to Contractor**
- User A opens user picker
- Sees:
  - Own team: User A, Sarah Johnson
  - Contractors: 🏢 Elite Electrical → David Brown ⭐
- Selects: David Brown (Elite Electrical)

**Step 3: System Processing**
- Task assigned to:
  - assigned_to_companies: [Elite Electrical ID]
  - assigned_to_pocs: [David Brown ID]
- Visibility rules created:
  - Elite Electrical: full access
  - User A: summary_only (sees POC, not team)
- David receives notification

**Step 4: POC Views Task**
- David sees task in his inbox
- Full details visible
- Can see all task information
- Ready to delegate internally

**Step 5: POC Delegates Internally**
- David assigns to his team:
  - Mark Wilson (Panel Installation)
  - Jennifer Lee (Wiring)
  - Tom Anderson (Testing)
- Team members added to assigned_to_users (internal)
- User A **does not** see this delegation
- User A only sees: "Assigned to Elite Electrical (David Brown)"

**Step 6: Progress Reporting**
- Mark, Jennifer, Tom update their progress
- David sees: Mark 100%, Jennifer 80%, Tom 20%
- Overall: 66% complete
- User A sees: "Elite Electrical - 66% complete (David Brown)"
- User A **cannot** see individual team member progress

**Result - Owner View:**
```
Task: Install Main Electrical Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Assigned to: Elite Electrical ⚡
Contact: David Brown ⭐
Status: In Progress
Progress: 66%
```

**Result - POC View:**
```
Task: Install Main Electrical Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
My Team Assignments:
  ✅ Mark Wilson (Panel) 100%
  🔄 Jennifer Lee (Wiring) 80%
  🔄 Tom Anderson (Testing) 20%

Overall Progress: 66%
```

### Scenario 3: Sub-Contractor Hierarchy

**Step 1: Contractor Needs Specialist**
- David (Elite Electrical POC) realizes he needs specialized wiring
- Creates sub-task: "Install High-Voltage Circuit Breakers"
- Needs external specialist

**Step 2: Contractor Invites Sub-Contractor**
- David invites: robert@specializedwiring.com
- Relationship: "Subcontractor"
- Designates: "Point of Contact"
- Adds message: "Need your expertise for HV circuits"

**Step 3: Sub-Contractor Accepts**
- Robert accepts invitation
- System:
  - Creates Specialized Wiring company membership
  - parent_company_membership_id = Elite Electrical membership
  - visibility_level = 2 (subcontractor level)
  - Designates Robert as POC
- **Important**: User A (owner) does NOT see this invitation
- Only David sees Specialized Wiring

**Step 4: Contractor Assigns Sub-Task**
- David assigns sub-task to Robert
- Robert's company: Specialized Wiring
- Visibility:
  - ✅ David (Elite Electrical) - Full access
  - ✅ Robert (Specialized Wiring) - Full access
  - ❌ User A (Acme Construction) - No visibility

**Step 5: Sub-Contractor Builds Team**
- Robert adds his team members:
  - Lisa Martinez
  - Carlos Rodriguez
- Only Robert and his team see these members
- David sees: "Specialized Wiring (Robert Taylor)"
- User A has no knowledge of Specialized Wiring at all

**Result - Hierarchy:**
```
User A's View (Owner):
├─ Task: Install Main Electrical Panel
│   └─ Assigned to: Elite Electrical (David Brown) 66%

David's View (Contractor POC):
├─ Task: Install Main Electrical Panel
│   ├─ Mark Wilson 100%
│   ├─ Jennifer Lee 80%
│   ├─ Tom Anderson 20%
│   └─ Sub-task: Install HV Circuits
│       └─ Assigned to: Specialized Wiring (Robert Taylor) 50%

Robert's View (Subcontractor POC):
└─ Sub-task: Install HV Circuits
    ├─ Lisa Martinez 60%
    └─ Carlos Rodriguez 40%
```

**Privacy Maintained:**
- User A cannot see Robert's company or team
- User A cannot see David's internal delegation
- David cannot see Robert's internal delegation
- Each level maintains its own team structure

---

## Implementation Timeline

### Week 1: Database Foundation
**Days 1-2: Schema Design**
- [ ] Finalize all table structures
- [ ] Create migration scripts
- [ ] Design indexes for performance
- [ ] Document relationships

**Days 3-5: Database Implementation**
- [ ] Run migrations on development database
- [ ] Create helper functions/views
- [ ] Write seed data scripts
- [ ] Test data integrity

### Week 2: Core Business Logic
**Days 1-2: POC Management**
- [ ] Implement POC detection logic
- [ ] Create POC assignment functions
- [ ] Build POC transfer mechanism
- [ ] Add validation rules

**Days 3-4: Visibility Engine**
- [ ] Implement visibility level calculations
- [ ] Create user filtering functions
- [ ] Build company hierarchy queries
- [ ] Test visibility rules

**Day 5: Assignment Logic**
- [ ] Update task assignment functions
- [ ] Implement company-level assignments
- [ ] Add delegation mechanisms
- [ ] Create visibility rule generators

### Week 3: Invitation System
**Days 1-2: Backend**
- [ ] Create invitation data models
- [ ] Implement token generation
- [ ] Build invitation acceptance flow
- [ ] Add expiration handling

**Days 3-4: Notifications**
- [ ] Email template design
- [ ] SMS integration
- [ ] Push notification setup
- [ ] Test notification delivery

**Day 5: Frontend**
- [ ] Design invitation modal
- [ ] Build invitation form
- [ ] Create acceptance page
- [ ] Test invitation flow

### Week 4: Task Assignment Refactor
**Days 1-2: User Selection**
- [ ] Update user picker component
- [ ] Implement smart filtering
- [ ] Add POC indicators
- [ ] Show company grouping

**Days 3-4: Assignment UI**
- [ ] Modify task creation screen
- [ ] Update task detail screen
- [ ] Add delegation interface
- [ ] Implement permission checks

**Day 5: Testing**
- [ ] Test assignment flows
- [ ] Verify visibility rules
- [ ] Check edge cases
- [ ] Fix bugs

### Week 5: UI Components
**Days 1-2: Core Components**
- [ ] POC badge component
- [ ] Company hierarchy view
- [ ] Enhanced user picker
- [ ] Invitation modal

**Days 3-4: Management Screens**
- [ ] Team management screen
- [ ] Company settings page
- [ ] POC transfer interface
- [ ] Member list views

**Day 5: Polish**
- [ ] Improve UI/UX
- [ ] Add animations
- [ ] Responsive design
- [ ] Accessibility

### Week 6: Testing & Launch
**Days 1-2: Testing**
- [ ] Unit tests for all functions
- [ ] Integration tests
- [ ] Permission tests
- [ ] Performance tests

**Days 3-4: Documentation**
- [ ] User guide
- [ ] Admin guide
- [ ] API documentation
- [ ] Video tutorials

**Day 5: Launch Preparation**
- [ ] Final QA
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitor and support

---

## Edge Cases & Handling

### 1. POC Leaves Project
**Scenario**: Current POC is removed or leaves company

**Solution**:
- System automatically promotes next admin user
- If no admin available, promote senior team member
- Notify all team members of POC change
- Send notification to upstream POC
- Maintain all existing permissions

**Implementation**:
```typescript
function handlePOCDeparture(
  departingPOCId: string,
  projectId: string
) {
  const company = getCompanyForUser(departingPOCId);
  const teamMembers = getCompanyMembers(
    company.id,
    projectId
  );

  // Find replacement
  const newPOC = teamMembers.find(m => m.role === 'admin')
    || teamMembers[0];

  if (!newPOC) {
    // No team members left
    handleCompanyDeparture(company.id, projectId);
    return;
  }

  // Transfer POC
  transferPOC(projectId, company.id, departingPOCId, newPOC.id);

  // Notify stakeholders
  notifyPOCChange(projectId, company.id, newPOC);
}
```

### 2. Company Has No Active Members
**Scenario**: Last team member leaves/is removed

**Solution**:
- Mark company membership as inactive
- Notify upstream POC
- Freeze all active tasks assigned to company
- Offer to reassign tasks to other companies
- Preserve data for potential reactivation

### 3. Circular Dependencies
**Scenario**: Company A tries to invite Company A as subcontractor

**Solution**:
- Validate company relationships before invitation
- Check entire hierarchy for circular references
- Prevent invitation if circular dependency detected
- Show clear error message

**Implementation**:
```typescript
function validateInvitation(
  invitingCompanyId: string,
  inviteeCompanyId: string,
  projectId: string
): boolean {
  // Check if invitee is already upstream
  const hierarchy = getCompanyHierarchy(projectId);
  const upstreamCompanies = getUpstreamCompanies(
    invitingCompanyId,
    hierarchy
  );

  if (upstreamCompanies.includes(inviteeCompanyId)) {
    throw new Error(
      'Cannot invite company that is already upstream in hierarchy'
    );
  }

  // Check if invitee would create circular reference
  if (invitingCompanyId === inviteeCompanyId) {
    throw new Error('Company cannot invite itself');
  }

  return true;
}
```

### 4. Multiple POC Designation Attempts
**Scenario**: Two users from same company both designated as POC

**Solution**:
- Database constraint prevents multiple POCs
- UI validates before allowing designation
- If conflict occurs, show modal to resolve
- Admin chooses which user should be POC
- Other user reverted to team member

### 5. Invitation Expiry
**Scenario**: Invitation not accepted within 7 days

**Solution**:
- Automated job runs daily
- Marks expired invitations
- Sends reminder before expiry (day 5)
- Allows re-invitation after expiry
- Cleans up old expired invitations (30 days)

**Implementation**:
```typescript
// Cron job (daily at 2 AM)
async function processExpiredInvitations() {
  const now = new Date();

  // Find expiring soon (reminder)
  const expiringSoon = await supabase
    .from('project_invitations')
    .select('*')
    .eq('status', 'pending')
    .gte('expires_at', now)
    .lte('expires_at', addDays(now, 2));

  for (const invitation of expiringSoon) {
    sendExpiryReminder(invitation);
  }

  // Mark expired
  await supabase
    .from('project_invitations')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', now);

  // Clean up old expired (30+ days)
  await supabase
    .from('project_invitations')
    .delete()
    .eq('status', 'expired')
    .lt('expires_at', addDays(now, -30));
}
```

### 6. User Belongs to Multiple Companies
**Scenario**: User is member of Company A and Company B

**Solution**:
- User can be POC for different companies on different projects
- Context switching UI shows current company context
- Clear visual indicator of active company
- Separate notifications for each company role
- Permission checks based on current context

### 7. Task Reassignment
**Scenario**: Task needs to be reassigned from one company to another

**Solution**:
- Allow POC to decline task (with reason)
- Task returns to assigner's inbox
- Assigner can reassign to different company
- Maintain assignment history
- Notify both companies

### 8. POC Cannot See Own Assignments
**Scenario**: POC assigns task to themselves

**Solution**:
- Always show tasks assigned to POC
- Special handling for self-assignments
- POC sees task in both "Assigned to Me" and "My Company" views
- Clear indication that POC is both assigner and assignee

---

## Success Metrics

### Technical Metrics
- ✅ Database queries execute in < 100ms
- ✅ Page load times remain under 2 seconds
- ✅ No N+1 query issues
- ✅ Proper indexes on all foreign keys
- ✅ 100% test coverage on permission logic

### Functional Metrics
- ✅ Clear company boundaries maintained
- ✅ Zero unauthorized visibility into downstream teams
- ✅ POC can manage teams independently
- ✅ Upstream users see simplified view (POC only)
- ✅ All communication flows through POCs
- ✅ Invitation system success rate > 95%
- ✅ Permission checks prevent unauthorized actions

### User Experience Metrics
- ✅ Users understand POC concept (< 5 min onboarding)
- ✅ Invitation acceptance time < 24 hours
- ✅ Task assignment completion rate > 90%
- ✅ User satisfaction score > 4.5/5
- ✅ Support tickets < 5 per week

---

## Security Considerations

### Data Privacy
1. **Encryption**: All invitation tokens encrypted
2. **Access Control**: Row-level security on all tables
3. **Audit Logging**: Track all POC changes and invitations
4. **Data Isolation**: Companies cannot see each other's data
5. **Session Management**: Proper context switching between companies

### Permission Enforcement
1. **Backend Validation**: Never trust client-side checks
2. **Database Constraints**: Enforce rules at DB level
3. **API Guards**: Verify permissions before data access
4. **UI Disable**: Disable unavailable actions proactively
5. **Error Messages**: Generic messages to prevent info leakage

### Invitation Security
1. **Token Expiry**: Maximum 7 days validity
2. **One-time Use**: Tokens invalidated after acceptance
3. **Rate Limiting**: Prevent invitation spam
4. **Email Verification**: Confirm email before account creation
5. **HTTPS Only**: No plain-text invitation links

---

## Migration Strategy

### Phase 1: Development (Week 1-3)
- Implement all features in development environment
- Create comprehensive test suite
- Perform load testing
- Security audit

### Phase 2: Staging (Week 4)
- Deploy to staging environment
- Internal team testing
- Fix bugs and issues
- Performance optimization

### Phase 3: Beta (Week 5)
- Invite select customers for beta testing
- Gather feedback
- Iterate on UI/UX
- Monitor for issues

### Phase 4: Production (Week 6)
- Gradual rollout (10% → 50% → 100%)
- Monitor performance metrics
- 24/7 support availability
- Emergency rollback plan ready

---

## Rollback Plan

### If Critical Issues Found

**Immediate Actions**:
1. Disable invitation system (prevent new invitations)
2. Revert to old user assignment logic
3. Notify affected users via email
4. Investigate root cause

**Data Preservation**:
- All new tables remain intact
- No data deletion required
- Can re-enable when fixed
- Maintain audit trail

**Communication**:
- Status page updates
- Email notifications to admins
- In-app banner message
- Support team briefing

---

## Future Enhancements

### Phase 2 Features (Post-Launch)
1. **Company Templates**: Pre-defined company structures
2. **Bulk Invitations**: Invite multiple users at once
3. **Smart Suggestions**: AI-recommended team members
4. **Performance Analytics**: POC performance metrics
5. **Advanced Reporting**: Company-level reports

### Integration Opportunities
1. **Calendar Integration**: Sync with Google/Outlook
2. **Communication Tools**: Slack/Teams integration
3. **Document Sharing**: Connect to Google Drive/Dropbox
4. **Time Tracking**: Integration with time tracking tools
5. **Accounting Systems**: Invoice generation

---

## Appendix

### A. Database Schema Diagram

```
companies
├─ id (PK)
├─ name
└─ type

users
├─ id (PK)
├─ company_id (FK → companies)
├─ name
└─ role

projects
├─ id (PK)
├─ company_id (FK → companies)
└─ created_by (FK → users)

company_project_memberships
├─ id (PK)
├─ company_id (FK → companies)
├─ project_id (FK → projects)
├─ point_of_contact_user_id (FK → users)
├─ parent_company_membership_id (FK → self)
└─ visibility_level

user_project_assignments
├─ id (PK)
├─ user_id (FK → users)
├─ project_id (FK → projects)
├─ is_point_of_contact
└─ visibility_level

project_invitations
├─ id (PK)
├─ project_id (FK → projects)
├─ invited_by (FK → users)
├─ should_be_poc
└─ status

tasks
├─ id (PK)
├─ project_id (FK → projects)
├─ assigned_to_companies[]
└─ assigned_to_pocs[]

task_visibility_rules
├─ id (PK)
├─ task_id (FK → tasks)
├─ visible_to_company_id (FK → companies)
├─ visible_to_user_id (FK → users)
└─ visibility_scope
```

### B. API Endpoints

**Company Management**
```
POST   /api/companies/:companyId/projects/:projectId/members
GET    /api/companies/:companyId/projects/:projectId/members
DELETE /api/companies/:companyId/projects/:projectId/members/:userId
PUT    /api/companies/:companyId/projects/:projectId/poc
```

**Invitations**
```
POST   /api/projects/:projectId/invitations
GET    /api/projects/:projectId/invitations
PUT    /api/invitations/:token/accept
PUT    /api/invitations/:token/decline
DELETE /api/invitations/:invitationId
```

**Task Assignment**
```
POST   /api/tasks/:taskId/assign-company
POST   /api/tasks/:taskId/assign-internal
GET    /api/tasks/:taskId/visibility
PUT    /api/tasks/:taskId/visibility
```

**User Queries**
```
GET    /api/projects/:projectId/assignable-users
GET    /api/projects/:projectId/pocs
GET    /api/projects/:projectId/company-hierarchy
GET    /api/users/:userId/is-poc
```

### C. Testing Checklist

**Unit Tests**
- [ ] POC detection logic
- [ ] Visibility calculations
- [ ] Permission validation
- [ ] Invitation token generation
- [ ] Company hierarchy queries
- [ ] Task assignment rules

**Integration Tests**
- [ ] Complete invitation flow
- [ ] Task assignment end-to-end
- [ ] POC transfer process
- [ ] Company departure handling
- [ ] Circular dependency prevention

**UI Tests**
- [ ] Invitation modal
- [ ] User picker filtering
- [ ] POC badge display
- [ ] Team management screen
- [ ] Company hierarchy view

**Performance Tests**
- [ ] Load testing (100 concurrent users)
- [ ] Query performance (< 100ms)
- [ ] Page load times (< 2s)
- [ ] Memory usage
- [ ] Database connection pooling

**Security Tests**
- [ ] Permission bypass attempts
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Token manipulation

---

## Conclusion

The Point of Contact system represents a significant enhancement to BuildTrack's multi-company collaboration capabilities. By implementing this hierarchical structure with clear visibility boundaries, we enable:

1. **Efficient Collaboration**: Multiple companies work together seamlessly
2. **Privacy Protection**: Each company maintains control over internal operations
3. **Clear Communication**: Single point of contact eliminates confusion
4. **Scalability**: Unlimited hierarchy depth supports complex projects
5. **Security**: Robust permission system prevents unauthorized access

This implementation plan provides a comprehensive roadmap for delivering this feature within a 6-week timeline. The phased approach ensures thorough testing and smooth deployment while minimizing risk to existing functionality.

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-22 | BuildTrack Team | Initial release |

---

**Approval Signatures**

*To be completed after review*

- [ ] Project Manager: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

*End of Document*

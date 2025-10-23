# Contact Person System - Quick Summary

## 🎯 Core Concept

### What is a Contact Person?
- **First user** from a company to join a project = **Contact Person** for that company
- Acts as **single point of contact** between their company and other companies
- Can add team members, invite subcontractors, and manage communication

### Example Scenario
```
User A (Company A) creates Project A
  ↓
User A is automatically Contact Person for Company A
  ↓
User A invites User B (Company B) to be Contact Person for Company B
  ↓
User B can invite User C (Company C) as subcontractor
  ↓
Company A → Company B → Company C (hierarchical chain)
```

## 🔐 Visibility Rules

### Who Can See Whom?

| User Type | Can See |
|-----------|---------|
| **Any User** | • All members of their own company on the project |
| **Contact Person** | • All members of their own company<br>• Contact persons of direct subcontractors<br>• Members of parent/upstream companies |
| **Task Owner** | • Anyone they assigned tasks to |
| **Task Assignee** | • The person who assigned them the task |

### What Users CANNOT See
❌ Members of downstream subcontractor teams (only see contact person)
❌ Members of unrelated companies in the project
❌ Users not on the project

## 📊 Key Database Changes

### New Tables

1. **`company_project_relationships`**
   - Tracks which companies are in which projects
   - Stores contact person for each company on each project
   - Maintains parent-child hierarchy
   
2. **`project_invitations`**
   - Enhanced invitation system
   - Can designate who becomes contact person
   - Supports inviting by email/phone

### Modified Tables

3. **`user_project_roles`**
   - Add `is_contact_person` flag

## 🎨 User Experience

### Contact Person Powers
✅ Add/remove team members from own company
✅ Invite subcontractor companies
✅ Assign tasks to team or subcontractor contact persons
✅ Accept tasks and delegate to team/subcontractors
✅ Transfer contact person role to another team member

### Regular User Experience
- Can only see relevant users (no clutter)
- Clear indication of who is contact person (badge)
- Can assign tasks only to visible users
- Communication flows through proper channels

## 🏗️ Company Hierarchy Example

```
📦 Downtown Construction Project
│
├─ 🏢 BuildTrack Inc. (Owner - Company A)
│   ├─ ⭐ John (Contact Person) ← Can see everyone below
│   ├─ 👤 Sarah
│   └─ 👤 Alex
│
├─ 🏢 Elite Electric Co. (Subcontractor - Company B)
│   ├─ ⭐ Mike (Contact Person) ← Can see Company A members
│   ├─ 👤 Lisa                    ← Can see Mike & Company A
│   │
│   └─ 🏢 Wire Specialists (Sub-subcontractor - Company C)
│       ├─ ⭐ Bob (Contact Person) ← Can see Company A & B
│       └─ 👤 Tom                   ← CANNOT be seen by Company A
│
└─ 🏢 Plumbing Pro (Subcontractor - Company D)
    └─ ⭐ Susan (Contact Person) ← Can see Company A members
```

### Visibility Matrix

| Who | Can See |
|-----|---------|
| **John (Owner Contact)** | Everyone (John, Sarah, Alex, Mike, Susan) |
| **Sarah (Owner Team)** | Company A only (John, Sarah, Alex) |
| **Mike (Subcontractor Contact)** | Company A + Company B (John, Sarah, Alex, Mike, Lisa) |
| **Lisa (Subcontractor Team)** | Company A + Company B (same as Mike) |
| **Bob (Sub-subcontractor Contact)** | Company A + Company B + Company C (everyone except Tom visible to upstream) |
| **Tom (Sub-subcontractor Team)** | Company A + Company B + Company C (same as Bob) |
| **Susan (Another Subcontractor Contact)** | Company A + Company D (John, Sarah, Alex, Susan) |

### Task Assignment Matrix

| Who | Can Assign To |
|-----|---------------|
| **John (Owner Contact)** | Sarah, Alex, Mike (contact), Susan (contact) |
| **Sarah (Owner Team)** | John, Alex (own company only) |
| **Mike (Subcontractor Contact)** | Lisa (own team), Bob (sub-subcontractor contact), or upstream (John, Sarah, Alex) |
| **Lisa (Subcontractor Team)** | Mike (own team) |
| **Bob (Sub-subcontractor Contact)** | Tom (own team), or upstream (Mike, Lisa, John, Sarah, Alex) |

## 🔄 Key Flows

### 1. Create Project
```
1. User A creates project
2. System automatically:
   - Sets Company A as owner
   - Sets User A as Contact Person
   - Creates company_project_relationships entry
```

### 2. Invite Subcontractor
```
1. Contact Person clicks "Invite Subcontractor"
2. Enters email/phone
3. Checks "Designate as Contact Person"
4. Sends invitation
5. Invitee accepts
6. System creates:
   - User account (if new)
   - company_project_relationships entry
   - Sets parent_company_id to inviter's company
```

### 3. Assign Task to Subcontractor
```
1. User A (Company A) assigns task to User B (Contact Person of Company B)
2. User B accepts task
3. User B can:
   - Work on it themselves
   - Assign to Lisa (team member)
   - Assign to Bob (sub-subcontractor contact)
4. User A can see task is assigned to User B
5. User A CANNOT see if User B delegated to Lisa or Bob
```

### 4. Transfer Contact Person Role
```
1. Current Contact Person goes to "Project Settings"
2. Clicks "Transfer Contact Person Role"
3. Selects team member from own company
4. Confirms transfer
5. System updates company_project_relationships
6. New contact person gets all permissions
```

## ⚠️ Important Rules

### Contact Person Restrictions
- 📌 Must transfer role before leaving project
- 📌 Cannot be deleted from system while being contact person
- 📌 Only one contact person per company per project

### Invitation Rules
- 📌 Only Contact Persons and Admins can invite
- 📌 Team members can be added only by own company's contact person
- 📌 Subcontractors must be invited through contact person

### Visibility Rules
- 📌 Enforced at database level (RLS policies)
- 📌 Cannot be bypassed (except by system admin)
- 📌 Computed dynamically based on relationships

## 🚀 Implementation Phases

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 1** | 2-3 days | Database schema & functions |
| **Phase 2** | 3-4 days | Backend/State layer |
| **Phase 3** | 2-3 days | Project creation & contact person flow |
| **Phase 4** | 3-4 days | Invitation system |
| **Phase 5** | 3-4 days | User visibility & selection |
| **Phase 6** | 2-3 days | Task assignment rules |
| **Phase 7** | 2-3 days | Contact person management |
| **Phase 8** | 3-4 days | Testing & polish |

**Total Estimated Time:** 20-30 days

## 📋 Success Criteria

✅ Project creator automatically becomes contact person
✅ Contact persons can invite subcontractors
✅ Users only see relevant users (no information leakage)
✅ Upstream cannot see downstream team members
✅ Task assignment respects hierarchy
✅ Contact person role can be transferred
✅ System prevents contact person from leaving without transfer
✅ Works with multiple levels of subcontractors (3+ levels)
✅ Performance is good with 50+ companies in one project

## 🎯 Benefits

### For Project Owners
- Clear chain of command
- Single point of contact for each company
- Better communication structure
- Privacy for subcontractor internal teams

### For Subcontractors
- Autonomy in team management
- Can bring their own subcontractors
- Team privacy from upstream
- Clear responsibilities

### For Workers
- See only relevant people (less confusion)
- Clear who to contact for issues
- Proper communication channels
- Better organized task lists

---

## 📖 Full Documentation

See `CONTACT_PERSON_IMPLEMENTATION_PLAN.md` for complete technical details including:
- Complete database schema
- All SQL functions
- RLS policies
- TypeScript types
- UI/UX mockups
- Edge cases
- Testing checklist
- Migration scripts

---

*Last Updated: October 22, 2025*


# Contact Person System - One-Page Cheat Sheet

Quick reference guide for the Contact Person feature.

---

## 🎯 What Is It?

**Contact Person** = First user from a company to join a project  
→ Single point of contact between companies  
→ Can manage team and invite subcontractors

---

## 🔑 Key Rules

| Rule | Description |
|------|-------------|
| **One per company** | Each company has ONE contact person per project |
| **Auto-assigned** | Project creator automatically becomes contact person |
| **Can transfer** | Contact person can transfer role to teammate |
| **Must transfer** | Cannot leave project without transferring first |

---

## 👁️ Visibility Rules

### ✅ You CAN See:
- All members of your own company
- Contact persons of direct subcontractors
- Members of upstream/parent companies
- People who assigned you tasks
- People you assigned tasks to

### ❌ You CANNOT See:
- Members of downstream subcontractor teams
- Members of sibling subcontractors
- Unrelated companies on the project

---

## 📊 Example Hierarchy

```
🏢 BuildTrack Inc. (Owner)
│   ⭐ John (Contact) ← Sees all direct subs
│   👤 Sarah
│
├─ 🏢 Electric Co.
│   ⭐ Mike (Contact) ← Sees owner + own team + own subs
│   👤 Lisa
│   │
│   └─ 🏢 Wire Specialists
│       ⭐ Bob (Contact) ← Sees up to owner
│       👤 Tom ← Hidden from John
│
└─ 🏢 Plumbing Co.
    ⭐ Susan (Contact)
```

**John sees:** John, Sarah, Mike, Susan  
**Mike sees:** John, Sarah, Mike, Lisa, Bob  
**Sarah sees:** John, Sarah (own team only)  
**Bob sees:** John, Sarah, Mike, Lisa, Bob, Tom

---

## 🎭 User Types & Permissions

| User Type | Add Team | Invite Subs | Assign to Subs | Transfer Role |
|-----------|----------|-------------|----------------|---------------|
| **Contact Person** | ✅ | ✅ | ✅ | ✅ |
| **Team Member** | ❌ | ❌ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

---

## 📨 Invitation Types

### Add Team Member
- Same company only
- Already registered users
- Immediate (no invitation)
- Regular team member

### Invite Subcontractor
- External company
- Can be new user (email/phone)
- Requires acceptance
- Can designate as contact person

---

## 🔄 Common Workflows

### 1️⃣ Create Project
```
User creates project
    ↓
Automatically becomes Contact Person
    ↓
Can add team & invite subs
```

### 2️⃣ Invite Subcontractor
```
Contact Person clicks "Invite Subcontractor"
    ↓
Enter email/phone
    ↓
☑ Designate as Contact Person
    ↓
Send invitation
    ↓
They accept → Join as contact person
```

### 3️⃣ Assign Task
```
Contact Person creates task
    ↓
Can assign to:
  • Own team members
  • Subcontractor contact persons
    ↓
Subcontractor accepts
    ↓
Delegates to their team (hidden from you)
```

### 4️⃣ Transfer Role
```
Contact Person → Settings
    ↓
"Transfer Contact Person Role"
    ↓
Select teammate
    ↓
Confirm
    ↓
Role transferred
```

---

## 🗄️ Database Tables (New)

### company_project_relationships
- Tracks companies in projects
- Stores contact person ID
- Maintains parent-child hierarchy

### project_invitations
- Enhanced invitation system
- Contact person designation
- Email/phone support

### Modified: user_project_roles
- Added `is_contact_person` flag

---

## 🔧 Key Functions

| Function | Purpose |
|----------|---------|
| `is_contact_person()` | Check if user is contact person |
| `get_visible_users_for_user_on_project()` | Get users a user can see |
| `get_assignable_users_for_user_on_project()` | Get users to assign tasks to |
| `get_contact_person_for_company_on_project()` | Get contact person for company |
| `get_company_hierarchy_for_project()` | Get full company tree |

---

## 📋 Implementation Phases

| # | Phase | Duration | Key Tasks |
|---|-------|----------|-----------|
| 1 | Database | 2-3 days | Schema, functions, RLS |
| 2 | Backend | 3-4 days | Stores, helpers |
| 3 | Project Creation | 2-3 days | Auto-assign contact |
| 4 | Invitations | 3-4 days | Invite flow |
| 5 | Visibility | 3-4 days | User filtering |
| 6 | Task Assignment | 2-3 days | Assignment rules |
| 7 | Management | 2-3 days | Transfer role |
| 8 | Testing | 3-4 days | E2E tests |

**Total:** 20-30 days

---

## ⚠️ Common Pitfalls

| Issue | Solution |
|-------|----------|
| Can't see user I need | They're downstream - assign to their contact person |
| Can't invite team member | Use "Add Team Member" not "Invite Subcontractor" |
| Can't leave project | Transfer contact person role first |
| Subcontractor unresponsive | Contact admin to change their contact person |
| Wrong person is contact | Current contact can transfer to correct person |

---

## 🎯 Success Checklist

- [ ] Project creator auto-assigned as contact person
- [ ] Contact persons can add team members
- [ ] Contact persons can invite subcontractors
- [ ] Visibility rules enforced correctly
- [ ] Can't see downstream team members
- [ ] Task assignment respects hierarchy
- [ ] Contact person role can be transferred
- [ ] Can't leave while being contact person
- [ ] Works with 3+ levels of subcontractors
- [ ] Performance good with 50+ companies

---

## 📚 Documentation

| Document | Use When |
|----------|----------|
| **Master Index** | Finding right documentation |
| **Implementation Plan** | Building the feature |
| **Quick Summary** | Understanding concept |
| **Visual Guide** | Seeing examples |
| **FAQ** | Troubleshooting |
| **This Cheat Sheet** | Quick reference |

---

## 🚀 Quick Start

```bash
# 1. Read documentation (1 hour)
Read: Quick Summary + Visual Guide

# 2. Set up database (3 hours)
Run: migration-add-contact-person-system.sql

# 3. Implement backend (3-4 days)
Create: Zustand stores + helper functions

# 4. Build UI (10-15 days)
Phases: 3-7 from implementation plan

# 5. Test thoroughly (3-4 days)
Run: All tests from testing checklist

# 6. Deploy with migration (1 day)
Run: Data migration for existing projects
```

---

## 🔐 Security Notes

- ✅ Enforced at database level (RLS)
- ✅ Cannot bypass visibility rules
- ✅ Admin can see all (for support)
- ✅ Indexed for performance
- ✅ Backward compatible

---

## 💡 Best Practices

1. **Invite strategically** - Invite contact persons first, let them add their teams
2. **Use hierarchy** - Don't flatten structure, use proper tiers
3. **Delegate properly** - Assign to contact persons, not individuals
4. **Transfer early** - If wrong person is contact, transfer immediately
5. **Document hierarchy** - Keep organization chart updated

---

## 📞 Need Help?

1. **Check FAQ** - 49 questions answered
2. **Review Visual Guide** - See examples
3. **Read Implementation Plan** - Technical details
4. **Contact admin** - For overrides

---

## 🎓 Training Time

| Role | Time | Focus |
|------|------|-------|
| Contact Person | 30 min | Managing team & subs |
| Team Member | 10 min | Understanding visibility |
| Admin | 1 hour | System management |
| Developer | 2 hours | Technical architecture |

---

**Version:** 1.0  
**Updated:** October 22, 2025  
**Status:** ✅ Ready for Implementation

---

## Quick Reference Cards

### Contact Person Card
```
✅ Can Do:
  • Add/remove team members
  • Invite subcontractors
  • Assign tasks to team/subs
  • Transfer contact role

❌ Cannot Do:
  • Remove other companies
  • See downstream teams
  • Change project owner
  • Leave without transfer
```

### Team Member Card
```
✅ Can Do:
  • Work on assigned tasks
  • See own team
  • See task-related users
  • Assign tasks to own team

❌ Cannot Do:
  • Add team members
  • Invite subcontractors
  • See subcontractor teams
  • Assign to other companies
```

### Visibility Card
```
🟢 Always See:
  • Own company members

🟡 Conditionally See:
  • Direct subcontractor contacts
  • Upstream company members
  • Task-related users

🔴 Never See:
  • Downstream team members
  • Sibling subcontractor teams
  • Unrelated companies
```

---

**Print this page for quick reference during development and training!**


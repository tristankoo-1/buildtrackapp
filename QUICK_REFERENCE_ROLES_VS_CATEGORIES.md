# Quick Reference: Roles vs Categories

**Print this or keep it handy while coding!**

---

## 🎯 The Core Difference

| | **User Role** | **User Category** |
|---|---|---|
| **Also Called** | Job Title, System Role | Project Role, Project Capacity |
| **Scope** | System-wide | Project-specific |
| **Stored In** | `users.role` | `user_project_assignments.category` |
| **Values** | `admin`, `manager`, `worker` | `contractor`, `inspector`, `lead_project_manager`, etc. |
| **Changes** | Rarely | Per project |
| **Controls** | What you CAN do in the system | What you DO on this project |

---

## 💡 Quick Mnemonic

> **ROLE** = What you **ARE**  
> **CATEGORY** = What you **DO**

---

## 📝 Examples

### Example 1: Sarah the Manager
```typescript
// Sarah's USER ROLE (Job Title)
user.role = "manager"  // System-wide permissions

// Sarah's USER CATEGORIES (Project Roles)
Project A: category = "contractor"           // Acting as contractor
Project B: category = "lead_project_manager" // Leading the project
Project C: category = "inspector"            // Quality control
```

### Example 2: The "Worker" Confusion
```typescript
// USER ROLE "worker"
user.role = "worker"  
// → Limited system permissions
// → Can only view assigned tasks

// USER CATEGORY "worker"  
assignment.category = "worker"
// → Project role: general labor
// → A "manager" can have category "worker" on a project!
```

---

## 🔍 How to Tell Them Apart in Code

### User Role (Job Title)
```typescript
// Reading job title
if (user.role === "admin") { }
const isManager = user.role === "manager";

// Filtering by job title
const managers = users.filter(u => u.role === "manager");

// Permission checks (system-wide)
const canManage = ["admin", "manager"].includes(user.role);
```

### User Category (Project Role)
```typescript
// Assigning to project
assignUserToProject(userId, projectId, "contractor", adminId);
                                      //  ↑ category (project role)

// Displaying on project team
<Text>{assignment.category}</Text>  // "contractor", "inspector", etc.

// Finding project lead
const leadPM = assignments.find(a => a.category === "lead_project_manager");

// Filtering project team
const inspectors = assignments.filter(a => a.category === "inspector");
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG
```typescript
// Using role when you mean category
assignUserToProject(userId, projectId, user.role, adminId);
//                                       ↑ WRONG! This is their job title

// Displaying category as if it's a role
<Text>Job Title: {assignment.category}</Text>
//               ↑ WRONG! This is their project role
```

### ✅ CORRECT
```typescript
// Using category for project assignment
assignUserToProject(userId, projectId, "contractor", adminId);
//                                       ↑ CORRECT! Project role

// Displaying both correctly
<Text>Job Title: {user.role}</Text>           // admin/manager/worker
<Text>Project Role: {assignment.category}</Text> // contractor/inspector/etc.
```

---

## 🎨 UI Labels to Use

### For User Profile
```
✅ "Job Title: Manager"           (user.role)
✅ "Position: Senior Construction Manager"  (user.position)
```

### For Project Team
```
✅ "Project Role: Contractor"     (assignment.category)
✅ "Acts as: Lead Project Manager" (assignment.category)
```

### For Assignment Modals
```
✅ "Select Project Role"          (not "Select Category")
✅ "Assign as: Contractor"        (category selection)
```

---

## 📚 Where to Learn More

1. **Complete Guide:** `ROLE_VS_CATEGORY_GUIDE.md`
2. **Refactoring Plan:** `REFACTORING_ROLES_CATEGORIES.md`
3. **Changes Summary:** `DOCUMENTATION_CHANGES_SUMMARY.md`
4. **Inline Comments:** Check `src/types/buildtrack.ts`

---

## 🚨 Still Confused?

### Ask Yourself:
1. **Is it system-wide?** → Use **User Role**
2. **Is it project-specific?** → Use **User Category**
3. **Controls permissions?** → Use **User Role**
4. **Shows what they do?** → Use **User Category**

### Remember:
- One person, one **role** (job title)
- One person, many **categories** (different projects)

---

**Keep this handy!** 📌


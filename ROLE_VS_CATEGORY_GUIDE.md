# User Roles vs User Categories - Complete Guide

**Date:** October 22, 2025  
**Purpose:** Clarify the distinction between User Roles (Job Titles) and User Categories (Project Roles)

---

## 📋 Overview

BuildTrack uses two distinct concepts that are often confused:

| Concept | Alternative Name | Scope | Example |
|---------|-----------------|-------|---------|
| **User Role** | Job Title, System Role | System-wide | "admin", "manager", "worker" |
| **User Category** | Project Role, Project Capacity | Project-specific | "contractor", "inspector", "lead_project_manager" |

---

## 🎯 User Role (Job Title)

### Definition
A user's **job title** or **system permission level** within their company. This determines what they can do across the entire BuildTrack system.

### Characteristics
- ✅ **System-wide** - applies everywhere in the app
- ✅ **Permanent** - rarely changes
- ✅ **Single value** - one role per user
- ✅ **Controls permissions** - what features they can access

### The 3 User Roles

#### 1. **Admin** (Level 1)
- Full system access
- Can manage users, companies, and projects
- Can assign users to projects
- Can delete and modify anything

**Permissions:**
```json
{
  "can_manage_users": true,
  "can_manage_companies": true,
  "can_manage_projects": true,
  "can_manage_tasks": true,
  "can_manage_roles": true,
  "can_view_all": true,
  "can_delete_all": true
}
```

#### 2. **Manager** (Level 2)
- Can manage projects and tasks
- Can assign users to projects
- Can view reports
- Cannot manage other users or companies

**Permissions:**
```json
{
  "can_manage_projects": true,
  "can_manage_tasks": true,
  "can_assign_users": true,
  "can_view_reports": true
}
```

#### 3. **Worker** (Level 3)
- Can view assigned tasks
- Can update task progress
- Can add updates to tasks
- Limited system access

**Permissions:**
```json
{
  "can_view_assigned_tasks": true,
  "can_update_tasks": true,
  "can_add_updates": true
}
```

### Where It's Stored
```typescript
// users table
{
  id: "user-123",
  name: "John Smith",
  role: "manager",  // ← USER ROLE (Job Title)
  companyId: "company-abc",
  position: "Construction Manager",
  phone: "555-0123"
}
```

### Where It's Used
1. **Authentication & Authorization** - Determines app access
2. **Feature Visibility** - Shows/hides screens and buttons
3. **Permission Checks** - Controls what actions are allowed
4. **Company Management** - Admins manage their company's users

---

## 🏗️ User Category (Project Role)

### Definition
A user's **specific role or capacity** within a particular project. This determines what they're responsible for on that project.

### Characteristics
- ✅ **Project-specific** - different for each project
- ✅ **Flexible** - can change per project assignment
- ✅ **Multiple values** - different category on each project
- ✅ **Controls responsibilities** - what they do on the project

### The 8 User Categories

#### 1. **Lead Project Manager** ⭐
- Oversees entire project execution
- Full visibility to all tasks
- Can approve work
- Special purple badge

#### 2. **Contractor**
- Main contractor for project work
- Can create and assign tasks
- Manages task execution

#### 3. **Subcontractor**
- Specialized contractor for specific tasks
- Can create subtasks
- Limited to assigned work

#### 4. **Inspector**
- Reviews and inspects work quality
- Can approve/reject work
- Can add comments

#### 5. **Architect**
- Provides architectural guidance
- Can approve designs
- Advisory role

#### 6. **Engineer**
- Provides engineering guidance
- Can approve engineering work
- Technical oversight

#### 7. **Worker**
- Executes assigned tasks
- Updates task progress
- On-site labor

#### 8. **Foreman**
- Supervises workers on-site
- Can assign tasks
- Can approve work

### Where It's Stored
```typescript
// user_project_assignments table
{
  id: "assignment-456",
  userId: "user-123",
  projectId: "project-789",
  category: "contractor",  // ← USER CATEGORY (Project Role)
  assignedAt: "2025-10-22T10:00:00Z",
  assignedBy: "admin-001",
  isActive: true
}
```

### Where It's Used
1. **Project Team Lists** - Shows who's on the project and in what capacity
2. **Task Assignment** - Determines who can be assigned to tasks
3. **Project Visibility** - Lead PMs see all tasks
4. **Responsibility Display** - Shows what each person does on the project

---

## 🔍 Real-World Examples

### Example 1: Sarah - The Versatile Manager

**Job Title (User Role):**
```typescript
{
  name: "Sarah Johnson",
  role: "manager",  // System-wide job title
  company: "ABC Construction"
}
```

**System Permissions:**
- ✅ Can create projects
- ✅ Can assign users to projects
- ✅ Can manage tasks
- ✅ Can view reports

**Project Assignments (User Categories):**

| Project | Category | What She Does |
|---------|----------|---------------|
| Downtown Office Complex | `contractor` | Acts as main contractor, creates tasks, manages execution |
| Shopping Mall Renovation | `lead_project_manager` | Oversees entire project, sees all tasks, approves work |
| Warehouse Expansion | `inspector` | Reviews work quality, approves/rejects deliverables |

**Key Insight:** Sarah is a **manager** in the system (can do manager things everywhere), but wears different hats on different projects.

---

### Example 2: Mike - The Skilled Worker

**Job Title (User Role):**
```typescript
{
  name: "Mike Brown",
  role: "worker",  // System-wide job title
  company: "ABC Construction"
}
```

**System Permissions:**
- ✅ Can view assigned tasks
- ✅ Can update task progress
- ❌ Cannot create projects
- ❌ Cannot assign users

**Project Assignments (User Categories):**

| Project | Category | What He Does |
|---------|----------|---------------|
| Downtown Office Complex | `worker` | General labor, executes tasks |
| Shopping Mall Renovation | `foreman` | Supervises other workers, assigns daily tasks |
| Warehouse Expansion | `subcontractor` | Specialized electrical work |

**Key Insight:** Mike is a **worker** in the system (limited permissions), but can have supervisory roles on specific projects.

---

## ⚠️ Common Confusion Points

### Confusion #1: "Worker" Appears in Both

**User Role:**
```typescript
role: "worker"  // Job title - limited system permissions
```

**User Category:**
```typescript
category: "worker"  // Project role - general labor on this project
```

**Solution:** A manager (role) can be assigned as a worker (category) on a project, and vice versa.

---

### Confusion #2: New Role System

The new `roles` table includes both concepts:

```typescript
// System roles (job titles)
- admin
- manager  
- worker

// Project roles (categories)
- lead_project_manager
- contractor
- subcontractor
- inspector
- architect
- engineer
- foreman
```

**Current State:** The new role system is designed to replace the old `user.role` field, but it mixes both concepts. This needs refactoring.

---

## 🏗️ Database Structure

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,              -- Job Title: admin/manager/worker
  company_id UUID REFERENCES companies(id),
  position TEXT NOT NULL,          -- Human-readable: "Construction Manager"
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Project Assignments Table
```sql
CREATE TABLE user_project_assignments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  category TEXT NOT NULL,          -- Project Role: contractor/inspector/etc.
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, project_id, category)
);
```

**Key Insight:** 
- `users.role` = Job title (what you are)
- `user_project_assignments.category` = Project role (what you do here)

---

## 🔄 Migration Path

### Current Implementation
- ✅ User roles work correctly (admin/manager/worker)
- ✅ User categories work correctly (project-specific)
- ⚠️ Naming is confusing
- ⚠️ New role system mixes concepts

### Recommended Changes

#### Phase 1: Rename Types (Low Risk)
```typescript
// OLD
export type UserRole = "admin" | "manager" | "worker";
export type UserCategory = "lead_project_manager" | ...;

// NEW (more clear)
export type JobTitle = "admin" | "manager" | "worker";
export type ProjectRole = "lead_project_manager" | ...;
```

#### Phase 2: Add Documentation
- ✅ Create this guide (done!)
- ✅ Add inline comments to code
- ✅ Update UI labels where needed

#### Phase 3: Refactor New Role System (Higher Risk)
- Separate job title roles from project roles
- Create two distinct tables/systems
- Migrate existing data

---

## 📚 Quick Reference

### When to Use User Role (Job Title)

```typescript
// Checking system permissions
if (user.role === "admin") {
  // Can access admin features
}

// Filtering users by job title
const managers = users.filter(u => u.role === "manager");

// Access control
const canManageProjects = ["admin", "manager"].includes(user.role);
```

### When to Use User Category (Project Role)

```typescript
// Assigning user to project
assignUserToProject(userId, projectId, "contractor", adminId);

// Displaying team member roles
{assignment.category.replace("_", " ")}  // "lead project manager"

// Finding Lead PM for a project
const leadPM = assignments.find(a => a.category === "lead_project_manager");

// Filtering project team
const inspectors = assignments.filter(a => a.category === "inspector");
```

---

## 🎓 For Developers

### Type Safety
```typescript
// Good - Type-safe
const jobTitle: UserRole = "manager";
const projectRole: UserCategory = "contractor";

// Bad - Confusing
const role = "manager";  // Which kind of role?
```

### Function Naming
```typescript
// Good - Clear intent
function assignProjectRole(userId: string, projectId: string, category: UserCategory) {}
function getUserJobTitle(userId: string): UserRole {}

// Bad - Ambiguous
function assignRole(userId: string, role: string) {}  // Which role?
```

### UI Labels
```typescript
// User Profile
"Job Title: Manager"           // user.role
"Position: Construction Manager"  // user.position

// Project Team List
"John Smith - Contractor"      // assignment.category
"Sarah Johnson - Lead Project Manager"  // assignment.category
```

---

## 🚀 Summary

### User Role (Job Title)
- **What:** System permission level
- **Where:** Everywhere in the app
- **Values:** admin, manager, worker
- **Changes:** Rarely
- **Example:** "Sarah is a **manager**"

### User Category (Project Role)
- **What:** Project-specific capacity
- **Where:** Only within a project
- **Values:** contractor, inspector, lead_project_manager, etc.
- **Changes:** Per project
- **Example:** "Sarah is the **contractor** on Project A"

### Key Principle
**One job title (role), many project roles (categories).**

A manager can be a contractor on one project, an inspector on another, and a lead PM on a third.

---

## 📞 Questions?

If you're unsure which to use:
- Need to check **permissions**? → Use **User Role** (job title)
- Need to show **project team**? → Use **User Category** (project role)
- Need to **assign to project**? → Use **User Category** (project role)
- Need to **control features**? → Use **User Role** (job title)

---

**Last Updated:** October 22, 2025  
**Maintained By:** BuildTrack Development Team


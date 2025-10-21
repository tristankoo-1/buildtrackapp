# BuildTrack - Product Requirements Document (PRD)

**Version:** 2.0-INBOX  
**Last Updated:** October 3, 2025  
**Platform:** iOS (React Native/Expo)  
**Status:** Production Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Personas](#user-personas)
4. [Core Features](#core-features)
5. [User Flows](#user-flows)
6. [Technical Architecture](#technical-architecture)
7. [Data Models](#data-models)
8. [Screen Specifications](#screen-specifications)
9. [Security & Privacy](#security--privacy)
10. [Multi-Language Support](#multi-language-support)
11. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Problem Statement

Construction project management requires coordinating multiple companies, contractors, and workers across complex job sites. Traditional methods (paper, spreadsheets, email) lead to:
- Lost task assignments
- Unclear accountability
- Communication breakdowns
- Missed deadlines
- Safety compliance issues

### Solution

BuildTrack is a **mobile-first construction project management app** that enables:
- ✅ **Multi-company collaboration** with company isolation
- ✅ **Hierarchical task delegation** with unlimited sub-task nesting
- ✅ **Role-based access control** (Admin, Manager, Worker)
- ✅ **Visual task tracking** with progress updates and photos
- ✅ **Project-centric organization** with Lead Project Manager roles
- ✅ **Real-time updates** with intuitive inbox/outbox metaphor

### Target Market

- **Primary:** General contractors managing construction projects
- **Secondary:** Subcontractors, consultants, and suppliers
- **Geography:** Initially Taiwan, expandable globally
- **Users per company:** 5-100 team members

---

## Product Overview

### Vision

Become the **#1 mobile construction management platform** for small to medium-sized construction firms by 2026.

### Key Differentiators

1. **Company Isolation** - True multi-tenancy, each company sees only their data
2. **Task Inbox/Outbox** - Email-like metaphor everyone understands
3. **Unlimited Sub-Tasks** - Delegate and subdivide work infinitely
4. **Lead Project Manager** - Special role with full project visibility
5. **Mobile-First** - Designed for on-site use, not desktop adaptation
6. **Photo Updates** - Visual progress tracking built-in

### Success Metrics

- **Adoption:** 80% of company team members use weekly
- **Engagement:** Average 15 minutes/day per active user
- **Task Completion:** 90% of tasks updated at least once
- **Retention:** 85% monthly active user retention

---

## User Personas

### 1. Alex - Admin (Company Owner/PM)

**Demographics:**
- Age: 45-60
- Role: Company Owner / Project Manager
- Tech Savvy: Medium

**Goals:**
- Oversee all company projects
- Assign team members to projects
- Track company-wide progress
- Manage user permissions

**Pain Points:**
- Too many tools to manage
- Hard to see big picture
- User management is complex

**Key Features Used:**
- Admin Dashboard with company stats
- User Management (assign to projects)
- Company Banner customization
- Reports & Analytics

---

### 2. Maria - Manager (Construction Manager)

**Demographics:**
- Age: 30-50
- Role: Site Manager / Construction Manager
- Tech Savvy: Medium-High

**Goals:**
- Create and assign tasks to workers
- Monitor task progress
- Manage multiple projects simultaneously
- Delegate work efficiently

**Pain Points:**
- Can't track who's doing what
- Workers forget assignments
- Hard to follow up on progress

**Key Features Used:**
- Task Outbox (tasks I assigned)
- Create Task (with photos, location)
- Dashboard (quick overview)
- Task delegation and sub-tasks

---

### 3. David - Worker (Field Worker/Technician)

**Demographics:**
- Age: 20-45
- Role: Electrician, Plumber, Carpenter, etc.
- Tech Savvy: Low-Medium

**Goals:**
- See what work is assigned to me
- Update task progress with photos
- Complete tasks on time
- Get clear instructions

**Pain Points:**
- Forget what I'm supposed to do
- Don't know if manager saw my update
- Instructions unclear

**Key Features Used:**
- Task Inbox (tasks assigned to me)
- Task Detail (view info, update progress)
- Photo upload for proof of work
- Status updates (in progress, rejected)

---

### 4. Sarah - Lead Project Manager

**Demographics:**
- Age: 35-55
- Role: Senior Project Manager
- Tech Savvy: High

**Goals:**
- Full visibility across entire project
- Coordinate between multiple contractors
- Catch issues before they become problems
- Maintain schedule and budget

**Pain Points:**
- Limited visibility into contractor work
- Can't see all project tasks in one place
- Hard to spot bottlenecks

**Key Features Used:**
- Lead PM designation (sees ALL project tasks)
- Dashboard with project filter
- Task Detail for all project tasks
- Status monitoring

---

## Core Features

### 1. Authentication & User Management

**Registration:**
- Email + Password OR Phone + Password
- Must belong to a company
- Position/title required
- Company admin approval

**Login:**
- Email or Phone as username
- Password authentication
- Session persistence
- Auto-login on app reopen

**Roles:**
- **Admin:** Full company control, user management
- **Manager:** Create/assign tasks, manage own projects
- **Worker:** View assigned tasks, update progress

**Admin Protection:**
- Companies must have at least 1 admin
- Last admin cannot be demoted or deleted
- System prevents admin removal

---

### 2. Company Management

**Company Isolation:**
- Each user belongs to ONE company
- Users only see data from their company
- Projects, tasks, users all filtered by company
- Complete data separation between companies

**Company Banner:**
- Customizable company branding
- Text banner with color customization
- **Image upload** (1200x225px recommended)
- Appears on all 11 screens
- Admin-only configuration

**Company Types:**
- General Contractor
- Subcontractor
- Supplier
- Consultant
- Owner

---

### 3. Project Management

**Project Creation:**
- Name, description, status
- Start date, end date (optional)
- Budget tracking (optional)
- **Location:**
  - Full address (address, city, state, zip)
  - GPS coordinates (optional)
- **Client Information:**
  - Name
  - Email (optional)
  - Phone (optional)
- Created by user with timestamp

**Project Status:**
- **Planning** - Pre-construction phase
- **Active** - Currently in progress
- **On Hold** - Temporarily paused
- **Completed** - Finished
- **Cancelled** - Abandoned

**Project Assignment:**
- Admins assign users to projects
- Users assigned with specific **User Category:**
  - Lead Project Manager ⭐
  - Contractor
  - Subcontractor
  - Inspector
  - Architect
  - Engineer
  - Worker
  - Foreman
- Assignment includes timestamp and who assigned

**Lead Project Manager:**
- Special role with **full project visibility**
- Sees ALL tasks in the project (even if not assigned)
- Can view work of all contractors/subcontractors
- Cannot be restricted from viewing any project task
- Indicated with purple star ⭐ badge

---

### 4. Task Management (Core Feature)

**Task Structure:**
- **Parent Tasks:** Main work items
- **Sub-Tasks:** Unlimited nesting levels
  - Sub-tasks can have sub-tasks
  - Track delegation chain
  - Each level has own assignee, status, progress

**Task Properties:**
- **Basic Info:**
  - Title (required)
  - Description (required)
  - Priority (Low, Medium, High, Critical)
  - Category (Safety, Electrical, Plumbing, Structural, General, Materials)
  - Due Date
- **Assignment:**
  - Assigned To (multiple users possible)
  - Assigned By (creator)
  - Original Assigned By (tracks initial creator before delegation)
- **Progress:**
  - Status (Not Started, In Progress, Rejected, Completed)
  - Completion Percentage (0-100%)
  - Visual progress bar
- **Media:**
  - Multiple photo attachments
  - Photo upload from camera or gallery
- **Location:**
  - Address (optional)
  - GPS coordinates (optional)
- **Updates:**
  - Timeline of status changes
  - Photos with each update
  - User who made update
  - Timestamp

**Task Creation:**
- Managers/Admins can create tasks
- Must select project first
- Can assign to multiple users
- Can upload initial photos
- Auto-assigned to creator's company

**Task Delegation:**
- Any assigned user can create sub-task
- Sub-task inherits project from parent
- Delegation tracked in history
- Original creator always visible

**Task Acceptance:**
- Users can accept or decline tasks
- Decline requires reason
- Declined tasks return to assigner

---

### 5. Task Inbox/Outbox System

**Inbox Paradigm:**
- **Task Inbox** (👤 person icon)
  - Tasks assigned TO me
  - Includes direct assignments
  - Includes sub-tasks assigned to me
  - Quick view of "my work"

- **Task Outbox** (👥 people icon)
  - Tasks assigned BY me to others
  - Includes tasks I created
  - Includes sub-tasks I delegated
  - Track work I'm managing

**Smart Filtering:**
- If user is assigned to parent AND sub-tasks:
  - Show only sub-tasks (avoid duplication)
- Lead PM sees everything regardless
- Project filter applies to both inbox/outbox

---

### 6. Dashboard

**Purpose:** Central hub for quick overview and navigation

**Components:**

1. **Header:**
   - Company banner (image or text)
   - Screen title "Dashboard"

2. **Project Filter Picker:**
   - Large, prominent (text-2xl)
   - "All Projects (X)" or specific project
   - Modal picker with radio selection
   - Filters entire dashboard view

3. **Task Inbox Section:**
   - Section title with count
   - 4 stat cards (horizontal scroll):
     - Not Started (gray)
     - In Progress (blue)
     - Completed (green)
     - Rejected (red)
   - Each card shows count
   - Tappable to navigate to Tasks

4. **Task Outbox Section:**
   - Only shows if user has assigned tasks
   - Section title with count
   - 4 stat cards (horizontal scroll):
     - Not Started (gray)
     - In Progress (purple)
     - Completed (green)
     - Rejected (red)

5. **Recent Tasks:**
   - Swipeable cards (350px wide)
   - Shows up to 5 recent tasks
   - Each card displays:
     - Title (text-xl bold)
     - Description (text-base)
     - Priority badge
     - Due date
     - Status badge
     - Progress bar with percentage
   - "See All" button → navigates to Tasks screen

**Empty States:**
- No tasks: Clipboard icon + message
- Clean, centered design

---

### 7. Tasks Screen (Work Screen)

**Purpose:** View and manage all tasks (inbox and outbox)

**Header:**
- Company banner
- Screen title: "Tasks v2.0-INBOX" (with version)
- Lead PM indicator (if applicable)
- Create Task button (admins/managers only)

**Search:**
- Large search bar (24px icons)
- Real-time filtering
- Searches title, description

**Tabs:**
- **Task Inbox** - Tasks assigned to me
- **Task Outbox** - Tasks I assigned

**Status Filters:**
- Horizontal scroll pills
- All / Not Started / In Progress / Rejected / Completed
- Selected state: blue background

**Task List:**
- Grouped by project
- Project headers with count
- Large task cards (padding: 24px):
  - Sub-task indicator (purple banner)
  - Title (text-xl bold)
  - Description (text-lg)
  - Priority badge (text-base)
  - Status badge (text-base)
  - Assigned user (if outbox)
  - Due date with overdue warning
  - Category
  - Progress bar (h-2.5)
  - Updates count

**Empty States:**
- Inbox: "Your task inbox is empty"
- Outbox: "Your task outbox is empty"

---

### 8. Task Detail Screen

**Purpose:** View complete task info, update progress, delegate

**Sections:**

1. **Header:**
   - Company banner
   - Title: "Task Details" or "Sub-Task Details"
   - Actions:
     - Edit (if creator)
     - Update Progress
     - Create Sub-Task (delegate)
     - Delete (if creator)

2. **Task Information:**
   - Title (large, bold)
   - Description (multi-line)
   - Priority badge
   - Category badge
   - Status badge
   - Progress slider (0-100%)
   - Due date
   - Location (if set)
   - Project name (tappable)

3. **Assignment Info:**
   - Assigned To (with avatars)
   - Assigned By
   - Created date
   - Original Assigned By (if delegated)

4. **Attachments:**
   - Photo grid
   - Tap to view full screen
   - Add photos button

5. **Updates Timeline:**
   - Reverse chronological
   - Each update shows:
     - User name + avatar
     - Timestamp
     - Status change
     - Progress change
     - Photos attached
     - Description text

6. **Sub-Tasks:**
   - List of delegated work
   - Each shows status, assignee, progress
   - Tap to view sub-task detail
   - "Create Sub-Task" button

7. **Delegation History:**
   - Shows delegation chain
   - From User → To User
   - Timestamp
   - Reason (if provided)

**Actions:**

- **Update Progress:**
  - Status dropdown
  - Progress slider
  - Add photos
  - Add description
  - Save button

- **Create Sub-Task:**
  - Inherits project from parent
  - Set title, description, priority
  - Assign to users
  - Set due date
  - Creates delegation record

- **Accept/Decline:**
  - If newly assigned
  - Decline requires reason

---

### 9. Projects Screen

**Purpose:** View and manage all projects

**Project Creation:**
- Name (required)
- Description (required)
- Status (dropdown)
- Start Date (date picker)
- End Date (optional)
- Budget (optional, number input)
- Location (address fields + GPS)
- Client Info (name, email, phone)

**Project List:**
- Search bar
- Status filter tabs
- Grouped by status
- Each project card shows:
  - Name (bold)
  - Description (truncated)
  - Status badge
  - Location
  - Start date
  - Stats (tasks, assigned users)
  - Edit/Delete actions

**Project Detail:**
- Full project information
- Assigned users list with categories
- Task list for project
- Edit button (admin/manager)

**Project Assignment:**
- Navigate from Projects → User Management
- OR from User Management select project

---

### 10. User Management (Admin Only)

**Purpose:** Manage company users and project assignments

**Access Control:**
- Admin role required
- Shows only company users
- Admin protection warnings

**Features:**

1. **User List:**
   - Search by name or email
   - Each user card shows:
     - Name + Admin badge
     - Email
     - Role + Position
     - Project assignments with categories
     - "Assign" button

2. **Assign User to Project:**
   - Select user
   - Select project (from list)
   - Select category (8 options)
   - Preview category badge
   - Assign button

3. **Remove Assignment:**
   - Tap X on assignment card
   - Confirmation modal
   - Success feedback

4. **Invite Users:**
   - Email invitation system
   - Send invite button
   - (Feature planned)

**User Categories:**
- Lead Project Manager (purple)
- Contractor (blue)
- Subcontractor (green)
- Inspector (red)
- Architect (indigo)
- Engineer (orange)
- Worker (gray)
- Foreman (yellow)

---

### 11. Admin Dashboard

**Purpose:** Company-wide overview and administration

**Access:** Admin role only

**Features:**

1. **Self-Test System:**
   - Displays operational status
   - Tests:
     - Code loaded (version check)
     - Project count verification
     - User count verification
     - Company filtering check
     - Banner existence check
   - Visual indicators (✅/❌)
   - Action required alerts

2. **Company Overview Stats:**
   - Total Projects (with active count)
   - Company Users (with assigned count)
   - Total Tasks (with completed count)
   - Task Completion percentage

3. **Project Status Breakdown:**
   - Color-coded counts
   - Active (green)
   - Planning (blue)
   - On Hold (yellow)
   - Completed (gray)
   - Cancelled (red)

4. **User Role Distribution:**
   - Admins count
   - Managers count
   - Workers count

5. **Administrative Actions:**
   - Manage Projects (quick link)
   - User Management (quick link)
   - Company Banner customization
   - Admin role notice

6. **Company Banner Modal:**
   - Preview section
   - Image upload (recommended 1200x225px)
   - OR Text banner with:
     - Text input
     - 6 color presets
     - Custom colors
   - Visibility toggle
   - Save button

---

### 12. Profile Screen

**Purpose:** User settings and account management

**Sections:**

1. **User Profile:**
   - Avatar circle with initial
   - Name
   - Email
   - Phone
   - Position
   - Role badge
   - Company name
   - Member since date

2. **Statistics:**
   - Tasks Assigned (count)
   - Projects count

3. **Settings:**
   - **Language:**
     - English (US)
     - 繁體中文 (Traditional Chinese)
     - Language picker modal
     - Reload prompt after change
   - **Notifications:** (Planned)
   - **Privacy & Security:** (Planned)

4. **Actions:**
   - Help & Support (Coming Soon)
   - About (Coming Soon)
   - Logout (with confirmation)

---

### 13. Reports Screen

**Purpose:** Analytics and insights

**Status:** Coming Soon placeholder

**Planned Features:**
- Task completion trends
- User performance metrics
- Project timeline visualization
- Budget vs. actual tracking
- Export to PDF/Excel

---

### 14. Create Task Screen

**Purpose:** Create new task with full details

**Form Fields:**

1. **Project Selection:**
   - Dropdown of user's projects
   - Required field
   - If Lead PM: shows all projects

2. **Task Details:**
   - Title (text input, required)
   - Description (multi-line, required)
   - Priority (dropdown: Low/Medium/High/Critical)
   - Category (dropdown: 6 options)
   - Due Date (date picker, required)

3. **Assignment:**
   - Contact picker (native iOS)
   - Multi-select
   - Shows users assigned to selected project

4. **Media:**
   - Photo upload section
   - Camera or gallery
   - Multiple photos allowed
   - Preview thumbnails

5. **Location (Optional):**
   - Address text input
   - GPS capture button
   - Map preview (planned)

6. **Actions:**
   - Create Task (top right)
   - Cancel (back button)
   - Success modal after creation

---

### 15. Create Project Screen

**Purpose:** Create new construction project

**Form Sections:**

1. **Basic Information:**
   - Project Name (required)
   - Description (required)
   - Status (dropdown, default: Planning)
   - Start Date (date picker, required)
   - End Date (optional)

2. **Location:**
   - Address (required)
   - City (required)
   - State (required)
   - Zip Code (required)
   - GPS Coordinates (optional)

3. **Client Information:**
   - Client Name (required)
   - Email (optional)
   - Phone (optional)

4. **Budget:**
   - Budget amount (optional, number)
   - Currency display

5. **Actions:**
   - Create Project (top right)
   - Cancel (back button)
   - Validation before submission
   - Success feedback

---

### 16. Login Screen

**Design:**
- Clean, minimal interface
- BuildTrack branding
- Welcome message

**Form:**
- Email/Phone input
- Password input
- "Forgot Password?" link (planned)
- Login button
- "Don't have an account? Register" link

**Validation:**
- Required field checks
- Email format validation
- Error messages

**Demo Accounts:**
- `admin@buildtrack.com` / `admin123` (Admin)
- `manager@buildtrack.com` / `manager123` (Manager)
- `worker@buildtrack.com` / `worker123` (Worker)

---

### 17. Register Screen

**Form:**
- Email (optional)
- Phone (required)
- Full Name (required)
- Password (required, min 6 chars)
- Confirm Password (required)
- Position/Title (required)
- Company selection/creation

**Validation:**
- Password match check
- Email format validation
- Phone format validation
- All required fields

**Flow:**
- Submit registration
- Pending approval (if company exists)
- Auto-approved if new company + first user becomes admin

---

## User Flows

### Flow 1: Admin Creates Project & Assigns Team

1. Admin logs in → Dashboard
2. Navigate to Projects screen
3. Tap "Create Project" button
4. Fill project form:
   - Name: "Downtown Office Building"
   - Description: "5-story commercial building"
   - Location: Full address
   - Client: "ABC Corp"
   - Start Date: Select from picker
5. Submit → Project created
6. Navigate to User Management
7. Search for user "John Smith"
8. Tap "Assign" on John's card
9. Select Project: "Downtown Office Building"
10. Select Category: "Contractor"
11. Tap "Assign" → Success message
12. Repeat for other team members

---

### Flow 2: Manager Creates & Assigns Task

1. Manager logs in → Dashboard
2. Navigate to Tasks screen (or tap "Create" tab)
3. Tap "+" floating button
4. Fill task form:
   - Select Project: "Downtown Office Building"
   - Title: "Install electrical panel"
   - Description: "Install 200A panel in basement"
   - Priority: "High"
   - Category: "Electrical"
   - Due Date: Tomorrow
   - Assign To: Select "David Lee" (electrician)
   - Add photos from gallery
5. Tap "Create Task"
6. Success modal appears
7. Task appears in Manager's **Task Outbox**
8. Task appears in David's **Task Inbox**

---

### Flow 3: Worker Updates Task Progress

1. Worker (David) logs in → Dashboard
2. Task Inbox shows "1" new task
3. Tap into Tasks screen
4. See "Install electrical panel" card
5. Tap card → Task Detail screen
6. Read description and requirements
7. Tap "Update Progress" button
8. Modal opens:
   - Select Status: "In Progress"
   - Set Progress: 25%
   - Add photo: Take picture of work in progress
   - Add description: "Started installation, panel mounted"
9. Tap "Save Update"
10. Update appears in timeline
11. Manager gets notification (planned)
12. Progress bar updates to 25%

---

### Flow 4: Manager Delegates Sub-Task

1. Manager views task in Task Detail
2. Realizes electrical work needs plumbing coordination
3. Taps "Create Sub-Task" button
4. Sub-task form opens:
   - Title: "Coordinate water line for panel"
   - Description: "Check if water line near panel needs relocation"
   - Assign To: "Maria Rodriguez" (plumber)
   - Due Date: Before main task
   - Priority: "Medium"
5. Tap "Create"
6. Sub-task created
7. Sub-task appears under parent task
8. Maria sees sub-task in her Task Inbox
9. Delegation tracked in history
10. Manager tracks both parent and sub-task in Outbox

---

### Flow 5: Lead PM Monitors All Project Tasks

1. Lead PM logs in → Dashboard
2. Badge shows "Lead PM - Full project visibility on 2 projects"
3. Navigate to Tasks screen
4. Tap into "Task Inbox"
5. See ALL tasks for projects where designated Lead PM
6. Includes tasks not directly assigned to them
7. Can view task details for any project task
8. Can see all sub-tasks and delegation chains
9. Filter by project using project picker
10. Monitor overall project progress

---

### Flow 6: Admin Customizes Company Banner

1. Admin logs in → Admin Dashboard
2. Tap "Company Banner" quick action
3. Modal opens showing current banner
4. Tap "Upload Banner Image"
5. Select image from gallery
6. Preview shows 1200x225 banner
7. Tap "Save Banner Settings"
8. Success message appears
9. Navigate to any screen
10. Banner image appears at top of all 11 screens
11. Consistent branding across app

---

## Technical Architecture

### Platform & Framework

**Core Technologies:**
- **Framework:** React Native 0.76.7
- **Runtime:** Expo SDK 53
- **Package Manager:** Bun
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS v3)
- **Navigation:** React Navigation v7
  - Native Stack Navigator
  - Bottom Tabs Navigator
  - Drawer Navigator (planned)

**Target Platform:**
- **Primary:** iOS 14.0+
- **Secondary:** Android 8.0+ (supported but iOS-optimized)
- **Design System:** Apple Human Interface Guidelines

---

### State Management

**Zustand with Persistence:**

All state stored in `/src/state/` folder:

1. **authStore.ts**
   - Current user
   - Authentication status
   - Login/logout actions
   - Persisted to AsyncStorage

2. **companyStore.ts**
   - Companies list
   - Company CRUD operations
   - Banner configuration
   - Persisted

3. **projectStore.ts**
   - Projects list
   - User-project assignments
   - Project filtering
   - Assignment tracking
   - Persisted

4. **taskStore.ts**
   - Tasks list (parent + sub-tasks)
   - Task CRUD operations
   - Update tracking
   - Delegation history
   - Persisted

5. **userStore.ts**
   - Users list
   - User search
   - Role management
   - Persisted

6. **invitationStore.ts**
   - Project invitations (planned)
   - Not persisted

7. **projectFilterStore.ts**
   - Currently selected project filter
   - Dashboard/Tasks screen filter state
   - Not persisted (session only)

8. **languageStore.ts**
   - Current language selection
   - Persisted

**Why Zustand:**
- Lightweight (3kb)
- Simple API
- Built-in persistence
- No boilerplate
- TypeScript support
- Selective subscriptions (prevents re-renders)

---

### Data Persistence

**Local Storage (AsyncStorage):**
- All Zustand stores auto-persist
- JSON serialization
- Automatic hydration on app start
- No backend required for MVP

**Future: Backend Integration:**
- Supabase ready (example files included)
- PostgreSQL database
- Real-time subscriptions
- Row-level security for company isolation
- See: `SUPABASE_INTEGRATION_GUIDE.md`

---

### Key Libraries

**UI Components:**
- `@expo/vector-icons` - Ionicons icon set
- `@react-native-community/slider` - Progress sliders
- `@react-native-picker/picker` - Native pickers
- `@react-native-community/datetimepicker` - Date selection

**Media:**
- `expo-image-picker` - Photo gallery and camera
- `expo-av` - Audio recording (planned)
- `react-native-reanimated` - Animations v3

**Gestures:**
- `react-native-gesture-handler` - Touch interactions
- `@gorhom/bottom-sheet` - Bottom sheets

**Utilities:**
- `date-fns` - Date formatting
- `clsx` - Conditional classNames
- `zustand` - State management

---

### File Structure

```
/home/user/workspace/
├── src/
│   ├── api/                    # API integration (planned)
│   │   ├── anthropic.ts        # Claude AI client
│   │   ├── openai.ts           # OpenAI client
│   │   ├── grok.ts             # xAI Grok client
│   │   ├── chat-service.ts     # LLM abstraction
│   │   ├── image-generation.ts # Image gen API
│   │   ├── transcribe-audio.ts # Audio transcription
│   │   └── supabase.ts         # Database client
│   │
│   ├── components/             # Reusable components
│   │   ├── CompanyBanner.tsx   # Banner component
│   │   └── ContactPicker.tsx   # User picker
│   │
│   ├── locales/                # Translations
│   │   ├── en.ts               # English
│   │   ├── zh-TW.ts            # Traditional Chinese
│   │   └── index.ts            # Export
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Navigation setup
│   │
│   ├── screens/                # 13 screens
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── CreateProjectScreen.tsx
│   │   ├── CreateTaskScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── ProjectsTasksScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   └── UserManagementScreen.tsx
│   │
│   ├── state/                  # Zustand stores
│   │   ├── authStore.ts
│   │   ├── companyStore.ts
│   │   ├── projectStore.ts
│   │   ├── taskStore.ts
│   │   ├── userStore.ts
│   │   ├── invitationStore.ts
│   │   ├── projectFilterStore.ts
│   │   └── languageStore.ts
│   │
│   ├── types/
│   │   ├── buildtrack.ts       # Core types
│   │   └── ai.ts               # AI types
│   │
│   └── utils/
│       ├── cn.ts               # ClassName helper
│       └── useTranslation.ts   # i18n hook
│
├── assets/                     # Images, fonts
├── patches/                    # Package patches
├── App.tsx                     # Entry point
├── global.css                  # Tailwind base
├── package.json                # Dependencies
└── [documentation files]       # *.md
```

---

### Navigation Structure

```
AppNavigator (Tab Navigator)
├── Home Tab
│   └── Dashboard Screen
│
├── Work Tab  
│   └── Tasks Screen
│       └── Task Detail Screen (Modal)
│
├── Create Tab
│   ├── Create Task Screen (Modal)
│   └── Create Project Screen (Modal)
│
├── Reports Tab
│   └── Reports Screen (Coming Soon)
│
└── Profile Tab
    ├── Profile Screen
    ├── Projects Screen
    │   └── Project Detail (planned)
    ├── User Management Screen (Admin only)
    └── Admin Dashboard Screen (Admin only)
```

---

## Data Models

### Core Entities

See `/src/types/buildtrack.ts` for complete TypeScript definitions.

**Summary:**

1. **Company** - Multi-tenant organization
2. **User** - Team member with role
3. **Project** - Construction project
4. **UserProjectAssignment** - User-to-project with category
5. **Task** - Work item with sub-tasks
6. **SubTask** - Recursive work delegation
7. **TaskUpdate** - Progress update with photos
8. **DelegationHistory** - Track task delegation chain
9. **ProjectInvitation** - Invite users to projects (planned)

**Key Relationships:**
- User belongs to one Company
- Projects created by Users
- Tasks belong to Projects
- Tasks assigned to multiple Users
- Sub-Tasks nest infinitely
- UserProjectAssignment links Users to Projects with Category

---

## Screen Specifications

### Design System

**Typography:**
- **Headings:**
  - Screen Title: text-lg (18px), font-semibold
  - Section Title: text-xl (20px), font-bold
  - Card Title: text-xl (20px), font-bold
  - Company Banner: text-2xl (24px), font-bold

- **Body Text:**
  - Description: text-lg (18px) or text-base (16px)
  - Labels: text-base (16px), font-medium
  - Status/Badges: text-base (16px), font-bold
  - Metadata: text-sm (14px), font-medium

- **Small Text:**
  - Timestamps: text-xs (12px)
  - Counts: text-sm (14px)

**Spacing:**
- Card padding: p-5 or p-6 (20-24px)
- Screen padding: px-6 (24px horizontal)
- Section margin: mb-4 or mb-6 (16-24px)
- Element spacing: gap-2 to gap-4 (8-16px)

**Colors:**

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary Blue | bg-blue-600 | #3b82f6 |
| Success Green | bg-green-600 | #10b981 |
| Warning Yellow | bg-yellow-600 | #f59e0b |
| Error Red | bg-red-600 | #ef4444 |
| Purple | bg-purple-600 | #7c3aed |
| Gray (Not Started) | bg-gray-600 | #6b7280 |
| Background | bg-gray-50 | #f9fafb |
| Card | bg-white | #ffffff |

**Icons:**
- Standard size: 18-24px
- Large: 64px (empty states)
- Small: 14-16px (inline)

**Progress Bars:**
- Height: h-2.5 (10px)
- Background: bg-gray-200
- Fill: bg-blue-600
- Rounded: rounded-full

---

### Responsive Design

**Target Device:** iPhone (iOS-optimized)

**Breakpoints:**
- Primary: 375px (iPhone SE)
- Optimal: 390px (iPhone 12/13/14)
- Large: 430px (iPhone 14 Pro Max)

**Adaptations:**
- Stat cards: 2 visible on screen, horizontal scroll
- Task cards: Full width, vertical scroll
- Swipeable cards: 350px fixed width
- Modals: Bottom sheet or page sheet presentation

---

### Accessibility

**Contrast:**
- WCAG AA compliant
- Text minimum 4.5:1 contrast ratio
- Interactive elements minimum 3:1

**Touch Targets:**
- Minimum 44x44 pt (iOS guideline)
- Buttons: 48px height minimum
- Spacing between tappable elements: 8px

**Typography:**
- Readable font sizes (minimum 16px for body)
- Clear hierarchy
- Sufficient line height (1.5)

**Color:**
- Not relying solely on color
- Icons + text for status
- Multiple indicators (color + text + icon)

---

## Security & Privacy

### Authentication

**Current (MVP):**
- Local authentication
- Password hashing (planned)
- Session persistence
- Auto-logout after X days (planned)

**Future:**
- OAuth 2.0 (Google, Apple Sign-In)
- Two-factor authentication (2FA)
- Biometric authentication (Face ID, Touch ID)

### Data Security

**Company Isolation:**
- All queries filtered by companyId
- Users cannot access other company data
- Server-side enforcement (when backend added)

**Role-Based Access Control (RBAC):**
- Admin: Full company access
- Manager: Project + task management
- Worker: Assigned task access only

**Data Encryption:**
- AsyncStorage not encrypted (local only)
- Future: Encrypt sensitive fields
- Backend: TLS for data in transit, encryption at rest

### Privacy

**Data Collection:**
- Minimal: Name, email, phone, position
- No analytics tracking (yet)
- No third-party data sharing

**User Rights:**
- View own data (Profile screen)
- Delete account (planned)
- Export data (planned)

---

## Multi-Language Support

### Supported Languages

1. **English (US)** - Default
2. **繁體中文 (Traditional Chinese)** - Full support

### Implementation

**Translation Files:**
- `/src/locales/en.ts` - English strings
- `/src/locales/zh-TW.ts` - Chinese strings
- Type-safe with TypeScript
- Centralized keys

**Translation Hook:**
```typescript
const t = useTranslation();
t.dashboard.taskInbox // "Task Inbox" or "任務收件匣"
```

**Language Switching:**
- Profile Screen → Language setting
- Modal picker with flags
- Reload required for full effect
- Persisted to AsyncStorage

**Coverage:**
- Navigation labels
- Screen titles
- Button text
- Status labels
- Empty states
- Error messages

**Not Translated:**
- User-generated content (task titles, descriptions)
- Company names
- Project names

---

## Future Enhancements

### Phase 2 (Next 3 Months)

1. **Backend Integration:**
   - Supabase PostgreSQL database
   - Real-time sync
   - Offline support with sync
   - Multi-device support

2. **Notifications:**
   - Push notifications (Expo Notifications)
   - Task assignment alerts
   - Status update notifications
   - Due date reminders

3. **Reports & Analytics:**
   - Task completion trends
   - User performance metrics
   - Project timeline visualization
   - Export to PDF/Excel

4. **Project Invitations:**
   - Email/SMS invitations
   - Invitation management
   - Accept/decline flow
   - Onboarding for new users

5. **Enhanced Media:**
   - Video attachments
   - Audio notes
   - Document uploads (PDF, etc.)
   - File preview

---

### Phase 3 (6-12 Months)

1. **Advanced Task Features:**
   - Task templates
   - Recurring tasks
   - Task dependencies
   - Gantt chart view
   - Critical path analysis

2. **Communication:**
   - In-app messaging
   - Task comments/discussion
   - @mentions
   - Team chat channels

3. **Time Tracking:**
   - Clock in/out
   - Time entries per task
   - Timesheet approval
   - Billing integration

4. **Safety Compliance:**
   - Safety checklists
   - Incident reporting
   - Inspection forms
   - Compliance tracking
   - Digital signatures

5. **Equipment Management:**
   - Equipment tracking
   - Maintenance schedules
   - Reservation system
   - QR code scanning

---

### Phase 4 (12+ Months)

1. **Financial Management:**
   - Budget tracking
   - Invoice generation
   - Payment tracking
   - Cost analysis
   - Profit margins

2. **Advanced Reporting:**
   - Custom report builder
   - Scheduled reports
   - Dashboard customization
   - KPI tracking

3. **Integration Ecosystem:**
   - Accounting software (QuickBooks, Xero)
   - Project management tools
   - Calendar sync
   - API for third-party integrations

4. **AI Features:**
   - AI task suggestions
   - Risk prediction
   - Schedule optimization
   - Smart notifications
   - Photo analysis (safety hazards, progress)

5. **Mobile Enhancements:**
   - Offline-first architecture
   - GPS tracking
   - Geofencing alerts
   - Barcode/QR scanning
   - AR measurement tools

---

## Appendices

### A. Glossary

**BuildTrack-Specific Terms:**

- **Task Inbox:** Tasks assigned TO the current user
- **Task Outbox:** Tasks assigned BY the current user to others
- **Lead Project Manager:** Special role with full visibility into all project tasks
- **Sub-Task:** A delegated portion of a parent task, can nest infinitely
- **User Category:** Project-specific role (Contractor, Architect, etc.)
- **Company Isolation:** Each company's data is completely separated
- **Delegation Chain:** History of who assigned tasks to whom

---

### B. Demo Data

**Included in App:**

**Companies:**
- BuildCo Construction (comp-1)
- SteelWorks Inc (comp-2)

**Users:**
- Admin: `admin@buildtrack.com` / `admin123`
- Manager: `manager@buildtrack.com` / `manager123`
- Worker: `worker@buildtrack.com` / `worker123`

**Projects:**
- Downtown Office Building (BuildCo)
- Residential Complex (BuildCo)
- Bridge Renovation (SteelWorks)
- Highway Extension (SteelWorks)

**Sample Tasks:**
- Install electrical panel
- Foundation inspection
- Roof waterproofing
- And more...

---

### C. Development Setup

**Requirements:**
- Node.js 18+
- Bun (package manager)
- Expo CLI
- iOS Simulator (Mac) or iPhone with Expo Go
- Xcode Command Line Tools (Mac)

**Getting Started:**
```bash
cd /home/user/workspace
bun install
bun run start
# or
npx expo start
```

**Hot Reload:**
```bash
./force-reload.sh
# Then shake device and tap "Reload"
```

---

### D. Known Issues & Limitations

**Current Limitations:**

1. **No Backend:** All data local, no sync between devices
2. **No Real-time:** Changes don't propagate to other users
3. **Single Device:** Data tied to device, no cloud backup
4. **Limited Offline:** App works offline but no sync queue
5. **Photo Storage:** Photos stored as URIs, not uploaded to cloud
6. **No Search History:** Search doesn't save queries
7. **No Notifications:** No push notifications for updates

**Known Issues:**

1. **Hot Reload:** Metro bundler caches aggressively, requires device shake
2. **Large Images:** May cause memory issues if many uploaded
3. **Date Picker:** iOS only, Android needs platform-specific implementation
4. **Contact Picker:** Requires manual user selection, no search within picker

**Workarounds:**
- Hot Reload: Use `./force-reload.sh` then shake device
- Large Images: App compresses to 0.9 quality
- Date Picker: Works on iOS, Android fallback planned
- Contact Picker: Pre-filter users before showing picker

---

### E. Version History

**v2.0-INBOX (October 3, 2025)**
- ✅ Renamed "Tasks Assigned to Me" → "Task Inbox"
- ✅ Renamed "Tasks I Assigned" → "Task Outbox"
- ✅ Increased all font sizes significantly
- ✅ Dashboard: Project picker enlarged (+3 sizes)
- ✅ Dashboard: Stat cards horizontal scroll (2 visible)
- ✅ Dashboard: Recent tasks swipeable cards
- ✅ Task cards: All fonts increased
- ✅ Translations: Updated English + Chinese
- ✅ Added version indicator to verify reload

**v1.5 (October 2, 2025)**
- ✅ Company banner image upload feature
- ✅ Unified header design across 11 screens
- ✅ Enhanced DashboardScreen with rejected tasks
- ✅ Hot reload system improvements

**v1.0 (Initial Release)**
- Core task management
- Multi-company support
- Project assignments
- Sub-task delegation
- Basic reporting

---

## Conclusion

BuildTrack is a **production-ready mobile construction management platform** designed for small to medium construction companies. The app provides:

✅ **Complete Task Management** - Inbox/Outbox, delegation, sub-tasks  
✅ **Multi-Company Isolation** - True multi-tenancy  
✅ **Role-Based Access** - Admin, Manager, Worker roles  
✅ **Lead PM Visibility** - Full project oversight  
✅ **Mobile-First Design** - iOS-optimized, easy to use on-site  
✅ **Multi-Language** - English + Traditional Chinese  
✅ **Offline Capable** - Works without network (local storage)  

**Next Steps:**
1. Backend integration (Supabase ready)
2. Push notifications
3. Real-time sync
4. Advanced reporting
5. Safety compliance features

---

**Document Version:** 2.0  
**Last Updated:** October 3, 2025  
**Status:** Production Ready (Local-First MVP)  
**Contact:** BuildTrack Development Team

---

*This PRD is a living document and will be updated as the product evolves.*

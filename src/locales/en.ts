// English translations
export const en = {
  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    ok: "OK",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    done: "Done",
    loading: "Loading...",
    search: "Search",
    filter: "Filter",
    all: "All",
    create: "Create",
    update: "Update",
    select: "Select",
    selected: "Selected",
    clear: "Clear",
    apply: "Apply",
    seeAll: "See All",
    total: "Total",
  },

  // Auth
  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    welcomeBack: "Welcome Back! 👋",
    logoutConfirm: "Are you sure you want to logout?",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    tasks: "Tasks",
    projects: "Projects",
    reports: "Reports",
    profile: "Profile",
    settings: "Settings",
  },

  // Dashboard
  dashboard: {
    welcomeBack: "Welcome Back! 👋",
    quickOverview: "Quick Overview",
    myTasks: "My Tasks",
    tasksAssignedToMe: "Task Inbox",
    tasksIAssigned: "Task Outbox",
    recentTasks: "Recent Tasks",
    notStarted: "Not Started",
    inProgress: "In Progress",
    completed: "Completed",
    blocked: "Blocked",
    noTasksYet: "No tasks assigned yet",
    noTasksMessage: "Tasks assigned to you will appear here",
    projectParticipation: "Project Participation",
    totalProjects: "Total Projects",
    active: "Active",
    planning: "Planning",
    viewing: "Viewing",
    allProjects: "All Projects",
    selectProject: "Select Project",
    viewTasks: "View tasks from all your projects",
    yourProjects: "Your Projects",
  },

  // Tasks
  tasks: {
    tasks: "Tasks",
    myTasks: "My Tasks",
    assignedTasks: "Assigned Tasks",
    createTask: "Create Task",
    createNewTask: "Create New Task",
    taskDetails: "Task Details",
    title: "Title",
    description: "Description",
    priority: "Priority",
    category: "Category",
    dueDate: "Due Date",
    assignTo: "Assign To",
    assignedTo: "Assigned To",
    assignedBy: "Assigned By",
    status: "Status",
    progress: "Progress",
    attachments: "Attachments",
    noTasks: "No tasks yet",
    noTasksMessage: "You haven't been assigned any tasks yet",
    searchTasks: "Search tasks...",
    taskCreated: "Task Created",
    taskCreatedMessage: "Task has been created successfully and assigned to the selected users.",
    
    // Priority levels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Status
    notStarted: "Not Started",
    inProgress: "In Progress",
    completed: "Completed",
    blocked: "Blocked",
    
    // Categories
    general: "General",
    safety: "Safety",
    electrical: "Electrical",
    plumbing: "Plumbing",
    structural: "Structural",
    materials: "Materials",
  },

  // Projects
  projects: {
    projects: "Projects",
    createProject: "Create Project",
    projectDetails: "Project Details",
    noProjects: "No projects yet",
    noProjectsMessage: "You haven't been assigned to any projects yet",
    searchProjects: "Search projects...",
    active: "Active",
    planning: "Planning",
    onHold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  },

  // Profile
  profile: {
    profile: "Profile",
    editProfile: "Edit Profile",
    settings: "Settings",
    language: "Language",
    notifications: "Notifications",
    privacySecurity: "Privacy & Security",
    helpSupport: "Help & Support",
    about: "About",
    logout: "Logout",
    memberSince: "Member Since",
    tasksAssigned: "Tasks Assigned",
    selectLanguage: "Select Language",
    english: "English",
    traditionalChinese: "繁體中文",
    englishUS: "English (United States)",
    languageChanged: "Language Changed",
    languageChangedMessage: "The app needs to reload to apply the new language. Reload now?",
    reloadNow: "Reload Now",
    later: "Later",
    pleaseRestart: "Please Restart",
    pleaseRestartMessage: "Please close and reopen the app to see the new language.",
  },

  // Common phrases
  phrases: {
    task: "task",
    tasks: "tasks",
    project: "project",
    projects: "projects",
    user: "user",
    users: "users",
    comingSoon: "Coming Soon",
    comingSoonMessage: "This feature will be available in a future update.",
  },

  // Validation
  validation: {
    required: "This field is required",
    emailInvalid: "Please enter a valid email",
    passwordTooShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
  },
};

export type TranslationKeys = typeof en;

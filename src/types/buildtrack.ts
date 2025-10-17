export type UserRole = "admin" | "manager" | "worker";

export type CompanyType = "general_contractor" | "subcontractor" | "supplier" | "consultant" | "owner";

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export type Priority = "low" | "medium" | "high" | "critical";

export type TaskStatus = "not_started" | "in_progress" | "blocked" | "completed";

export type TaskCategory = "safety" | "electrical" | "plumbing" | "structural" | "general" | "materials";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";

export type UserCategory = "lead_project_manager" | "contractor" | "subcontractor" | "inspector" | "architect" | "engineer" | "worker" | "foreman";

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  taxId?: string; // Tax ID or business registration number
  licenseNumber?: string;
  insuranceExpiry?: string;
  banner?: {
    text: string;
    backgroundColor: string;
    textColor: string;
    isVisible: boolean;
    imageUri?: string; // Custom uploaded banner image (overrides text/colors when set)
  };
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  invitedBy: string; // User ID who sent the invitation
  invitedByCompanyId: string; // Company of the inviter
  inviteeEmail?: string; // Either email or phone must be provided
  inviteePhone?: string;
  inviteeUserId?: string; // Set after user accepts (if they already have an account)
  status: InvitationStatus;
  proposedCategory: UserCategory; // Suggested role for the project
  message?: string; // Optional message to invitee
  createdAt: string;
  expiresAt: string; // Invitations expire after X days
  respondedAt?: string;
  declineReason?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  clientInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  createdBy: string;
  companyId?: string; // Company that owns this project
  createdAt: string;
  updatedAt: string;
}

export interface UserProjectAssignment {
  userId: string;
  projectId: string;
  category: UserCategory;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email?: string; // Optional - can use phone as username
  name: string;
  role: UserRole;
  companyId: string; // Required - must belong to a company
  position: string; // Job position/title (required)
  phone: string; // Required - primary identifier
  createdAt: string;
  // Project assignments will be handled separately in UserProjectAssignment
}

export interface TaskUpdate {
  id: string;
  description: string;
  photos: string[];
  completionPercentage: number;
  status: TaskStatus;
  timestamp: string;
  userId: string;
}

export interface DelegationHistory {
  id: string;
  fromUserId: string;
  toUserId: string;
  timestamp: string;
  reason?: string;
}

export interface SubTask {
  id: string;
  parentTaskId: string;
  projectId: string; // Same project as parent
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  category: TaskCategory; // Add category
  attachments: string[]; // Add attachments
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  assignedTo: string[];
  assignedBy: string;
  createdAt: string;
  updates: TaskUpdate[]; // Add updates
  currentStatus: TaskStatus;
  completionPercentage: number;
  accepted?: boolean;
  declineReason?: string;
  subTasks?: SubTask[]; // Recursive nesting
  delegationHistory?: DelegationHistory[]; // Track delegation chain
  originalAssignedBy?: string; // Original task creator (before any delegations)
}

export interface Task {
  id: string;
  projectId: string; // Tasks now belong to projects
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  category: TaskCategory;
  attachments: string[];
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  assignedTo: string[];
  assignedBy: string;
  createdAt: string;
  updates: TaskUpdate[];
  currentStatus: TaskStatus;
  completionPercentage: number;
  accepted?: boolean;
  declineReason?: string;
  subTasks?: SubTask[]; // Add subtasks array
  delegationHistory?: DelegationHistory[]; // Track delegation chain
  originalAssignedBy?: string; // Original task creator (before any delegations)
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  assignmentNotifications: boolean;
  updateNotifications: boolean;
  deadlineReminders: boolean;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  offlineMode: boolean;
  autoSync: boolean;
}

export interface TaskReadStatus {
  userId: string;
  taskId: string;
  isRead: boolean;
  readAt?: string;
}
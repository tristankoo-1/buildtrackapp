import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Project, UserProjectAssignment, ProjectStatus, UserCategory } from "../types/buildtrack";

// Mock projects data
const MOCK_PROJECTS: Project[] = [
  // BuildTrack Construction Inc. projects (comp-1)
  {
    id: "proj-1",
    name: "Downtown Office Complex",
    description: "Modern 15-story office building with retail space on ground floor",
    status: "active",
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 2500000,
    location: {
      address: "123 Main Street",
      city: "Downtown",
      state: "CA",
      zipCode: "90210",
    },
    clientInfo: {
      name: "Metro Development Corp",
      email: "contact@metrodev.com",
      phone: "555-0123",
    },
    createdBy: "3", // Alex Administrator (comp-1)
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-2", 
    name: "Residential Housing Development",
    description: "50-unit housing development with community amenities",
    status: "active",
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 1800000,
    location: {
      address: "456 Oak Avenue",
      city: "Riverside",
      state: "CA", 
      zipCode: "92501",
    },
    clientInfo: {
      name: "Family Homes LLC",
      email: "info@familyhomes.com",
      phone: "555-0456",
    },
    createdBy: "3", // Alex Administrator (comp-1)
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Elite Electric Co. projects (comp-2)
  {
    id: "proj-3",
    name: "Industrial Warehouse Electrical",
    description: "Complete electrical system installation for 100,000 sq ft warehouse",
    status: "active",
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 450000,
    location: {
      address: "789 Industrial Blvd",
      city: "Commerce",
      state: "CA",
      zipCode: "90040",
    },
    clientInfo: {
      name: "Warehouse Logistics Inc",
      email: "projects@warehouselogistics.com",
      phone: "555-0789",
    },
    createdBy: "5", // Mike Johnson (comp-2)
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-4",
    name: "Shopping Mall Power Upgrade",
    description: "Upgrade main power distribution and install backup generators",
    status: "planning",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 680000,
    location: {
      address: "321 Shopping Center Dr",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210",
    },
    clientInfo: {
      name: "Luxury Mall Properties",
      email: "maintenance@luxurymall.com",
      phone: "555-0321",
    },
    createdBy: "5", // Mike Johnson (comp-2)
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock user project assignments
const MOCK_USER_ASSIGNMENTS: UserProjectAssignment[] = [
  {
    userId: "1", // John Manager
    projectId: "proj-1",
    category: "lead_project_manager",
    assignedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: "3",
    isActive: true,
  },
  {
    userId: "2", // Sarah Worker
    projectId: "proj-1", 
    category: "contractor",
    assignedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: "3",
    isActive: true,
  },
  {
    userId: "6", // Dennis
    projectId: "proj-1",
    category: "worker",
    assignedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: "3",
    isActive: true,
  },
  {
    userId: "1", // John Manager
    projectId: "proj-2",
    category: "lead_project_manager", 
    assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: "3",
    isActive: true,
  },
  {
    userId: "6", // Dennis
    projectId: "proj-2",
    category: "foreman",
    assignedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: "3",
    isActive: true,
  },
  {
    userId: "4", // Lisa Martinez (Elite Electric worker)
    projectId: "proj-3",
    category: "worker",
    assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), 
    assignedBy: "5",
    isActive: true,
  },
];

interface ProjectStore {
  projects: Project[];
  userAssignments: UserProjectAssignment[];
  isLoading: boolean;
  
  // Project management
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByUser: (userId: string) => Project[];
  getAllProjects: () => Project[];
  
  // User assignments
  assignUserToProject: (userId: string, projectId: string, category: UserCategory, assignedBy: string) => void;
  removeUserFromProject: (userId: string, projectId: string) => void;
  updateUserProjectCategory: (userId: string, projectId: string, category: UserCategory) => void;
  getUserProjectAssignments: (userId: string) => UserProjectAssignment[];
  getProjectUserAssignments: (projectId: string) => UserProjectAssignment[];
  
  // Lead Project Manager utilities
  getUserLeadProjects: (userId: string) => Project[]; // Get projects where user is Lead PM
  isUserLeadPMForProject: (userId: string, projectId: string) => boolean; // Check if user is Lead PM
  getLeadPMForProject: (projectId: string) => string | undefined; // Get Lead PM user ID for a project
  
  // Admin utilities
  getProjectStats: (projectId: string) => {
    totalUsers: number;
    usersByCategory: Record<UserCategory, number>;
    isActive: boolean;
  };
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: MOCK_PROJECTS,
      userAssignments: MOCK_USER_ASSIGNMENTS,
      isLoading: false,

      createProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: `proj-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject]
        }));
        
        return newProject.id;
      },

      updateProject: (id, updates) => {
        set(state => ({
          projects: state.projects.map(project => 
            project.id === id 
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          )
        }));
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(project => project.id !== id),
          userAssignments: state.userAssignments.filter(assignment => assignment.projectId !== id)
        }));
      },

      getProjectById: (id) => {
        const { projects } = get();
        return projects.find(project => project.id === id);
      },

      getProjectsByUser: (userId) => {
        const { projects, userAssignments } = get();
        const userProjectIds = userAssignments
          .filter(assignment => assignment.userId === userId && assignment.isActive)
          .map(assignment => assignment.projectId);
        
        return projects.filter(project => userProjectIds.includes(project.id));
      },

      getAllProjects: () => {
        const { projects } = get();
        return projects;
      },

      assignUserToProject: (userId, projectId, category, assignedBy) => {
        // Remove existing assignment if any
        set(state => ({
          userAssignments: state.userAssignments.filter(
            assignment => !(assignment.userId === userId && assignment.projectId === projectId)
          )
        }));
        
        // Add new assignment
        const newAssignment: UserProjectAssignment = {
          userId,
          projectId,
          category,
          assignedAt: new Date().toISOString(),
          assignedBy,
          isActive: true,
        };
        
        set(state => ({
          userAssignments: [...state.userAssignments, newAssignment]
        }));
      },

      removeUserFromProject: (userId, projectId) => {
        set(state => ({
          userAssignments: state.userAssignments.map(assignment =>
            assignment.userId === userId && assignment.projectId === projectId
              ? { ...assignment, isActive: false }
              : assignment
          )
        }));
      },

      updateUserProjectCategory: (userId, projectId, category) => {
        set(state => ({
          userAssignments: state.userAssignments.map(assignment =>
            assignment.userId === userId && assignment.projectId === projectId
              ? { ...assignment, category }
              : assignment
          )
        }));
      },

      getUserProjectAssignments: (userId) => {
        const { userAssignments } = get();
        return userAssignments.filter(assignment => 
          assignment.userId === userId && assignment.isActive
        );
      },

      getProjectUserAssignments: (projectId) => {
        const { userAssignments } = get();
        return userAssignments.filter(assignment => 
          assignment.projectId === projectId && assignment.isActive
        );
      },

      // Lead Project Manager utilities
      getUserLeadProjects: (userId) => {
        const { userAssignments, projects } = get();
        // Get all projects where user is assigned as Lead PM
        const leadProjectIds = userAssignments
          .filter(a => a.userId === userId && a.category === "lead_project_manager" && a.isActive)
          .map(a => a.projectId);
        
        return projects.filter(p => leadProjectIds.includes(p.id));
      },

      isUserLeadPMForProject: (userId, projectId) => {
        const { userAssignments } = get();
        return userAssignments.some(
          a => a.userId === userId && 
               a.projectId === projectId && 
               a.category === "lead_project_manager" && 
               a.isActive
        );
      },

      getLeadPMForProject: (projectId) => {
        const { userAssignments } = get();
        const leadPM = userAssignments.find(
          a => a.projectId === projectId && 
               a.category === "lead_project_manager" && 
               a.isActive
        );
        return leadPM?.userId;
      },

      getProjectStats: (projectId) => {
        const { userAssignments } = get();
        const projectAssignments = userAssignments.filter(
          assignment => assignment.projectId === projectId && assignment.isActive
        );
        
        const usersByCategory = projectAssignments.reduce((acc, assignment) => {
          acc[assignment.category] = (acc[assignment.category] || 0) + 1;
          return acc;
        }, {} as Record<UserCategory, number>);

        return {
          totalUsers: projectAssignments.length,
          usersByCategory,
          isActive: projectAssignments.length > 0,
        };
      },
    }),
    {
      name: "buildtrack-projects-FRESH-2025", // Force complete cache invalidation
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        userAssignments: state.userAssignments,
      }),
    }
  )
);
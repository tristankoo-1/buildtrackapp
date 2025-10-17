import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "../types/buildtrack";
import { MOCK_USERS } from "./mockData";

interface UserStore {
  users: User[];
  isLoading: boolean;
  
  // User management
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  getUsersByCompany: (companyId: string) => User[]; // NEW: Filter by company
  searchUsers: (query: string) => User[];
  searchUsersByCompany: (query: string, companyId: string) => User[]; // NEW: Search within company
  
  // Admin validation helpers
  getAdminCountByCompany: (companyId: string) => number;
  canDeleteUser: (userId: string) => { canDelete: boolean; reason?: string };
  canChangeUserRole: (userId: string, newRole: UserRole) => { canChange: boolean; reason?: string };
  
  // For future backend integration
  createUser: (userData: Omit<User, "id" | "createdAt">) => Promise<string>;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: MOCK_USERS,
      isLoading: false,

      getAllUsers: () => {
        const { users } = get();
        return users;
      },

  getUserById: (id) => {
    const { users } = get();
    return users.find(user => user.id === id);
  },

  getUsersByRole: (role) => {
    const { users } = get();
    return users.filter(user => user.role === role);
  },

  getUsersByCompany: (companyId) => {
    const { users } = get();
    return users.filter(user => user.companyId === companyId);
  },

  searchUsers: (query) => {
    const { users } = get();
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.phone.includes(query) ||
      (user.email && user.email.toLowerCase().includes(lowercaseQuery))
    );
  },

  searchUsersByCompany: (query, companyId) => {
    const { users } = get();
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.companyId === companyId &&
      (user.name.toLowerCase().includes(lowercaseQuery) ||
       user.phone.includes(query) ||
       (user.email && user.email.toLowerCase().includes(lowercaseQuery)))
    );
  },

  getAdminCountByCompany: (companyId) => {
    const { users } = get();
    return users.filter(user => user.companyId === companyId && user.role === "admin").length;
  },

  canDeleteUser: (userId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { canDelete: false, reason: "User not found" };
    }
    
    if (user.role === "admin") {
      const adminCount = get().getAdminCountByCompany(user.companyId);
      if (adminCount <= 1) {
        return { 
          canDelete: false, 
          reason: "Cannot delete the last admin of the company. Please assign another admin first." 
        };
      }
    }
    
    return { canDelete: true };
  },

  canChangeUserRole: (userId, newRole) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { canChange: false, reason: "User not found" };
    }
    
    // If changing FROM admin TO another role
    if (user.role === "admin" && newRole !== "admin") {
      const adminCount = get().getAdminCountByCompany(user.companyId);
      if (adminCount <= 1) {
        return { 
          canChange: false, 
          reason: "Cannot change role of the last admin. Please assign another admin first." 
        };
      }
    }
    
    return { canChange: true };
  },

  createUser: async (userData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({
      users: [...state.users, newUser],
      isLoading: false,
    }));
    
    return newUser.id;
  },

  updateUser: async (id, updates) => {
    set({ isLoading: true });
    
    // Check if role is being changed
    if (updates.role) {
      const validation = get().canChangeUserRole(id, updates.role);
      if (!validation.canChange) {
        set({ isLoading: false });
        throw new Error(validation.reason || "Cannot change user role");
      }
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      users: state.users.map(user => 
        user.id === id ? { ...user, ...updates } : user
      ),
      isLoading: false,
    }));
    
    return true;
  },

  deleteUser: async (id) => {
    set({ isLoading: true });
    
    // Validate deletion
    const validation = get().canDeleteUser(id);
    if (!validation.canDelete) {
      set({ isLoading: false });
      throw new Error(validation.reason || "Cannot delete user");
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      users: state.users.filter(user => user.id !== id),
      isLoading: false,
    }));
    
    return true;
  },
}),
    {
      name: "buildtrack-users-FRESH-2025", // Force complete cache invalidation
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        users: state.users,
      }),
    }
  )
);
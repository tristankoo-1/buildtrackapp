import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, User, UserRole } from "../types/buildtrack";
import { useUserStore } from "./userStore";

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<boolean>; // username can be email or phone
  logout: () => void;
  register: (data: {
    name: string;
    phone: string;
    companyId: string;
    position: string;
    email?: string;
    password: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get users from userStore
        const allUsers = useUserStore.getState().getAllUsers();
        
        // Find user by email or phone
        const user = allUsers.find((u: User) => 
          (u.email && u.email.toLowerCase() === username.toLowerCase()) ||
          u.phone === username
        );
        
        if (user && password.length >= 6) {
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      register: async (data) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate required fields
        if (!data.name || !data.phone || !data.companyId || !data.position) {
          set({ isLoading: false });
          return { success: false, error: "All fields are required" };
        }

        if (data.password.length < 6) {
          set({ isLoading: false });
          return { success: false, error: "Password must be at least 6 characters" };
        }
        
        // Get users from userStore
        const allUsers = useUserStore.getState().getAllUsers();
        
        // Check if phone already exists
        const existingUser = allUsers.find((u: User) => u.phone === data.phone);
        
        if (existingUser) {
          set({ isLoading: false });
          return { success: false, error: "Phone number already registered" };
        }

        // Check if email already exists (if provided)
        if (data.email) {
          const existingEmail = allUsers.find((u: User) => u.email && u.email.toLowerCase() === data.email!.toLowerCase());
          if (existingEmail) {
            set({ isLoading: false });
            return { success: false, error: "Email already registered" };
          }
        }
        
        const newUser: User = {
          id: Date.now().toString(),
          name: data.name,
          phone: data.phone,
          companyId: data.companyId,
          position: data.position,
          email: data.email,
          role: data.role || "worker", // Default to worker
          createdAt: new Date().toISOString(),
        };
        
        // Add user to userStore (pass without id and createdAt as they'll be generated)
        const userId = await useUserStore.getState().createUser({
          name: data.name,
          phone: data.phone,
          companyId: data.companyId,
          position: data.position,
          email: data.email,
          role: data.role || "worker",
        });
        
        // Get the created user from store
        const createdUser = useUserStore.getState().getUserById(userId);
        
        set({ 
          user: createdUser || newUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return { success: true };
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: "buildtrack-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../api/supabase";
import { Company, CompanyType } from "../types/buildtrack";

// Mock companies for development
const MOCK_COMPANIES: Company[] = [
  {
    id: "comp-1",
    name: "BuildTrack Construction Inc.",
    type: "general_contractor",
    description: "Leading general contractor specializing in commercial projects",
    address: "123 Builder Street, Construction City, CA 90210",
    phone: "555-0100",
    email: "contact@buildtrack.com",
    website: "https://buildtrack.com",
    licenseNumber: "GC-123456",
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "BuildTrack Construction Inc.",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      isVisible: true,
    },
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "3", // Admin
    isActive: true,
  },
  {
    id: "comp-2",
    name: "Elite Electric Co.",
    type: "subcontractor",
    description: "Professional electrical contracting services",
    address: "456 Voltage Ave, Electric City, CA 90211",
    phone: "555-0200",
    email: "info@eliteelectric.com",
    licenseNumber: "EC-789012",
    insuranceExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "Elite Electric Co.",
      backgroundColor: "#f59e0b",
      textColor: "#ffffff",
      isVisible: true,
    },
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "3",
    isActive: true,
  },
  {
    id: "comp-3",
    name: "Metro Plumbing Services",
    type: "subcontractor",
    description: "Full-service plumbing contractor",
    address: "789 Pipeline Rd, Water City, CA 90212",
    phone: "555-0300",
    email: "contact@metroplumbing.com",
    licenseNumber: "PC-345678",
    insuranceExpiry: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString(),
    banner: {
      text: "Metro Plumbing Services",
      backgroundColor: "#0ea5e9",
      textColor: "#ffffff",
      isVisible: true,
    },
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "3",
    isActive: true,
  },
];

interface CompanyStore {
  companies: Company[];
  isLoading: boolean;
  error: string | null;

  // Fetching
  fetchCompanies: () => Promise<void>;
  fetchCompanyById: (id: string) => Promise<Company | null>;
  
  // Getters (local state)
  getAllCompanies: () => Company[];
  getCompanyById: (id: string) => Company | undefined;
  getCompaniesByType: (type: CompanyType) => Company[];
  getActiveCompanies: () => Company[];
  
  // Mutations
  createCompany: (company: Omit<Company, "id" | "createdAt">) => Promise<string>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  
  // Banner management
  updateCompanyBanner: (companyId: string, banner: Company['banner']) => Promise<void>;
  getCompanyBanner: (companyId: string) => Company['banner'] | undefined;

  // User-company relationships
  getUsersByCompany: (companyId: string, users: any[]) => any[];
  getCompanyStats: (companyId: string, users: any[]) => {
    totalUsers: number;
    usersByRole: Record<string, number>;
    isActive: boolean;
  };
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companies: [], // No mock data fallback - Supabase only
      isLoading: false,
      error: null,

      // FETCH from Supabase
      fetchCompanies: async () => {
        if (!supabase) {
          console.error('Supabase not configured, no data available');
          set({ companies: [], isLoading: false, error: 'Supabase not configured' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('is_active', true)
            .order('name');

          if (error) throw error;

          set({ 
            companies: data || [], 
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error fetching companies:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
        }
      },

      fetchCompanyById: async (id: string) => {
        if (!supabase) {
          return get().getCompanyById(id) || null;
        }

        try {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          return data;
        } catch (error: any) {
          console.error('Error fetching company:', error);
          return null;
        }
      },

      // LOCAL getters (work with cached data)
      getAllCompanies: () => {
        return get().companies;
      },

      getCompanyById: (id) => {
        return get().companies.find(company => company.id === id);
      },

      getCompaniesByType: (type) => {
        return get().companies.filter(company => company.type === type);
      },

      getActiveCompanies: () => {
        return get().companies.filter(company => company.isActive);
      },

      // CREATE company in Supabase
      createCompany: async (companyData) => {
        if (!supabase) {
          // Fallback to local creation
          const newCompany: Company = {
            ...companyData,
            id: `comp-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };

          set(state => ({
            companies: [...state.companies, newCompany]
          }));

          return newCompany.id;
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('companies')
            .insert({
              ...companyData,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          // Update local state
          set(state => ({
            companies: [...state.companies, data],
            isLoading: false,
          }));

          return data.id;
        } catch (error: any) {
          console.error('Error creating company:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
          throw error;
        }
      },

      // UPDATE company in Supabase
      updateCompany: async (id, updates) => {
        if (!supabase) {
          // Fallback to local update
          set(state => ({
            companies: state.companies.map(company =>
              company.id === id
                ? { ...company, ...updates }
                : company
            )
          }));
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('companies')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          // Update local state
          set(state => ({
            companies: state.companies.map(company =>
              company.id === id 
                ? { ...company, ...updates } 
                : company
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Error updating company:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
          throw error;
        }
      },

      updateCompanyBanner: async (companyId, banner) => {
        await get().updateCompany(companyId, { banner });
      },

      getCompanyBanner: (companyId) => {
        const company = get().getCompanyById(companyId);
        return company?.banner;
      },

      // DELETE (soft delete)
      deleteCompany: async (id) => {
        await get().updateCompany(id, { isActive: false });
      },

      getUsersByCompany: (companyId, users) => {
        return users.filter(user => user.companyId === companyId);
      },

      getCompanyStats: (companyId, users) => {
        const companyUsers = users.filter(user => user.companyId === companyId);
        const company = get().companies.find(c => c.id === companyId);

        const usersByRole = companyUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          totalUsers: companyUsers.length,
          usersByRole,
          isActive: company?.isActive || false,
        };
      },
    }),
    {
      name: "buildtrack-companies",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist companies, not loading/error states
        companies: state.companies,
      }),
    }
  )
);
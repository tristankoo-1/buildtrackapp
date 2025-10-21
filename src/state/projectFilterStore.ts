import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProjectFilterState {
  selectedProjectId: string | null; // Now persists the last selected project
  sectionFilter: "my_tasks" | "inbox" | "outbox" | null;
  statusFilter: "not_started" | "in_progress" | "completed" | "rejected" | null;
  setSelectedProject: (projectId: string | null) => void;
  setSectionFilter: (section: "my_tasks" | "inbox" | "outbox") => void;
  setStatusFilter: (status: "not_started" | "in_progress" | "completed" | "rejected") => void;
  clearSectionFilter: () => void;
  clearStatusFilter: () => void;
}

export const useProjectFilterStore = create<ProjectFilterState>()(
  persist(
    (set) => ({
      selectedProjectId: null, // Will be set on first load to first available project
      sectionFilter: null,
      statusFilter: null,
      
      setSelectedProject: (projectId: string | null) => {
        set({ selectedProjectId: projectId });
      },
      
      setSectionFilter: (section: "my_tasks" | "inbox" | "outbox" | null) => {
        set({ sectionFilter: section });
      },
      
      setStatusFilter: (status: "not_started" | "in_progress" | "completed" | "rejected" | null) => {
        set({ statusFilter: status });
      },
      
      clearSectionFilter: () => {
        set({ sectionFilter: null });
      },
      
      clearStatusFilter: () => {
        set({ statusFilter: null });
      },
    }),
    {
      name: "buildtrack-project-filter",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

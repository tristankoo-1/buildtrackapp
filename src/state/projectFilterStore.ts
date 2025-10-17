import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProjectFilterState {
  selectedProjectId: string | null; // null means "All Projects"
  setSelectedProject: (projectId: string | null) => void;
  clearFilter: () => void;
}

export const useProjectFilterStore = create<ProjectFilterState>()(
  persist(
    (set) => ({
      selectedProjectId: null, // Default to "All Projects"
      
      setSelectedProject: (projectId: string | null) => {
        set({ selectedProjectId: projectId });
      },
      
      clearFilter: () => {
        set({ selectedProjectId: null });
      },
    }),
    {
      name: "buildtrack-project-filter",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

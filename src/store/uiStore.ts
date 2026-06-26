import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  activeSidebarItem: string | null;
  openModals: string[];
  theme: "light" | "dark" | "system";

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveSidebarItem: (v: string | null) => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  activeSidebarItem: null,
  openModals: [],
  theme: "system",

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setActiveSidebarItem: (v) => set({ activeSidebarItem: v }),
  openModal: (id) => set((s) => ({ openModals: [...s.openModals, id] })),
  closeModal: (id) => set((s) => ({ openModals: s.openModals.filter((m) => m !== id) })),
  isModalOpen: (id) => get().openModals.includes(id),
  setTheme: (theme) => set({ theme }),
}));

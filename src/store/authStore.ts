import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Permission } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];

  setUser: (user: User) => void;
  setPermissions: (perms: Permission[]) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      permissions: [],

      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      setPermissions: (permissions) => set({ permissions }),
      logout: () => set({ user: null, isAuthenticated: false, permissions: [], isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

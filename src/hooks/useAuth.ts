"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api/client";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const token = auth.getAccessToken();
      if (token && !user) {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data);
        } catch {
          logout();
        }
      }
    };
    init();
  }, [user, setUser, logout]);

  return { user, isAuthenticated, isLoading };
}

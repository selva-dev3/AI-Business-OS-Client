"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api/client";
import { LoginCredentials, User } from "@/types/auth";

/* ------------------------------------------------------------------ */
/*  Helper: map any raw user payload to the store's User shape         */
/* ------------------------------------------------------------------ */
function mapUser(raw: any): User {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    avatar: raw.avatar,
    companyId: raw.companyId,
    role: typeof raw.role === "string" ? raw.role : raw.role?.name || "user",
    permissions: (raw.permissions || []).map((p: any) => ({
      module: p.module,
      action: p.action,
      scope: p.scope,
    })),
  };
}

/* ================================================================== */
/*  useAuth – Zustand store is the source of truth                     */
/* ================================================================== */
export function useAuth() {
  const queryClient = useQueryClient();
  const storeUser = useAuthStore((s) => s.user);
  const storeIsAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeIsLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const storeLogout = useAuthStore((s) => s.logout);

  // Background query to validate / refresh the session
  const { isLoading: isFetchLoading } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = auth.getAccessToken();
      if (!token) {
        // No token → not logged in, but don't wipe store yet
        // (store hydration from localStorage may not have happened)
        return null;
      }
      try {
        const response = await api.get("/auth/me");
        const rawUser = response.data?.data || response.data;
        const mapped = mapUser(rawUser);
        setUser(mapped);
        return mapped;
      } catch (err: any) {
        // Only log out on a definitive 401 (token invalid/expired)
        if (err?.response?.status === 401) {
          auth.clearTokens();
          storeLogout();
        }
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    // Don't run the query if there's no token at all
    enabled: typeof window !== "undefined" && !!auth.getAccessToken(),
  });

  // Once the background fetch settles, mark loading as done
  useEffect(() => {
    if (!isFetchLoading && storeIsLoading) {
      setLoading(false);
    }
  }, [isFetchLoading, storeIsLoading, setLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      // API wraps response as { success, data: { accessToken, refreshToken, user } }
      return response.data?.data || response.data;
    },
    onSuccess: (data: any) => {
      const { accessToken, refreshToken, user: rawUser } = data;
      auth.setTokens(accessToken, refreshToken);
      const mapped = mapUser(rawUser);
      setUser(mapped);
      queryClient.setQueryData(["auth", "me"], mapped);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout").catch(() => {});
    },
    onSuccess: () => {
      auth.clearTokens();
      storeLogout();
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  return {
    user: storeUser,
    isAuthenticated: storeIsAuthenticated,
    isLoading: storeIsLoading || loginMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error
      ? (loginMutation.error as any).response?.data?.message || "Invalid credentials"
      : null,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}

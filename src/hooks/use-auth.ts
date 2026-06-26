"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/auth";
import { authApi } from "@/hooks/queries/auth/auth.api";
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
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const storeLogout = useAuthStore((s) => s.logout);

  // Background query to validate / refresh the session
  useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = auth.getAccessToken();
      if (!token) return null;
      try {
        // authApi.me() already unwraps { success, data } via apiGet
        const rawUser = await authApi.me();
        const mapped = mapUser(rawUser);
        setUser(mapped);
        return mapped;
      } catch (err: any) {
        // Only log out on a definitive 401
        if (err?.response?.status === 401) {
          auth.clearTokens();
          storeLogout();
        }
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: hasHydrated && typeof window !== "undefined" && !!auth.getAccessToken(),
  });

  // Login mutation — uses authApi which already unwraps the response
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await authApi.login(credentials);
      return result;
    },
    onSuccess: (data) => {
      // data is already unwrapped: { accessToken, refreshToken, user }
      auth.setTokens(data.tokens!.accessToken, data.tokens!.refreshToken);
      const mapped = mapUser(data.user);
      setUser(mapped);
      queryClient.setQueryData(["auth", "me"], mapped);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = auth.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => { });
      }
    },
    onSuccess: () => {
      auth.clearTokens();
      storeLogout();
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  const isLoading = !hasHydrated || storeIsLoading || loginMutation.isPending || logoutMutation.isPending;

  return {
    user: storeUser,
    isAuthenticated: storeIsAuthenticated,
    isLoading,
    error: loginMutation.error
      ? (loginMutation.error as any).response?.data?.message || "Invalid credentials"
      : null,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}

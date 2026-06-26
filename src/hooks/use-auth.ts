"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api/client";
import { LoginCredentials, User } from "@/types/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const { setUser, logout: storeLogout } = useAuthStore();

  // Fetch current user details via TanStack Query
  const {
    data: user,
    isLoading: isFetchLoading,
  } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = auth.getAccessToken();
      if (!token) return null;
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        return data;
      } catch (err) {
        auth.clearTokens();
        storeLogout();
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, user: userData } = data;
      auth.setTokens(accessToken, refreshToken);
      setUser(userData);
      queryClient.setQueryData(["auth", "me"], userData);
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
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isFetchLoading || loginMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error ? (loginMutation.error as any).response?.data?.message || "Invalid credentials" : null,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}

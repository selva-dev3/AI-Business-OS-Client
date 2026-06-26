"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api/client";
import { LoginCredentials } from "@/types/auth";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout, setLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = auth.getAccessToken();
      if (token && !user) {
        try {
          setLoading(true);
          const { data } = await api.get("/auth/me");
          setUser(data);
        } catch (err) {
          storeLogout();
        } finally {
          setLoading(false);
        }
      } else if (!token) {
        setLoading(false);
      }
    };
    initAuth();
  }, [user, setUser, storeLogout, setLoading]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const { accessToken, refreshToken, user: userData } = response.data;
      auth.setTokens(accessToken, refreshToken);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const message = err.response?.data?.message || "Invalid credentials";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      auth.clearTokens();
      storeLogout();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}

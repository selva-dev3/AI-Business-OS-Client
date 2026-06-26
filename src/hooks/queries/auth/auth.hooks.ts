import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { authKeys } from "./auth.keys";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/auth";
import {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  TwoFactorVerifyData,
} from "./auth.types";

export function useAuthMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginCredentials) => authApi.login(data),
    onSuccess: (data) => {
      auth.setTokens(data.tokens!.accessToken, data.tokens!.refreshToken);
      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        avatar: data.user.avatar,
        companyId: data.user.companyId,
        role: data.user.role.name,
        permissions: data.user.permissions.map((p) => ({
          module: p.module,
          action: p.action as any,
          scope: p.scope as any,
        })),
      });
      qc.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (refreshToken: string) => authApi.refresh(refreshToken),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => {
      const token = auth.getRefreshToken();
      if (!token) return Promise.resolve({ message: "Logged out" });
      return authApi.logout(token);
    },
    onSettled: () => {
      auth.clearTokens();
      logout();
      qc.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
  });
}

export function useEnable2FA() {
  return useMutation({
    mutationFn: () => authApi.enable2FA(),
  });
}

export function useVerify2FA() {
  return useMutation({
    mutationFn: (data: TwoFactorVerifyData) => authApi.verify2FA(data),
  });
}

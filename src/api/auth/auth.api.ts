import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/client";
import { buildQueryString } from "@/api/utils";
import {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  TwoFactorSetupResponse,
  TwoFactorVerifyData,
  AuthTokens,
  UserAuthResponse,
  LogoutData,
} from "./auth.types";

const BASE = "/auth";

export const authApi = {
  register: (data: RegisterData) => apiPost<{ message: string }>(`${BASE}/register`, data),

  login: (data: LoginCredentials) => apiPost<UserAuthResponse>(`${BASE}/login`, data),

  refresh: (refreshToken: string) =>
    apiPost<AuthTokens>(`${BASE}/refresh`, { refreshToken }),

  logout: (refreshToken: string) =>
    apiPost<{ message: string }>(`${BASE}/logout`, { refreshToken } as LogoutData),

  forgotPassword: (data: ForgotPasswordData) =>
    apiPost<{ message: string }>(`${BASE}/forgot-password`, data),

  resetPassword: (data: ResetPasswordData) =>
    apiPost<{ message: string }>(`${BASE}/reset-password`, data),

  me: () => apiGet<UserAuthResponse["user"]>>(`${BASE}/me`),

  changePassword: (data: ChangePasswordData) =>
    apiPost<{ message: string }>(`${BASE}/change-password`, data),

  enable2FA: () => apiPost<TwoFactorSetupResponse>(`${BASE}/enable-2fa`),

  verify2FA: (data: TwoFactorVerifyData) =>
    apiPost<{ message: string }>(`${BASE}/verify-2fa`, data),
} as const;

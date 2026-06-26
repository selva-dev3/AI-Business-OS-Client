export type PermissionAction = "create" | "read" | "update" | "delete" | "export" | "approve";
export type PermissionScope = "own" | "department" | "company";

export type Permission = {
  module: string;
  action: PermissionAction;
  scope: PermissionScope;
};

export type Role = {
  id: string;
  name: string;
  permissions: Permission[];
  isSystem: boolean;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  permissions: Permission[];
  departmentId?: string;
  companyId: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};
export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type TwoFactorVerifyData = {
  code: string;
  rememberMe?: boolean;
};

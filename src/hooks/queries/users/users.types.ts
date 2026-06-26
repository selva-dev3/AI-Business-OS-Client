import { ListParams } from "@/hooks/queries/client";

export type UserRole = {
  id: string;
  name: string;
};

export type UserEmployee = {
  id: string;
  employeeCode: string;
  department?: { name: string };
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  role: UserRole;
  employee?: UserEmployee;
  createdAt: string;
};

export type UserListResponse = {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type UserPermission = {
  module: string;
  action: string;
  scope: string;
};

export type UserDetailResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  role: {
    id: string;
    name: string;
    permissions: UserPermission[];
  };
  employee?: {
    id: string;
    employeeCode: string;
    department: { name: string };
  };
  createdAt: string;
};

export type InviteUserData = {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
};

export type UpdateRoleData = {
  roleId: string;
};

export type ResetPasswordData = {
  newPassword: string;
  sendEmail: boolean;
};

export type UpdateMeData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type UploadAvatarResponse = {
  avatarUrl: string;
};

export type UserSearchParams = ListParams & {
  roleId?: string;
  isActive?: boolean;
};

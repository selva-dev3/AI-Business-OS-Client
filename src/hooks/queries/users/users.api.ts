import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import { ListParams } from "@/hooks/queries/client";
import {
  User,
  UserListResponse,
  UserDetailResponse,
  InviteUserData,
  UpdateUserData,
  UpdateRoleData,
  ResetPasswordData,
  UploadAvatarResponse,
  UpdateMeData,
  UserSearchParams,
} from "./users.types";

const BASE = "/users";

export const usersApi = {
  getAll: (params?: UserSearchParams) =>
    apiGet<UserListResponse>(`${BASE}${buildQueryString(params ?? {})}`),

  invite: (data: InviteUserData) => apiPost<{ id: string; email: string; message: string }>(`${BASE}/invite`, data),

  getById: (id: string) => apiGet<UserDetailResponse>(`${BASE}/${id}`),

  update: (id: string, data: UpdateUserData) => apiPatch<User>(`${BASE}/${id}`, data),

  delete: (id: string) => apiDelete<{ message: string }>(`${BASE}/${id}`),

  updateRole: (id: string, data: UpdateRoleData) => apiPatch<{ id: string; role: { id: string; name: string } }>(`${BASE}/${id}/role`, data),

  resetPassword: (id: string, data: ResetPasswordData) =>
    apiPost<{ message: string }>(`${BASE}/${id}/reset-password`, data),

  updateMe: (data: UpdateMeData) => apiPatch<User>(`${BASE}/me`, data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<UploadAvatarResponse>(`${BASE}/me/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
} as const;

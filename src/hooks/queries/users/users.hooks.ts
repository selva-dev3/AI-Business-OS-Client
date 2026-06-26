import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "./users.api";
import { usersKeys } from "./users.keys";
import {
  InviteUserData,
  UpdateUserData,
  UpdateRoleData,
  ResetPasswordData,
  UpdateMeData,
  UserSearchParams,
} from "./users.types";

export function useUsers(params?: UserSearchParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getAll(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserData) => usersApi.invite(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserData) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.detail(id) });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useUpdateUserRole(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRoleData) => usersApi.updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.detail(id) });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useResetUserPassword(id: string) {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => usersApi.resetPassword(id, data),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMeData) => usersApi.updateMe(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.me() }),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.me() }),
  });
}

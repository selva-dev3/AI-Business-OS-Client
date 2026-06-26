import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "./company.api";
import { companyKeys } from "./company.keys";
import {
  UpdateCompanyData,
  UpdateCompanySettingsData,
  CreateBranchData,
  UpdateBranchData,
} from "./company.types";

export function useCompany() {
  return useQuery({
    queryKey: companyKeys.detail(),
    queryFn: () => companyApi.get(),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCompanyData) => companyApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.all }),
  });
}

export function useUploadCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => companyApi.uploadLogo(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.all }),
  });
}

export function useCompanySettings() {
  return useQuery({
    queryKey: companyKeys.settings(),
    queryFn: () => companyApi.getSettings(),
  });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCompanySettingsData) => companyApi.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.settings() }),
  });
}

export function useBranches() {
  return useQuery({
    queryKey: companyKeys.branches(),
    queryFn: () => companyApi.getBranches(),
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchData) => companyApi.createBranch(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.branches() }),
  });
}

export function useUpdateBranch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBranchData) => companyApi.updateBranch(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.branches() }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyApi.deleteBranch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.branches() }),
  });
}

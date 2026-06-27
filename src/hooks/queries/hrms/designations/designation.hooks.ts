import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designationApi } from "./designation.api";
import { designationKeys } from "./designation.keys";
import {
  DesignationFilters,
  CreateDesignationData,
  UpdateDesignationData,
  BulkActionData,
  StatusChangeData,
} from "./designation.types";
import { handleApiError } from "../../utils";

export function useDesignations(params?: DesignationFilters) {
  return useQuery({
    queryKey: designationKeys.list(params),
    queryFn: () => designationApi.getAll(params),
  });
}

export function useDesignationSelect() {
  return useQuery({
    queryKey: designationKeys.select(),
    queryFn: () => designationApi.getAllUnpaginated(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDesignation(id: string) {
  return useQuery({
    queryKey: designationKeys.detail(id),
    queryFn: () => designationApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDesignationData) => designationApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
    onError: (error: unknown) => {
      throw handleApiError(error);
    },
  });
}

export function useUpdateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDesignationData }) =>
      designationApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: designationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
    onError: (error: unknown) => {
      throw handleApiError(error);
    },
  });
}

export function useDeleteDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      designationApi.delete(id, force),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
    onError: (error: unknown) => {
      throw handleApiError(error);
    },
  });
}

export function useRestoreDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
  });
}

export function useBulkDeleteDesignations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkActionData) => designationApi.bulkDelete(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
    onError: (error: unknown) => {
      throw handleApiError(error);
    },
  });
}

export function useBulkRestoreDesignations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkActionData) => designationApi.bulkRestore(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
  });
}

export function useChangeDesignationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StatusChangeData }) =>
      designationApi.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: designationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: designationKeys.all });
    },
    onError: (error: unknown) => {
      throw handleApiError(error);
    },
  });
}

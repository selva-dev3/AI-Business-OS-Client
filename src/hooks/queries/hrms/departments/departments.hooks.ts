import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "./departments.api";
import { departmentsKeys } from "./departments.keys";
import { CreateDepartmentData, UpdateDepartmentData } from "./departments.types";

export function useDepartments() {
  return useQuery({
    queryKey: departmentsKeys.list(),
    queryFn: () => departmentsApi.getAll(),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentData) => departmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: departmentsKeys.all });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentData }) =>
      departmentsApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: departmentsKeys.all });
      qc.invalidateQueries({ queryKey: departmentsKeys.detail(variables.id) });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: departmentsKeys.all });
    },
  });
}

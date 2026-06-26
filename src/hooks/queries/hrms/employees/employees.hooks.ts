import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "./employees.api";
import { employeesKeys } from "./employees.keys";
import {
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeSearchParams,
} from "./employees.types";

export function useEmployees(params?: EmployeeSearchParams) {
  return useQuery({
    queryKey: employeesKeys.list(params),
    queryFn: () => employeesApi.getAll(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeesKeys.detail(id),
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeData) => employeesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesKeys.all }),
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeData) => employeesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesKeys.all }),
  });
}

export function useActivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.activate(id),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(data?.data?._id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useBulkImportEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => employeesApi.bulkImport(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesKeys.all }),
  });
}

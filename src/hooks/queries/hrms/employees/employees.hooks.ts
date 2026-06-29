import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "./employees.api";
import { employeesKeys } from "./employees.keys";
import {
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeSearchParams,
  SuspendEmployeeData,
  ReinstateEmployeeData,
  TerminateEmployeeData,
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
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useActivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.activate(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useSuspendEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SuspendEmployeeData }) => employeesApi.suspend(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useReinstateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReinstateEmployeeData }) => employeesApi.reinstate(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useTerminateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TerminateEmployeeData }) => employeesApi.terminate(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: employeesKeys.all });
    },
  });
}

export function useDeleteEmployeePermanent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.deletePermanent(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: employeesKeys.detail(id) });
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

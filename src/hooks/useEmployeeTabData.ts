import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "@/hooks/queries/hrms/employees/employees.api";
import { employeesKeys } from "@/hooks/queries/hrms/employees/employees.keys";

// ─── EMPLOYEE PROFILE ────────────────────────────────────────────────────────

export function useEmployeeProfile(id: string) {
  return useQuery({
    queryKey: employeesKeys.detail(id),
    queryFn: () => employeesApi.getById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

export function useAttendance(
  id: string,
  filters: {
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean
) {
  return useQuery({
    queryKey: ["attendance", id, filters],
    queryFn: () => employeesApi.getAttendance(id, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!id && enabled,
  });
}

// ─── LEAVES ──────────────────────────────────────────────────────────────────

export function useLeaves(
  id: string,
  filters: {
    status?: string;
    leaveType?: string;
    year?: number;
    page?: number;
    limit?: number;
  },
  enabled: boolean
) {
  return useQuery({
    queryKey: ["leaves", id, filters],
    queryFn: () => employeesApi.getLeaves(id, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!id && enabled,
  });
}

// ─── PAYROLL ─────────────────────────────────────────────────────────────────

export function usePayroll(
  id: string,
  filters: {
    year?: number;
    month?: number;
    status?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean
) {
  return useQuery({
    queryKey: ["payroll", id, filters],
    queryFn: () => employeesApi.getPayroll(id, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!id && enabled,
  });
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export function useDocuments(
  id: string,
  filters: { type?: string; page?: number; limit?: number } = {},
  enabled: boolean
) {
  return useQuery({
    queryKey: ["documents", id, filters],
    queryFn: () => employeesApi.getDocuments(id, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!id && enabled,
  });
}

// ─── NOTES ───────────────────────────────────────────────────────────────────

export function useNotes(
  id: string,
  filters: { category?: string; page?: number; limit?: number } = {},
  enabled: boolean
) {
  return useQuery({
    queryKey: ["notes", id, filters],
    queryFn: () => employeesApi.getNotes(id, filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!id && enabled,
  });
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────

export function useHistory(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["employee-history", id],
    queryFn: () => employeesApi.getHistory(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id && enabled,
  });
}

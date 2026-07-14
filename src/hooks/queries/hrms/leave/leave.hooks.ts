import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApi } from "./leave.api";
import { leaveKeys } from "./leave.keys";
import {
  LeaveSearchParams,
  CreateLeaveRequestData,
  CreateLeaveTypeData,
  UpdateLeaveTypeData,
  UpdateLeaveRequestData,
  ApproveRejectRequestData,
  CreateHolidayData,
  UpdateHolidayData,
} from "./leave.types";

export function useLeaveTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: leaveKeys.leaveTypes(),
    queryFn: () => leaveApi.getLeaveTypes(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLeaveType(id: string) {
  return useQuery({
    queryKey: leaveKeys.leaveType(id),
    queryFn: () => leaveApi.getLeaveType(id),
    enabled: !!id,
  });
}

export function useCreateLeaveType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveTypeData) => leaveApi.createLeaveType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.leaveTypes() });
    },
  });
}

export function useUpdateLeaveType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveTypeData }) =>
      leaveApi.updateLeaveType(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: leaveKeys.leaveTypes() });
      qc.invalidateQueries({ queryKey: leaveKeys.leaveType(id) });
    },
  });
}

export function useDeleteLeaveType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.deleteLeaveType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.leaveTypes() });
    },
  });
}

export function useLeaveRequests(params?: LeaveSearchParams) {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: () => leaveApi.getAll(params),
  });
}

export function useLeaveBalances(employeeId?: string) {
  return useQuery({
    queryKey: leaveKeys.balance(employeeId),
    queryFn: () => leaveApi.getBalances(employeeId),
  });
}

export function useLeaveCalendar(params?: { start?: string; end?: string; departmentId?: string }) {
  return useQuery({
    queryKey: leaveKeys.calendar(params),
    queryFn: () => leaveApi.getCalendar(params),
  });
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveRequestData) => leaveApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveRejectRequestData }) =>
      leaveApi.approve(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveRejectRequestData }) =>
      leaveApi.reject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: leaveKeys.leaveRequest(id),
    queryFn: () => leaveApi.getLeaveRequest(id),
    enabled: !!id,
  });
}

export function useUpdateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveRequestData }) =>
      leaveApi.updateLeaveRequest(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
      qc.invalidateQueries({ queryKey: leaveKeys.leaveRequest(id) });
    },
  });
}

export function useDeleteLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.deleteLeaveRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

// ─── HOLIDAYS ────────────────────────────────────────────────────────────────

export function useHolidays(params?: { year?: string; type?: string }) {
  return useQuery({
    queryKey: leaveKeys.holidays(params),
    queryFn: () => leaveApi.getHolidays(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHoliday(id: string) {
  return useQuery({
    queryKey: leaveKeys.holiday(id),
    queryFn: () => leaveApi.getHoliday(id),
    enabled: !!id,
  });
}

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHolidayData) => leaveApi.createHoliday(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useUpdateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHolidayData }) =>
      leaveApi.updateHoliday(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
      qc.invalidateQueries({ queryKey: leaveKeys.holiday(id) });
    },
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.deleteHoliday(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}


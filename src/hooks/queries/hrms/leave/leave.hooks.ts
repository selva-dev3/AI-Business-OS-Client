import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApi } from "./leave.api";
import { leaveKeys } from "./leave.keys";
import {
  LeaveSearchParams,
  CreateLeaveRequestData,
  ApproveRejectRequestData,
} from "./leave.types";

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.leaveTypes(),
    queryFn: () => leaveApi.getLeaveTypes(),
    staleTime: 5 * 60 * 1000,
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

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

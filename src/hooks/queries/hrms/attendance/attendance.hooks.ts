import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "./attendance.api";
import { attendanceKeys } from "./attendance.keys";
import {
  AttendanceSearchParams,
  AttendanceReportParams,
  BulkAttendanceRequest,
  CheckInRequest,
  CheckOutRequest,
  CreateRegularizationPayload,
  ApproveRejectRegularizationPayload,
  UpdateAttendanceRequest,
} from "./attendance.types";

export function useAttendanceList(params?: AttendanceSearchParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.getAll(params),
  });
}

export function useAttendanceSummary(params?: { date?: string }) {
  return useQuery({
    queryKey: attendanceKeys.summary(params),
    queryFn: () => attendanceApi.getSummary(params),
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data?: CheckInRequest) => attendanceApi.checkIn(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data?: CheckOutRequest) => attendanceApi.checkOut(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useUpdateAttendance(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAttendanceRequest) => attendanceApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      employeeId: string;
      date: string;
      status: string;
      checkIn?: string | null;
      checkOut?: string | null;
      notes?: string | null;
    }) => attendanceApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useAttendanceDetails(id: string) {
  return useQuery({
    queryKey: ["attendance", "details", id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id,
  });
}

// ─── BULK ATTENDANCE ─────────────────────────────────────────────────────────

export function useBulkCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAttendanceRequest) => attendanceApi.bulkCreate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

// ─── REGULARIZATION ──────────────────────────────────────────────────────────

export function useCreateRegularization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRegularizationPayload) => attendanceApi.createRegularization(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useApproveRejectRegularization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveRejectRegularizationPayload }) =>
      attendanceApi.approveRejectRegularization(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

// ─── ATTENDANCE REPORTS ──────────────────────────────────────────────────────

export function useAttendanceReport(params?: AttendanceReportParams) {
  return useQuery({
    queryKey: attendanceKeys.report(params),
    queryFn: () => attendanceApi.getAttendanceReport(params),
  });
}

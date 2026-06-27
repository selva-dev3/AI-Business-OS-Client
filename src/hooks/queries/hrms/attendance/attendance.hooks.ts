import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "./attendance.api";
import { attendanceKeys } from "./attendance.keys";
import {
  AttendanceSearchParams,
  CheckInRequest,
  CheckOutRequest,
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

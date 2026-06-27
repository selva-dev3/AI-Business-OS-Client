import { apiGet, apiPost, apiPatch } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  AttendanceRecord,
  AttendanceListResponse,
  AttendanceSummary,
  AttendanceSearchParams,
  CheckInRequest,
  CheckOutRequest,
  UpdateAttendanceRequest,
} from "./attendance.types";

const BASE = "/hrms/attendance";

export const attendanceApi = {
  getAll: (params?: AttendanceSearchParams) =>
    apiGet<AttendanceListResponse>(`${BASE}${buildQueryString(params ?? {})}`),

  getSummary: (params?: { date?: string }) =>
    apiGet<AttendanceSummary>(`${BASE}/summary${buildQueryString(params ?? {})}`),

  checkIn: (data?: CheckInRequest) =>
    apiPost<AttendanceRecord>(`${BASE}/check-in`, data),

  checkOut: (data?: CheckOutRequest) =>
    apiPost<AttendanceRecord>(`${BASE}/check-out`, data),

  update: (id: string, data: UpdateAttendanceRequest) =>
    apiPatch<AttendanceRecord>(`${BASE}/${id}`, data),
} as const;

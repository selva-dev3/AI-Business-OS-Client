import { apiGet, apiPost, apiPatch, apiClient } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  AttendanceRecord,
  AttendanceListResponse,
  AttendanceSummary,
  AttendanceSearchParams,
  AttendanceReportItem,
  AttendanceReportParams,
  BulkAttendanceRequest,
  BulkAttendanceResult,
  CheckInRequest,
  CheckOutRequest,
  CreateRegularizationPayload,
  RegularizationRecord,
  ApproveRejectRegularizationPayload,
  UpdateAttendanceRequest,
  RegularizationListResponse,
  RegularizationSearchParams,
} from "./attendance.types";

const BASE = "/hrms/attendance";

export const attendanceApi = {
  getAll: (params?: AttendanceSearchParams) =>
    apiGet<AttendanceListResponse>(`${BASE}${buildQueryString(params ?? {})}`),

  getSummary: (params?: { date?: string }) =>
    apiGet<AttendanceSummary>(`${BASE}/summary${buildQueryString(params ?? {})}`),

  checkIn: (data?: CheckInRequest) =>
    apiPost<AttendanceRecord>(`${BASE}/checkin`, data),

  checkOut: (data?: CheckOutRequest) =>
    apiPost<AttendanceRecord>(`${BASE}/checkout`, data),

  create: (data: {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string | null;
    checkOut?: string | null;
    notes?: string | null;
  }) =>
    apiPost<AttendanceRecord>(BASE, data),

  update: (id: string, data: UpdateAttendanceRequest) =>
    apiPatch<AttendanceRecord>(`${BASE}/${id}`, data),

  getById: (id: string) =>
    apiGet<AttendanceRecord>(`${BASE}/${id}`),

  // ─── BULK ────────────────────────────────────────────────────────────────
  bulkCreate: (data: BulkAttendanceRequest) =>
    apiPost<BulkAttendanceResult>(`${BASE}/bulk`, data),

  // ─── REGULARIZATION ──────────────────────────────────────────────────────
  createRegularization: (data: CreateRegularizationPayload) =>
    apiPost<RegularizationRecord>(`${BASE}/regularize`, data),

  approveRejectRegularization: (id: string, data: ApproveRejectRegularizationPayload) =>
    apiPatch<RegularizationRecord>(`${BASE}/regularize/${id}`, data),

  listRegularizations: (params?: RegularizationSearchParams) =>
    apiGet<RegularizationListResponse>(`${BASE}/regularization${buildQueryString(params ?? {})}`),

  getRegularizationById: (id: string) =>
    apiGet<RegularizationRecord>(`${BASE}/regularization/${id}`),

  // ─── REPORTS ─────────────────────────────────────────────────────────────
  getAttendanceReport: (params?: AttendanceReportParams) =>
    apiGet<AttendanceReportItem[]>(`/hrms/reports/attendance${buildQueryString(params ?? {})}`),

  // ─── EXPORT ──────────────────────────────────────────────────────────────
  exportAttendance: (params?: { fromDate?: string; toDate?: string; employeeId?: string }) =>
    apiClient.get<Blob>(`${BASE}/export${buildQueryString(params ?? {})}`, { responseType: "blob" }),
} as const;

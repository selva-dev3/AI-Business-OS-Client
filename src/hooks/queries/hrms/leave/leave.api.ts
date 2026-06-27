import { apiGet, apiPost, apiPatch } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  LeaveRequest,
  LeaveListResponse,
  LeaveBalance,
  LeaveCalendarEvent,
  LeaveSearchParams,
  CreateLeaveRequestData,
  ApproveRejectRequestData,
} from "./leave.types";

const BASE_REQUESTS = "/hrms/leave-requests";
const BASE_BALANCE = "/hrms/leave-balance";
const BASE_CALENDAR = "/hrms/leave-calendar";

export const leaveApi = {
  getAll: (params?: LeaveSearchParams) =>
    apiGet<LeaveListResponse>(`${BASE_REQUESTS}${buildQueryString(params ?? {})}`),

  getBalances: (employeeId?: string) =>
    apiGet<LeaveBalance[]>(`${BASE_BALANCE}${employeeId ? `?employeeId=${employeeId}` : ""}`),

  getCalendar: (params?: { start?: string; end?: string; departmentId?: string }) =>
    apiGet<LeaveCalendarEvent[]>(`${BASE_CALENDAR}${buildQueryString(params ?? {})}`),

  create: (data: CreateLeaveRequestData) =>
    apiPost<LeaveRequest>(BASE_REQUESTS, data),

  approve: (id: string, data?: ApproveRejectRequestData) =>
    apiPost<LeaveRequest>(`${BASE_REQUESTS}/${id}/approve`, data),

  reject: (id: string, data?: ApproveRejectRequestData) =>
    apiPost<LeaveRequest>(`${BASE_REQUESTS}/${id}/reject`, data),

  cancel: (id: string) =>
    apiPost<LeaveRequest>(`${BASE_REQUESTS}/${id}/cancel`),
} as const;

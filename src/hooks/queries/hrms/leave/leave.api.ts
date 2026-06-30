import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  LeaveRequest,
  LeaveListResponse,
  LeaveBalance,
  LeaveCalendarEvent,
  LeaveTypeOption,
  LeaveTypeDetail,
  LeaveSearchParams,
  CreateLeaveRequestData,
  CreateLeaveTypeData,
  UpdateLeaveTypeData,
  UpdateLeaveRequestData,
  ApproveRejectRequestData,
} from "./leave.types";
import { Employee, EmployeeListResponse } from "@/hooks/queries/hrms/employees/employees.types";

const BASE_REQUESTS = "/hrms/leave-requests";
const BASE_BALANCE = "/hrms/leave-balance";
const BASE_CALENDAR = "/hrms/leave-calendar";
const BASE_LEAVE_TYPES = "/hrms/leave-types";

/* ────────────────────────────────────────────────────────
 *  Server → Client field normalizer
 *
 *  Server returns:
 *    employeeId: { _id, firstName, lastName, employeeCode }  (populated)
 *    leaveTypeId: { _id, name, code }                        (populated)
 *    fromDate / toDate (Date)
 *    days (number)
 *    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"  (uppercase)
 *    approvedBy: { _id, email }  (populated)
 *    rejectedBy: { _id, email }  (populated)
 *
 *  Client expects:
 *    employee: { id, firstName, lastName }
 *    leaveType: string (lowercase)
 *    startDate / endDate
 *    totalDays
 *    status: lowercase
 * ──────────────────────────────────────────────────────── */
function normalizeLeaveRequest(raw: any): LeaveRequest {
  const emp = raw.employeeId && typeof raw.employeeId === "object" ? raw.employeeId : null;
  const lt = raw.leaveTypeId && typeof raw.leaveTypeId === "object" ? raw.leaveTypeId : null;
  const approver = raw.approvedBy && typeof raw.approvedBy === "object" ? raw.approvedBy : null;

  return {
    id: raw.id || raw._id,
    employeeId: emp?._id || emp?.id || raw.employeeId,
    employee: emp
      ? {
          id: emp._id || emp.id,
          firstName: emp.firstName || "",
          lastName: emp.lastName || "",
          email: emp.email || "",
          designation: emp.designation || "",
          departmentId: emp.departmentId || "",
        }
      : undefined,
    leaveType: lt?.name?.toLowerCase() || raw.leaveType || "annual",
    startDate: raw.fromDate || raw.startDate,
    endDate: raw.toDate || raw.endDate,
    totalDays: raw.days ?? raw.totalDays ?? 0,
    reason: raw.reason || "",
    status: (raw.status || "pending").toLowerCase(),
    approvedBy: approver?.email || raw.approvedBy || undefined,
    approvedByUser: approver
      ? { firstName: approver.email?.split("@")[0] || "", lastName: "" }
      : raw.approvedByUser,
    managerNotes: raw.comments || raw.managerNotes || undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/** Build server-compatible query params from client search params */
function buildServerParams(params?: LeaveSearchParams): Record<string, unknown> {
  if (!params) return {};
  const serverParams: Record<string, unknown> = {};

  // status → uppercase for server
  if (params.status) serverParams.status = params.status.toUpperCase();
  // leaveTypeId for server filter
  if (params.leaveTypeId) serverParams.leaveTypeId = params.leaveTypeId;
  // employee filter
  if (params.employeeId) serverParams.employeeId = params.employeeId;
  // date range
  if (params.fromDate) serverParams.fromDate = params.fromDate;
  if (params.toDate) serverParams.toDate = params.toDate;
  // pagination
  if (params.page) serverParams.page = params.page;
  if (params.limit) serverParams.limit = params.limit;

  return serverParams;
}

export const leaveApi = {
  getLeaveTypes: () =>
    apiGet<LeaveTypeOption[]>(BASE_LEAVE_TYPES),

  getLeaveType: (id: string) =>
    apiGet<LeaveTypeDetail>(`${BASE_LEAVE_TYPES}/${id}`),

  getEmployees: () =>
    apiGet<EmployeeListResponse>("/hrms/employees"),

  createLeaveType: (data: CreateLeaveTypeData) =>
    apiPost<LeaveTypeOption>(BASE_LEAVE_TYPES, data),

  updateLeaveType: (id: string, data: UpdateLeaveTypeData) =>
    apiPatch<LeaveTypeDetail>(`${BASE_LEAVE_TYPES}/${id}`, data),

  deleteLeaveType: (id: string) =>
    apiDelete<{ message: string }>(`${BASE_LEAVE_TYPES}/${id}`),

  getAll: async (params?: LeaveSearchParams): Promise<LeaveListResponse> => {
    const serverParams = buildServerParams(params);
    const raw = await apiGet<any>(`${BASE_REQUESTS}${buildQueryString(serverParams)}`);

    // Server returns { data: [...], meta: {...} } via ApiResponse.paginated
    const rawList = Array.isArray(raw) ? raw : raw?.data || [];
    const meta = raw?.meta || { total: rawList.length, page: 1, limit: 20, totalPages: 1 };

    return {
      data: rawList.map(normalizeLeaveRequest),
      meta,
    };
  },

  getBalances: (employeeId?: string) =>
    apiGet<LeaveBalance[]>(`${BASE_BALANCE}${employeeId ? `?employeeId=${employeeId}` : ""}`),

  getCalendar: (params?: { start?: string; end?: string; departmentId?: string }) =>
    apiGet<LeaveCalendarEvent[]>(`${BASE_CALENDAR}${buildQueryString(params ?? {})}`),

  getLeaveRequest: (id: string) =>
    apiGet<LeaveRequest>(`${BASE_REQUESTS}/${id}`),

  create: (data: CreateLeaveRequestData) =>
    apiPost<LeaveRequest>(BASE_REQUESTS, data),

  updateLeaveRequest: (id: string, data: UpdateLeaveRequestData) =>
    apiPatch<LeaveRequest>(`${BASE_REQUESTS}/${id}`, data),

  deleteLeaveRequest: (id: string) =>
    apiDelete<{ message: string }>(`${BASE_REQUESTS}/${id}`),

  approve: (id: string, data?: ApproveRejectRequestData) =>
    apiPost<LeaveRequest>(`${BASE_REQUESTS}/${id}/approve`, data),

  reject: (id: string, data?: ApproveRejectRequestData) =>
    apiPost<LeaveRequest>(`${BASE_REQUESTS}/${id}/reject`, data),

  cancel: (id: string) =>
    apiPost<LeaveRequest>(`${BASE_REQUESTS}/${id}/cancel`),
} as const;

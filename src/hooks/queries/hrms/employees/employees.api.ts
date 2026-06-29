import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  Employee,
  EmployeeListResponse,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeSearchParams,
  BulkImportResponse,
  SuspendEmployeeData,
  ReinstateEmployeeData,
  TerminateEmployeeData,
  AttendanceResponse,
  LeaveResponse,
  PayrollResponse,
  EmployeeDocumentItem,
  EmployeeNoteItem,
  AssignRoleData,
  ResetPasswordData,
  ResetPasswordResponse,
  CreateDocumentData,
  CreateNoteData,
  UpdateNoteData,
  InitiateLeaveData,
  EmployeeHistoryItem,
} from "./employees.types";

const BASE = "/hrms/employees";

export const employeesApi = {
  getAll: (params?: EmployeeSearchParams) =>
    apiGet<EmployeeListResponse>(`${BASE}${buildQueryString(params ?? {})}`),

  create: (data: CreateEmployeeData) => apiPost<Employee>(BASE, data),

  getById: (id: string) => apiGet<Employee>(`${BASE}/${id}`),

  update: (id: string, data: UpdateEmployeeData) => apiPatch<Employee>(`${BASE}/${id}`, data),

  delete: (id: string) => apiDelete<{ message: string }>(`${BASE}/${id}`),

  deletePermanent: (id: string) => apiDelete<{ message: string }>(`${BASE}/${id}/permanent`),

  activate: (id: string) => apiPost<{ message: string }>(`${BASE}/${id}/activate`),

  suspend: (id: string, data: SuspendEmployeeData) => apiPatch<Employee>(`${BASE}/${id}/suspend`, data),

  reinstate: (id: string, data: ReinstateEmployeeData) => apiPatch<Employee>(`${BASE}/${id}/reinstate`, data),

  terminate: (id: string, data: TerminateEmployeeData) => apiPatch<{ message: string }>(`${BASE}/${id}/terminate`, data),

  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<BulkImportResponse>(`${BASE}/bulk-import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: (params?: { format?: string; status?: string; departmentId?: string; designationId?: string }) =>
    apiGet<any[]>(`${BASE}/export${buildQueryString(params ?? {})}`),

  // ─── TAB ENDPOINTS ──────────────────────────────────────────────────────────

  getAttendance: (id: string, params?: { month?: number; year?: number; status?: string; page?: number; limit?: number }) =>
    apiGet<AttendanceResponse>(`${BASE}/${id}/attendance${buildQueryString(params ?? {})}`),

  getLeaves: (id: string, params?: { status?: string; leaveType?: string; year?: number; page?: number; limit?: number }) =>
    apiGet<LeaveResponse>(`${BASE}/${id}/leaves${buildQueryString(params ?? {})}`),

  getPayroll: (id: string, params?: { year?: number; month?: number; status?: string; page?: number; limit?: number }) =>
    apiGet<PayrollResponse>(`${BASE}/${id}/payroll${buildQueryString(params ?? {})}`),

  initiateLeave: (id: string, data: InitiateLeaveData) =>
    apiPatch<{ employee: Employee; leaveRequest: any }>(`${BASE}/${id}/on-leave`, data),

  getHistory: (id: string) => apiGet<EmployeeHistoryItem[]>(`${BASE}/${id}/history`),

  assignRole: (id: string, data: AssignRoleData) => apiPatch<Employee>(`${BASE}/${id}/assign-role`, data),

  resetPassword: (id: string, data: ResetPasswordData) => apiPost<ResetPasswordResponse>(`${BASE}/${id}/reset-password`, data),

  getDocuments: (id: string, params?: { type?: string; page?: number; limit?: number }) =>
    apiGet<{ records: EmployeeDocumentItem[]; meta: any }>(`${BASE}/${id}/documents${buildQueryString(params ?? {})}`),

  createDocument: (id: string, data: CreateDocumentData) => apiPost<EmployeeDocumentItem>(`${BASE}/${id}/documents`, data),

  getNotes: (id: string, params?: { category?: string; page?: number; limit?: number }) =>
    apiGet<{ records: EmployeeNoteItem[]; meta: any }>(`${BASE}/${id}/notes${buildQueryString(params ?? {})}`),

  createNote: (id: string, data: CreateNoteData) => apiPost<EmployeeNoteItem>(`${BASE}/${id}/notes`, data),

  updateNote: (id: string, noteId: string, data: UpdateNoteData) => apiPatch<EmployeeNoteItem>(`${BASE}/${id}/notes/${noteId}`, data),

  deleteNote: (id: string, noteId: string) => apiDelete<{ message: string }>(`${BASE}/${id}/notes/${noteId}`),
} as const;

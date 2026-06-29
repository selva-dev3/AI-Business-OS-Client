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

  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<BulkImportResponse>(`${BASE}/bulk-import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: (params?: { format?: string; status?: string; departmentId?: string; designationId?: string }) =>
    apiGet<any[]>(`${BASE}/export${buildQueryString(params ?? {})}`),
} as const;

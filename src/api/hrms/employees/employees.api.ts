import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/client";
import { buildQueryString } from "@/api/utils";
import {
  Employee,
  EmployeeListResponse,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeSearchParams,
  BulkImportResponse,
} from "./employees.types";

const BASE = "/hrms/employees";

export const employeesApi = {
  getAll: (params?: EmployeeSearchParams) =>
    apiGet<EmployeeListResponse>(`${BASE}${buildQueryString(params ?? {})}`),

  create: (data: CreateEmployeeData) => apiPost<Employee>(BASE, data),

  getById: (id: string) => apiGet<Employee>(`${BASE}/${id}`),

  update: (id: string, data: UpdateEmployeeData) => apiPatch<Employee>(`${BASE}/${id}`, data),

  delete: (id: string) => apiDelete<{ message: string }>(`${BASE}/${id}`),

  activate: (id: string) => apiPost<{ message: string }>(`${BASE}/${id}/activate`),

  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<BulkImportResponse>(`${BASE}/bulk-import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: (params?: { format?: string; status?: string; departmentId?: string }) =>
    apiGet<Blob>(`${BASE}/export${buildQueryString(params ?? {})}`, { responseType: "blob" }),
} as const;

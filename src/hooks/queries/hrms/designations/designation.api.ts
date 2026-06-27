import { apiGet, apiPost, apiPatch, apiDelete } from "../../client";
import { buildQueryString } from "../../utils";
import {
  Designation,
  DesignationListResponse,
  CreateDesignationData,
  UpdateDesignationData,
  DesignationFilters,
  BulkActionData,
  StatusChangeData,
  BulkActionResult,
} from "./designation.types";

const BASE = "/hrms/designations";

export const designationApi = {
  getAll: (params?: DesignationFilters) =>
    apiGet<DesignationListResponse>(`${BASE}${buildQueryString(params ?? {})}`),

  getAllUnpaginated: () =>
    apiGet<Designation[]>(`${BASE}/all`),

  getById: (id: string) =>
    apiGet<Designation>(`${BASE}/${id}`),

  create: (data: CreateDesignationData) =>
    apiPost<Designation>(BASE, data),

  update: (id: string, data: UpdateDesignationData) =>
    apiPatch<Designation>(`${BASE}/${id}`, data),

  delete: (id: string, force?: boolean) =>
    apiDelete<Designation>(`${BASE}/${id}${force ? '?force=true' : ''}`),

  restore: (id: string) =>
    apiPost<Designation>(`${BASE}/${id}/restore`),

  bulkDelete: (data: BulkActionData) =>
    apiPost<BulkActionResult>(`${BASE}/bulk/delete`, data),

  bulkRestore: (data: BulkActionData) =>
    apiPost<BulkActionResult>(`${BASE}/bulk/restore`, data),

  changeStatus: (id: string, data: StatusChangeData) =>
    apiPatch<Designation>(`${BASE}/${id}/status`, data),

  exportCSV: (params?: { departmentId?: string; status?: string }) =>
    apiGet<Blob>(`${BASE}/export/csv${buildQueryString(params ?? {})}`, { responseType: "blob" }),

  exportExcel: (params?: { departmentId?: string; status?: string }) =>
    apiGet<Blob>(`${BASE}/export/excel${buildQueryString(params ?? {})}`, { responseType: "blob" }),
} as const;

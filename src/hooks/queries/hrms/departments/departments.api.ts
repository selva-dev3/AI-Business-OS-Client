import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { Department, CreateDepartmentData, UpdateDepartmentData } from "./departments.types";

const BASE_DEPARTMENTS = "/hrms/departments";

export const departmentsApi = {
  getAll: () =>
    apiGet<Department[]>(BASE_DEPARTMENTS),

  getById: (id: string) =>
    apiGet<Department>(`${BASE_DEPARTMENTS}/${id}`),

  create: (data: CreateDepartmentData) =>
    apiPost<Department>(BASE_DEPARTMENTS, data),

  update: (id: string, data: UpdateDepartmentData) =>
    apiPatch<Department>(`${BASE_DEPARTMENTS}/${id}`, data),

  delete: (id: string) =>
    apiDelete<void>(`${BASE_DEPARTMENTS}/${id}`),
} as const;

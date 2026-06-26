import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  CompanyDetailResponse,
  UpdateCompanyData,
  CompanySettingsResponse,
  UpdateCompanySettingsData,
  Branch,
  CreateBranchData,
  UpdateBranchData,
} from "./company.types";

const BASE = "/company";

export const companyApi = {
  get: () => apiGet<CompanyDetailResponse>(BASE),

  update: (data: UpdateCompanyData) => apiPatch<CompanyDetailResponse>(BASE, data),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<{ logoUrl: string }>(`${BASE}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getSettings: () => apiGet<CompanySettingsResponse>(`${BASE}/settings`),

  updateSettings: (data: UpdateCompanySettingsData) =>
    apiPatch<{ message: string }>(`${BASE}/settings`, data),

  getBranches: () => apiGet<Branch[]>(`${BASE}/branches`),

  createBranch: (data: CreateBranchData) => apiPost<Branch>(`${BASE}/branches`, data),

  updateBranch: (id: string, data: UpdateBranchData) =>
    apiPatch<Branch>(`${BASE}/branches/${id}`, data),

  deleteBranch: (id: string) => apiDelete<{ message: string }>(`${BASE}/branches/${id}`),
} as const;

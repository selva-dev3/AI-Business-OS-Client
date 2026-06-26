import { apiGet } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import { CrmDashboardData, CrmDashboardSearchParams } from "./crm.types";

const BASE = "/crm";

export const crmApi = {
  getDashboard: (params?: CrmDashboardSearchParams) =>
    apiGet<CrmDashboardData>(`${BASE}/dashboard${buildQueryString(params ?? {})}`),
} as const;

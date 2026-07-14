import { apiGet } from "@/hooks/queries/client";
import { endpoints } from "@/lib/api/endpoints";
import { HRMSDashboardData } from "./dashboard.types";

export const hrmsDashboardApi = {
  getDashboard: (params?: { from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append("from", params.from);
    if (params?.to) searchParams.append("to", params.to);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiGet<HRMSDashboardData>(`${endpoints.hrms.dashboard}${query}`);
  },
} as const;

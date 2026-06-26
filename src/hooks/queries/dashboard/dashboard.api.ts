import { apiGet } from "@/hooks/queries/client";
import { endpoints } from "@/lib/api/endpoints";

export interface DashboardActivity {
  module: "CRM" | "PROCUREMENT" | "INVENTORY" | "HRMS" | "FINANCE";
  action: string;
  title: string;
  description: string;
  status: string | null;
  refId: string | null;
  refModel: string | null;
  meta: Record<string, any>;
  timestamp: string;
  user: {
    id: string;
    name?: string;
  } | null;
}

export interface DashboardActivityResponse {
  activities: DashboardActivity[];
  total: number;
  modules: string[];
}

export const dashboardApi = {
  getActivity: (params?: { limit?: number; module?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.module) searchParams.append("module", params.module);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiGet<DashboardActivityResponse>(`${endpoints.dashboard.dashboard}/activity${query}`);
  },
} as const;

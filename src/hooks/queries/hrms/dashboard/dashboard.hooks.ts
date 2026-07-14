import { useQuery } from "@tanstack/react-query";
import { hrmsDashboardKeys } from "./dashboard.keys";
import { hrmsDashboardApi } from "./dashboard.api";
import { HRMSDashboardData } from "./dashboard.types";

export function useHRMSDashboard(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: hrmsDashboardKeys.detail(params),
    queryFn: () => hrmsDashboardApi.getDashboard(params),
  });
}

export type { HRMSDashboardData };

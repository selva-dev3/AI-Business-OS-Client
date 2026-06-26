import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { dashboardApi, DashboardActivityResponse } from "./dashboard.api";

export function useDashboardActivity(
  params?: { limit?: number; module?: string },
  options?: Omit<UseQueryOptions<DashboardActivityResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.dashboard(), params] as const,
    queryFn: () => dashboardApi.getActivity(params),
    ...options,
  });
}

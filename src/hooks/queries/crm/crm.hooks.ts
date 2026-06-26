import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { crmApi } from "./crm.api";
import { CrmDashboardData, CrmDashboardSearchParams } from "./crm.types";

export function useCrmDashboard(
  params?: CrmDashboardSearchParams,
  options?: Omit<UseQueryOptions<CrmDashboardData>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.crm.dashboard(params),
    queryFn: () => crmApi.getDashboard(params),
    ...options,
  });
}

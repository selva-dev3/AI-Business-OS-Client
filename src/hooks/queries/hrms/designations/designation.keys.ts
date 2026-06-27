import { DesignationFilters } from "./designation.types";

export const designationKeys = {
  all: ["designations"] as const,
  lists: () => [...designationKeys.all, "list"] as const,
  list: (params?: DesignationFilters) => [...designationKeys.lists(), params] as const,
  details: () => [...designationKeys.all, "detail"] as const,
  detail: (id: string) => [...designationKeys.details(), id] as const,
  select: () => [...designationKeys.all, "select"] as const,
} as const;

import { EmployeeSearchParams } from "./employees.types";

export const employeesKeys = {
  all: ["employees"] as const,
  lists: () => [...employeesKeys.all, "list"] as const,
  list: (params?: EmployeeSearchParams) => [...employeesKeys.lists(), params] as const,
  details: () => [...employeesKeys.all, "detail"] as const,
  detail: (id: string) => [...employeesKeys.details(), id] as const,
} as const;

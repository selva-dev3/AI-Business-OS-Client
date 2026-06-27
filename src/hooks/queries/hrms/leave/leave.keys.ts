import { LeaveSearchParams } from "./leave.types";

export const leaveKeys = {
  all: ["leave"] as const,
  lists: () => [...leaveKeys.all, "list"] as const,
  list: (params?: LeaveSearchParams) => [...leaveKeys.lists(), params] as const,
  balances: () => [...leaveKeys.all, "balance"] as const,
  balance: (employeeId?: string) => [...leaveKeys.balances(), employeeId] as const,
  calendars: () => [...leaveKeys.all, "calendar"] as const,
  calendar: (params?: unknown) => [...leaveKeys.calendars(), params] as const,
} as const;

import { AttendanceSearchParams } from "./attendance.types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (params?: AttendanceSearchParams) => [...attendanceKeys.lists(), params] as const,
  summaries: () => [...attendanceKeys.all, "summary"] as const,
  summary: (params?: { date?: string }) => [...attendanceKeys.summaries(), params] as const,
} as const;

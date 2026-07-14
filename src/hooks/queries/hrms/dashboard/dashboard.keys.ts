export const hrmsDashboardKeys = {
  all: ["hrms", "dashboard"] as const,
  detail: (params?: unknown) => ["hrms", "dashboard", "detail", params] as const,
} as const;

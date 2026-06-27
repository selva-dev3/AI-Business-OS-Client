export const payrollKeys = {
  all: ["payroll"] as const,
  runs: () => [...payrollKeys.all, "runs"] as const,
  payslips: (runId: string) => [...payrollKeys.all, "payslips", runId] as const,
  summary: () => [...payrollKeys.all, "summary"] as const,
} as const;

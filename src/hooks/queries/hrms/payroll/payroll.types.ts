import { ListParams, PaginationMeta } from "@/hooks/queries/client";

export type PayrollRunStatus = "draft" | "processing" | "processed" | "paid";

export type PayrollRun = {
  id: string;
  month: string; // e.g. "June"
  year: number;  // e.g. 2026
  status: PayrollRunStatus;
  totalAmount: number;
  employeeCount: number;
  processedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PayslipStatus = "draft" | "processing" | "paid";

export type Payslip = {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    designation?: string;
    department?: { id: string; name: string };
    salary?: number;
  };
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netSalary: number;
  status: PayslipStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PayrollSummary = {
  totalPayrollCost: number;
  activeEmployees: number;
  lastProcessedDate?: string;
  averageSalary: number;
};

export type CreatePayrollRunData = {
  month: string;
  year: number;
};

export type UpdatePayrollStatusData = {
  status: PayrollRunStatus;
};

export type UpdatePayslipData = {
  allowances?: number;
  deductions?: number;
  notes?: string;
};

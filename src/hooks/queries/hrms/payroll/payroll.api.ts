import { apiGet, apiPost, apiPatch, apiPut } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  PayrollRun,
  Payslip,
  PayrollSummary,
  CreatePayrollRunData,
  UpdatePayrollStatusData,
  UpdatePayslipData,
} from "./payroll.types";

const BASE_PAYROLL = "/hrms/payroll";

export const payrollApi = {
  getRuns: () =>
    apiGet<PayrollRun[]>(`${BASE_PAYROLL}/runs`),

  getPayslips: (runId: string) =>
    apiGet<Payslip[]>(`${BASE_PAYROLL}/runs/${runId}/payslips`),

  getSummary: () =>
    apiGet<PayrollSummary>(`${BASE_PAYROLL}/summary`),

  createRun: (data: CreatePayrollRunData) =>
    apiPost<PayrollRun>(`${BASE_PAYROLL}/runs`, data),

  updateRunStatus: (id: string, data: UpdatePayrollStatusData) =>
    apiPatch<PayrollRun>(`${BASE_PAYROLL}/runs/${id}/status`, data),

  updatePayslip: (id: string, data: UpdatePayslipData) =>
    apiPut<Payslip>(`${BASE_PAYROLL}/payslips/${id}`, data),
} as const;

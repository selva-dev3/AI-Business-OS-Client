import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollApi } from "./payroll.api";
import { payrollKeys } from "./payroll.keys";
import {
  CreatePayrollRunData,
  UpdatePayrollStatusData,
  UpdatePayslipData,
} from "./payroll.types";

export function usePayrollRuns() {
  return useQuery({
    queryKey: payrollKeys.runs(),
    queryFn: () => payrollApi.getRuns(),
  });
}

export function usePayslips(runId: string) {
  return useQuery({
    queryKey: payrollKeys.payslips(runId),
    queryFn: () => payrollApi.getPayslips(runId),
    enabled: !!runId,
  });
}

export function usePayrollSummary() {
  return useQuery({
    queryKey: payrollKeys.summary(),
    queryFn: () => payrollApi.getSummary(),
  });
}

export function useCreatePayrollRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayrollRunData) => payrollApi.createRun(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useUpdatePayrollRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayrollStatusData }) =>
      payrollApi.updateRunStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useUpdatePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayslipData }) =>
      payrollApi.updatePayslip(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

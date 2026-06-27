import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { financeApi } from "./finance.api";
import {
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateExpenseData,
  UpdateExpenseData,
  CreatePaymentData,
  CreateBudgetData,
  UpdateBudgetData,
  CreateAccountData,
  UpdateAccountData,
  FundTransferData,
} from "./finance.types";

// --- Invoices ---

export function useInvoicesList(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => financeApi.listInvoices(params),
  });
}

export function useInvoiceDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => financeApi.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceData) => financeApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceData }) =>
      financeApi.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

// --- Expenses ---

export function useExpensesList(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => financeApi.listExpenses(params),
  });
}

export function useExpenseDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => financeApi.getExpense(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => financeApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      // Budgets can also change spent amounts
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      financeApi.updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

// --- Payments ---

export function usePaymentsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => financeApi.listPayments(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentData) => financeApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeAccounts.all });
    },
  });
}

// --- Budgets ---

export function useBudgetsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.budgets.list(params),
    queryFn: () => financeApi.listBudgets(params),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetData) => financeApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetData }) =>
      financeApi.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

// --- Accounts ---

export function useAccountsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.financeAccounts.list(params),
    queryFn: () => financeApi.listAccounts(params),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountData) => financeApi.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeAccounts.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountData }) =>
      financeApi.updateAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeAccounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeAccounts.detail(variables.id) });
    },
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FundTransferData) => financeApi.transferFunds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeAccounts.all });
    },
  });
}

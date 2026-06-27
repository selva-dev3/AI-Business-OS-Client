import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import { endpoints } from "@/lib/api/endpoints";
import {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
  Payment,
  CreatePaymentData,
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
  Account,
  CreateAccountData,
  UpdateAccountData,
  FundTransferData,
  PaginatedResult,
} from "./finance.types";

export const financeApi = {
  // --- Invoices ---
  listInvoices: (params?: Record<string, any>) =>
    apiGet<PaginatedResult<Invoice> | Invoice[]>(
      `${endpoints.finance.invoices}${buildQueryString(params ?? {})}`
    ),
  getInvoice: (id: string) =>
    apiGet<Invoice>(`${endpoints.finance.invoices}/${id}`),
  createInvoice: (data: CreateInvoiceData) =>
    apiPost<Invoice>(endpoints.finance.invoices, data),
  updateInvoice: (id: string, data: UpdateInvoiceData) =>
    apiPatch<Invoice>(`${endpoints.finance.invoices}/${id}`, data),
  deleteInvoice: (id: string) =>
    apiDelete<void>(`${endpoints.finance.invoices}/${id}`),

  // --- Expenses ---
  listExpenses: (params?: Record<string, any>) =>
    apiGet<PaginatedResult<Expense> | Expense[]>(
      `${endpoints.finance.expenses}${buildQueryString(params ?? {})}`
    ),
  getExpense: (id: string) =>
    apiGet<Expense>(`${endpoints.finance.expenses}/${id}`),
  createExpense: (data: CreateExpenseData) =>
    apiPost<Expense>(endpoints.finance.expenses, data),
  updateExpense: (id: string, data: UpdateExpenseData) =>
    apiPatch<Expense>(`${endpoints.finance.expenses}/${id}`, data),
  deleteExpense: (id: string) =>
    apiDelete<void>(`${endpoints.finance.expenses}/${id}`),

  // --- Payments ---
  listPayments: (params?: Record<string, any>) =>
    apiGet<PaginatedResult<Payment> | Payment[]>(
      `${endpoints.finance.payments}${buildQueryString(params ?? {})}`
    ),
  createPayment: (data: CreatePaymentData) =>
    apiPost<Payment>(endpoints.finance.payments, data),

  // --- Budgets ---
  listBudgets: (params?: Record<string, any>) =>
    apiGet<PaginatedResult<Budget> | Budget[]>(
      `${endpoints.finance.budgets}${buildQueryString(params ?? {})}`
    ),
  createBudget: (data: CreateBudgetData) =>
    apiPost<Budget>(endpoints.finance.budgets, data),
  updateBudget: (id: string, data: UpdateBudgetData) =>
    apiPatch<Budget>(`${endpoints.finance.budgets}/${id}`, data),

  // --- Accounts ---
  listAccounts: (params?: Record<string, any>) =>
    apiGet<PaginatedResult<Account> | Account[]>(
      `${endpoints.finance.accounts}${buildQueryString(params ?? {})}`
    ),
  createAccount: (data: CreateAccountData) =>
    apiPost<Account>(endpoints.finance.accounts, data),
  updateAccount: (id: string, data: UpdateAccountData) =>
    apiPatch<Account>(`${endpoints.finance.accounts}/${id}`, data),
  transferFunds: (data: FundTransferData) =>
    apiPost<void>(`${endpoints.finance.accounts}/transfer`, data),
};

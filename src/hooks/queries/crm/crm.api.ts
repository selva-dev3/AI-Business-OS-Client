import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import {
  CrmDashboardData,
  CrmDashboardSearchParams,
  Lead,
  CreateLeadData,
  UpdateLeadData,
  ConvertLeadData,
  LeadListParams,
  Deal,
  CreateDealData,
  UpdateDealData,
  DealListParams,
  Contact,
  CreateContactData,
  UpdateContactData,
  ContactListParams,
  MergeContactsData,
  Account,
  CreateAccountData,
  UpdateAccountData,
  AccountListParams,
  CrmActivity,
  CreateActivityData,
  UpdateActivityData,
  ActivityListParams,
  PaginatedResult,
} from "./crm.types";

const BASE = "/crm";

export const crmApi = {
  getDashboard: (params?: CrmDashboardSearchParams) =>
    apiGet<CrmDashboardData>(`${BASE}/dashboard${buildQueryString(params ?? {})}`),

  // --- Leads ---
  listLeads: (params?: LeadListParams) =>
    apiGet<PaginatedResult<Lead>>(`${BASE}/leads${buildQueryString(params as any ?? {})}`),
  getLead: (id: string) =>
    apiGet<Lead>(`${BASE}/leads/${id}`),
  createLead: (data: CreateLeadData) =>
    apiPost<Lead>(`${BASE}/leads`, data),
  updateLead: (id: string, data: UpdateLeadData) =>
    apiPatch<Lead>(`${BASE}/leads/${id}`, data),
  deleteLead: (id: string) =>
    apiDelete<void>(`${BASE}/leads/${id}`),
  changeLeadStage: (id: string, stage: string) =>
    apiPatch<Lead>(`${BASE}/leads/${id}/stage`, { stage }),
  convertLead: (id: string, data: ConvertLeadData) =>
    apiPost<{ contact: Contact; account: Account; deal?: Deal }>(`${BASE}/leads/${id}/convert`, data),
  addLeadActivity: (id: string, data: CreateActivityData) =>
    apiPost<CrmActivity>(`${BASE}/leads/${id}/activity`, data),

  // --- Contacts ---
  listContacts: (params?: ContactListParams) =>
    apiGet<PaginatedResult<Contact>>(`${BASE}/contacts${buildQueryString(params as any ?? {})}`),
  getContact: (id: string) =>
    apiGet<Contact>(`${BASE}/contacts/${id}`),
  createContact: (data: CreateContactData) =>
    apiPost<Contact>(`${BASE}/contacts`, data),
  updateContact: (id: string, data: UpdateContactData) =>
    apiPatch<Contact>(`${BASE}/contacts/${id}`, data),
  deleteContact: (id: string) =>
    apiDelete<void>(`${BASE}/contacts/${id}`),
  mergeContacts: (data: MergeContactsData) =>
    apiPost<Contact>(`${BASE}/contacts/merge`, data),

  // --- Accounts ---
  listAccounts: (params?: AccountListParams) =>
    apiGet<PaginatedResult<Account>>(`${BASE}/accounts${buildQueryString(params as any ?? {})}`),
  getAccount: (id: string) =>
    apiGet<Account>(`${BASE}/accounts/${id}`),
  createAccount: (data: CreateAccountData) =>
    apiPost<Account>(`${BASE}/accounts`, data),
  updateAccount: (id: string, data: UpdateAccountData) =>
    apiPatch<Account>(`${BASE}/accounts/${id}`, data),
  deleteAccount: (id: string) =>
    apiDelete<void>(`${BASE}/accounts/${id}`),

  // --- Deals ---
  listDeals: (params?: DealListParams) =>
    apiGet<PaginatedResult<Deal>>(`${BASE}/deals${buildQueryString(params as any ?? {})}`),
  getDeal: (id: string) =>
    apiGet<Deal>(`${BASE}/deals/${id}`),
  createDeal: (data: CreateDealData) =>
    apiPost<Deal>(`${BASE}/deals`, data),
  updateDeal: (id: string, data: UpdateDealData) =>
    apiPatch<Deal>(`${BASE}/deals/${id}`, data),
  deleteDeal: (id: string) =>
    apiDelete<void>(`${BASE}/deals/${id}`),
  changeDealStage: (id: string, stage: string) =>
    apiPatch<Deal>(`${BASE}/deals/${id}/stage`, { stage }),
  closeWonDeal: (id: string, finalValue: number) =>
    apiPost<Deal>(`${BASE}/deals/${id}/close-won`, { finalValue }),
  closeLostDeal: (id: string, lostReason: string) =>
    apiPost<Deal>(`${BASE}/deals/${id}/close-lost`, { lostReason }),

  // --- Pipeline ---
  getPipeline: (params?: { pipelineId?: string; ownerId?: string }) =>
    apiGet<any>(`${BASE}/pipeline${buildQueryString(params as any ?? {})}`),
  reorderPipeline: (data: { stage: string; position: number }) =>
    apiPatch<void>(`${BASE}/pipeline/reorder`, data),

  // --- Activities ---
  listActivities: (params?: ActivityListParams) =>
    apiGet<PaginatedResult<CrmActivity>>(`${BASE}/activities${buildQueryString(params as any ?? {})}`),
  createActivity: (data: CreateActivityData) =>
    apiPost<CrmActivity>(`${BASE}/activities`, data),
  updateActivity: (id: string, data: UpdateActivityData) =>
    apiPatch<CrmActivity>(`${BASE}/activities/${id}`, data),
  deleteActivity: (id: string) =>
    apiDelete<void>(`${BASE}/activities/${id}`),
} as const;


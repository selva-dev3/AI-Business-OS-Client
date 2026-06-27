import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { crmApi } from "./crm.api";
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

export function useCrmDashboard(
  params?: CrmDashboardSearchParams,
  options?: Omit<UseQueryOptions<CrmDashboardData>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.crm.dashboard(params),
    queryFn: () => crmApi.getDashboard(params),
    ...options,
  });
}

// --- Leads ---

export function useLeadsList(params?: LeadListParams) {
  return useQuery({
    queryKey: queryKeys.leads.list(params),
    queryFn: () => crmApi.listLeads(params),
  });
}

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => crmApi.getLead(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadData) => crmApi.createLead(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadData }) =>
      crmApi.updateLead(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.all });
      qc.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useChangeLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      crmApi.changeLeadStage(id, stage),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.all });
      qc.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
    },
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadData }) =>
      crmApi.convertLead(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads.all });
      qc.invalidateQueries({ queryKey: queryKeys.contacts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useAddLeadActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateActivityData }) =>
      crmApi.addLeadActivity(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

// --- Contacts ---

export function useContactsList(params?: ContactListParams) {
  return useQuery({
    queryKey: queryKeys.contacts.list(params),
    queryFn: () => crmApi.listContacts(params),
  });
}

export function useContactDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: () => crmApi.getContact(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactData) => crmApi.createContact(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactData }) =>
      crmApi.updateContact(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts.all });
      qc.invalidateQueries({ queryKey: queryKeys.contacts.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteContact(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useMergeContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MergeContactsData) => crmApi.mergeContacts(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

// --- Accounts ---

export function useAccountsList(params?: AccountListParams) {
  return useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: () => crmApi.listAccounts(params),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountData) => crmApi.createAccount(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountData }) =>
      crmApi.updateAccount(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail(variables.id) });
    },
  });
}

// --- Deals ---

export function useDealsList(params?: DealListParams) {
  return useQuery({
    queryKey: queryKeys.deals.list(params),
    queryFn: () => crmApi.listDeals(params),
  });
}

export function useDealDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.deals.detail(id),
    queryFn: () => crmApi.getDeal(id),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDealData) => crmApi.createDeal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealData }) =>
      crmApi.updateDeal(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      qc.invalidateQueries({ queryKey: queryKeys.deals.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteDeal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useChangeDealStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      crmApi.changeDealStage(id, stage),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      qc.invalidateQueries({ queryKey: queryKeys.deals.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useCloseDealWon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, finalValue }: { id: string; finalValue: number }) =>
      crmApi.closeWonDeal(id, finalValue),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      qc.invalidateQueries({ queryKey: queryKeys.deals.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useCloseDealLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lostReason }: { id: string; lostReason: string }) =>
      crmApi.closeLostDeal(id, lostReason),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.deals.all });
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      qc.invalidateQueries({ queryKey: queryKeys.deals.detail(variables.id) });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

// --- Pipeline ---

export function usePipeline(params?: { pipelineId?: string; ownerId?: string }) {
  return useQuery({
    queryKey: queryKeys.pipeline.list(params),
    queryFn: () => crmApi.getPipeline(params),
  });
}

export function useReorderPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { stage: string; position: number }) =>
      crmApi.reorderPipeline(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pipeline.all });
    },
  });
}

// --- Activities ---

export function useActivitiesList(params?: ActivityListParams) {
  return useQuery({
    queryKey: queryKeys.activities.list(params),
    queryFn: () => crmApi.listActivities(params),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityData) => crmApi.createActivity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityData }) =>
      crmApi.updateActivity(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteActivity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      qc.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });
}


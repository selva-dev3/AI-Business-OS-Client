export interface CrmDashboardStats {
  leads: number;
  contacts: number;
  accounts: number;
  deals: number;
  wonDeals: number;
  lostDeals: number;
  openDeals: number;
}

export interface CrmPipelineStage {
  stage: string;
  count: number;
  totalValue: number;
}

export interface CrmActivity {
  _id: string;
  type: "CALL" | "MEETING" | "EMAIL" | "TASK" | "NOTE";
  subject: string;
  description: string;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  dueAt?: string;
  isCompleted: boolean;
  companyId: string;
  leadId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  createdBy?: string | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmRecentLead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "DISQUALIFIED";
  value?: number;
  createdAt: string;
}

export interface CrmDashboardData {
  stats: CrmDashboardStats;
  pipeline: CrmPipelineStage[];
  recentActivities: CrmActivity[];
  recentLeads: CrmRecentLead[];
}

export type CrmDashboardSearchParams = {
  from?: string;
  to?: string;
};

// --- Models ---

export interface Lead {
  _id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: "WEBSITE" | "REFERRAL" | "SOCIAL" | "EMAIL" | "CALL" | "OTHER";
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "DISQUALIFIED";
  score: number;
  notes: string;
  tags: string[];
  customFields?: Record<string, any>;
  convertedAt?: string;
  companyId: string;
  ownerId?: string | null;
  dealId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  _id: string;
  title: string;
  value: number;
  currency: string;
  stage: "QUALIFICATION" | "DEMO" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  finalValue: number;
  status: "OPEN" | "WON" | "LOST";
  notes: string;
  tags: string[];
  position: number;
  lostReason?: string;
  companyId: string;
  accountId?: string | null;
  leadId?: string | null;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
  jobTitle: string;
  department: string;
  isPrimary: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  tags: string[];
  notes: string;
  companyId: string;
  accountId?: string | null;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  _id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  revenue: number;
  phone: string;
  email: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  tags: string[];
  companyId: string;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Request DTOs ---

export interface CreateLeadData {
  title: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: Lead["source"];
  status?: Lead["status"];
  score?: number;
  notes?: string;
  tags?: string[];
  ownerId?: string | null;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  dealId?: string | null;
}

export interface ConvertLeadData {
  accountId?: string;
  dealTitle?: string;
  dealValue?: number;
}

export interface CreateDealData {
  title: string;
  value?: number;
  currency?: string;
  stage?: Deal["stage"];
  probability?: number;
  expectedCloseDate?: string;
  notes?: string;
  tags?: string[];
  accountId?: string | null;
  leadId?: string | null;
  ownerId?: string | null;
}

export interface UpdateDealData extends Partial<CreateDealData> {
  status?: Deal["status"];
  lostReason?: string;
  actualCloseDate?: string;
  finalValue?: number;
}

export interface CreateContactData {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  isPrimary?: boolean;
  address?: Contact["address"];
  socialLinks?: Contact["socialLinks"];
  tags?: string[];
  notes?: string;
  accountId?: string | null;
  ownerId?: string | null;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface MergeContactsData {
  primaryContactId: string;
  secondaryContactId: string;
}

export interface CreateAccountData {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  revenue?: number;
  phone?: string;
  email?: string;
  address?: Account["address"];
  tags?: string[];
  ownerId?: string | null;
}

export interface UpdateAccountData extends Partial<CreateAccountData> {}

export interface CreateActivityData {
  type: CrmActivity["type"];
  subject: string;
  description?: string;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  dueAt?: string;
  isCompleted?: boolean;
  leadId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  assignedToId?: string | null;
}

export interface UpdateActivityData extends Partial<CreateActivityData> {}

// --- Query Parameters ---

export interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: Lead["status"];
  source?: Lead["source"];
  ownerId?: string;
  stage?: string;
}

export interface DealListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: Deal["status"];
  stage?: Deal["stage"];
  ownerId?: string;
  pipelineId?: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  ownerId?: string;
}

export interface AccountListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  ownerId?: string;
}

export interface ActivityListParams {
  page?: number;
  limit?: number;
  type?: CrmActivity["type"];
  leadId?: string;
  dealId?: string;
  contactId?: string;
  assignedToId?: string;
  fromDate?: string;
  toDate?: string;
}

// --- Pagination Envelopes ---

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}


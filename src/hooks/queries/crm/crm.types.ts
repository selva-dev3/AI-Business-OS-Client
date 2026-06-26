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
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "UNQUALIFIED";
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

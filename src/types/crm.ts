export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  stage: "new" | "contacted" | "qualified" | "unqualified" | "converted_to_deal";
  score?: number;
  assignedToId?: string;
  assignedTo?: { id: string; name: string };
  createdAt: string;
  estimatedValue?: number;
  notes?: string;
};

export type Deal = {
  id: string;
  title: string;
  accountId?: string;
  account?: { id: string; name: string };
  contactId?: string;
  contact?: { id: string; name: string };
  stage: "qualification" | "demo" | "proposal" | "negotiation" | "won" | "lost";
  value: number;
  probability: number;
  expectedCloseDate?: string;
  assignedToId?: string;
  assignedTo?: { id: string; name: string };
  createdAt: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  accountId?: string;
  account?: { id: string; name: string };
  lastActivityAt?: string;
};

export type Account = {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  employeeCount?: number;
  annualRevenue?: number;
};

export type Activity = {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task";
  subject: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  relatedTo?: { type: "lead" | "deal" | "contact"; id: string; name: string };
  createdBy: { id: string; name: string };
};

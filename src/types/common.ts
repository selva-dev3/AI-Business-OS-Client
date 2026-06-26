import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export type NavItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  children?: NavItem[];
  permission?: { module: string; action: string };
};

export type NotificationType =
  | "leave_request_submitted"
  | "leave_request_approved"
  | "leave_request_rejected"
  | "payroll_processed"
  | "ticket_assigned"
  | "ticket_resolved"
  | "invoice_due"
  | "invoice_paid"
  | "task_assigned"
  | "task_due_soon"
  | "purchase_order_approved"
  | "system_alert";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  module?: string;
};

export type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
};

export type UploadedFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  color?: string;
};

export type AuditLog = {
  id: string;
  action: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  description: string;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
};

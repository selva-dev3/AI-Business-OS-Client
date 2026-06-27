import {
  LayoutDashboard,
  Users,
  Briefcase,
  Package,
  ShoppingCart,
  DollarSign,
  FolderKanban,
  Headset,
  FileText,
  BarChart3,
  Settings,
  Bot,
  Bell,
} from "lucide-react";
import { NavItem } from "@/types/common";

export const navigation: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "HRMS",
    icon: Users,
    children: [
      { label: "Employees", href: "/hrms/employees" },
      { label: "Departments", href: "/hrms/departments" },
      { label: "Designations", href: "/hrms/designations" },
      { label: "Attendance", href: "/hrms/attendance" },
      { label: "Leave", href: "/hrms/leave" },
      { label: "Payroll", href: "/hrms/payroll" },
    ],
    permission: { module: "hrms", action: "read" },
  },
  {
    label: "CRM",
    icon: Briefcase,
    children: [
      { label: "Leads", href: "/crm/leads" },
      { label: "Contacts", href: "/crm/contacts" },
      { label: "Accounts", href: "/crm/accounts" },
      { label: "Deals", href: "/crm/deals" },
      { label: "Pipeline", href: "/crm/pipeline" },
    ],
    permission: { module: "crm", action: "read" },
  },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Products", href: "/inventory/products" },
      { label: "Categories", href: "/inventory/categories" },
      { label: "Warehouses", href: "/inventory/warehouses" },
      { label: "Stock", href: "/inventory/stock" },
    ],
    permission: { module: "inventory", action: "read" },
  },
  {
    label: "Procurement",
    icon: ShoppingCart,
    children: [
      { label: "Vendors", href: "/procurement/vendors" },
      { label: "RFQ", href: "/procurement/rfq" },
      { label: "Purchase Orders", href: "/procurement/purchase-orders" },
    ],
    permission: { module: "procurement", action: "read" },
  },
  {
    label: "Finance",
    icon: DollarSign,
    children: [
      { label: "Invoices", href: "/finance/invoices" },
      { label: "Expenses", href: "/finance/expenses" },
      { label: "Payments", href: "/finance/payments" },
      { label: "Accounts", href: "/finance/accounts" },
      { label: "Budgets", href: "/finance/budgets" },
    ],
    permission: { module: "finance", action: "read" },
  },
  {
    label: "Projects",
    icon: FolderKanban,
    children: [
      { label: "All Projects", href: "/projects" },
      { label: "Tasks", href: "/projects/tasks" },
      { label: "Milestones", href: "/projects/milestones" },
      { label: "Timesheets", href: "/projects/timesheets" },
    ],
    permission: { module: "projects", action: "read" },
  },
  {
    label: "Support",
    icon: Headset,
    children: [
      { label: "Tickets", href: "/support/tickets" },
      { label: "Categories", href: "/support/categories" },
    ],
    permission: { module: "support", action: "read" },
  },
  {
    label: "Documents",
    icon: FileText,
    href: "/documents",
    permission: { module: "documents", action: "read" },
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    permission: { module: "analytics", action: "read" },
  },
  {
    label: "AI Chat",
    icon: Bot,
    href: "/ai-chat",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    permission: { module: "settings", action: "read" },
  },
];

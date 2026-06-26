"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Boxes,
  Brain,
  FolderKanban,
  Headphones,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  Bell,
  FileText,
  UserCheck,
  CalendarDays,
  CreditCard,
  Truck,
  Package,
  ClipboardList,
  Receipt,
  Warehouse,
  ArrowLeftRight,
  PieChart,
  Gem,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Nav item types                                                     */
/* ------------------------------------------------------------------ */
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
};

/* ------------------------------------------------------------------ */
/*  Nav structure                                                      */
/* ------------------------------------------------------------------ */
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    label: "HRMS",
    href: "/hrms",
    icon: Briefcase,
    children: [
      { label: "Dashboard", href: "/hrms" },
      { label: "Employees", href: "/hrms/employees" },
      { label: "Attendance", href: "/hrms/attendance" },
      { label: "Leave", href: "/hrms/leave" },
      { label: "Payroll", href: "/hrms/payroll" },
      { label: "Departments", href: "/hrms/departments" },
      { label: "Assets", href: "/hrms/assets" },
    ],
  },
  {
    label: "CRM",
    href: "/crm",
    icon: Users,
    children: [
      { label: "Dashboard", href: "/crm" },
      { label: "Leads", href: "/crm/leads" },
      { label: "Deals", href: "/crm/deals" },
      { label: "Contacts", href: "/crm/contacts" },
      { label: "Pipeline", href: "/crm/pipeline" },
      { label: "Activities", href: "/crm/activities" },
    ],
  },
  {
    label: "Finance",
    href: "/finance",
    icon: DollarSign,
    children: [
      { label: "Dashboard", href: "/finance" },
      { label: "Invoices", href: "/finance/invoices" },
      { label: "Expenses", href: "/finance/expenses" },
      { label: "Payments", href: "/finance/payments" },
      { label: "Budgets", href: "/finance/budgets" },
      { label: "Accounts", href: "/finance/accounts" },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Boxes,
    children: [
      { label: "Dashboard", href: "/inventory" },
      { label: "Products", href: "/inventory/products" },
      { label: "Warehouses", href: "/inventory/warehouses" },
      { label: "Stock", href: "/inventory/stock" },
      { label: "Transfers", href: "/inventory/transfers" },
      { label: "Categories", href: "/inventory/categories" },
    ],
  },
  {
    label: "Procurement",
    href: "/procurement",
    icon: ShoppingCart,
    children: [
      { label: "Dashboard", href: "/procurement" },
      { label: "Vendors", href: "/procurement/vendors" },
      { label: "RFQ", href: "/procurement/rfq" },
      { label: "Purchase Orders", href: "/procurement/purchase-orders" },
      { label: "Receipts", href: "/procurement/receipts" },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    children: [
      { label: "Dashboard", href: "/projects" },
      { label: "Tasks", href: "/projects/tasks" },
      { label: "Milestones", href: "/projects/milestones" },
      { label: "Timesheets", href: "/projects/timesheets" },
    ],
  },
  {
    label: "Support",
    href: "/support",
    icon: Headphones,
    children: [
      { label: "Tickets", href: "/support/tickets" },
      { label: "Categories", href: "/support/categories" },
    ],
  },
  { label: "AI Chat", href: "/ai-chat", icon: Brain },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

/* ================================================================== */
/*  Sidebar Component                                                  */
/* ================================================================== */
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  // Auto-open the active section
  React.useEffect(() => {
    const active = navItems.find(
      (item) => item.children && pathname.startsWith(item.href) && item.href !== "/"
    );
    if (active && !openGroups.includes(active.label)) {
      setOpenGroups((prev) => [...prev, active.label]);
    }
  }, [pathname]);

  const toggle = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 truncate">
              AI <span className="text-indigo-600">Biz</span> OS
            </span>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors",
            sidebarCollapsed && "mx-auto mt-2"
          )}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const isOpen = openGroups.includes(item.label);
          const hasChildren = !!item.children?.length;

          return (
            <div key={item.label}>
              {/* Parent link */}
              {hasChildren ? (
                <button
                  onClick={() => {
                    if (!sidebarCollapsed) toggle(item.label);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-indigo-600")} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-slate-400 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-indigo-600")} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )}

              {/* Children */}
              {hasChildren && isOpen && !sidebarCollapsed && (
                <div className="ml-5 pl-4 border-l border-slate-100 mt-0.5 mb-1 space-y-0.5">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
                          childActive
                            ? "text-indigo-700 bg-indigo-50/60"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom user badge */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-slate-50">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[11px] font-bold shrink-0">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800 truncate">AI Business OS</p>
              <p className="text-[10px] text-slate-400">Enterprise Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

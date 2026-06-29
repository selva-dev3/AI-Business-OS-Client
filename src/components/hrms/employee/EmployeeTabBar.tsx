"use client";

import * as React from "react";
import {
  User,
  Calendar,
  TreePalm,
  Banknote,
  FileText,
  StickyNote,
  Briefcase,
  Key,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type EmployeeTabKey =
  | "overview"
  | "attendance"
  | "leaves"
  | "payroll"
  | "documents"
  | "notes"
  | "assign-role"
  | "access"
  | "exit";

interface TabDef {
  key: EmployeeTabKey;
  label: string;
  icon: LucideIcon;
  roles: string[];
}

const ALL_TABS: TabDef[] = [
  { key: "overview", label: "Overview", icon: User, roles: ["admin", "hr_manager", "employee"] },
  { key: "attendance", label: "Attendance", icon: Calendar, roles: ["admin", "hr_manager", "employee"] },
  { key: "leaves", label: "Leave", icon: TreePalm, roles: ["admin", "hr_manager", "employee"] },
  { key: "payroll", label: "Payroll", icon: Banknote, roles: ["admin", "hr_manager", "employee"] },
  { key: "documents", label: "Documents", icon: FileText, roles: ["admin", "hr_manager"] },
  { key: "notes", label: "HR Notes", icon: StickyNote, roles: ["admin", "hr_manager"] },
  { key: "assign-role", label: "Role & Dept", icon: Briefcase, roles: ["admin", "hr_manager"] },
  { key: "access", label: "Access", icon: Key, roles: ["admin"] },
  { key: "exit", label: "Exit / Offboard", icon: LogOut, roles: ["admin"] },
];

function useUserRole() {
  const user = useAuthStore((s) => s.user);
  const roleName = user?.role?.toLowerCase() || "employee";
  const normalized =
    roleName.includes("admin") ? "admin" : roleName.includes("hr") ? "hr_manager" : "employee";
  return normalized;
}

export function EmployeeTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: EmployeeTabKey;
  onTabChange: (tab: EmployeeTabKey) => void;
}) {
  const role = useUserRole();
  const isSuperAdmin = role === "admin";

  const visibleTabs = React.useMemo(() => {
    return ALL_TABS.filter((tab) => {
      if (isSuperAdmin) return true;
      return tab.roles.includes(role);
    });
  }, [role, isSuperAdmin]);

  // If active tab is not visible, switch to overview
  React.useEffect(() => {
    if (!visibleTabs.some((t) => t.key === activeTab)) {
      onTabChange("overview");
    }
  }, [visibleTabs, activeTab, onTabChange]);

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-1 border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors focus-visible:outline-none",
                isActive
                  ? "text-indigo-700 bg-indigo-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

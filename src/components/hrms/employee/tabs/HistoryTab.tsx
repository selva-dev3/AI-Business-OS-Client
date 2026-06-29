"use client";

import * as React from "react";
import { useHistory } from "@/hooks/useEmployeeTabData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Briefcase,
  Building,
  UserCheck,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Shield,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeeHistoryItem } from "@/hooks/queries/hrms/employees/employees.types";

export default function HistoryTab({ employeeId }: { employeeId: string }) {
  const [filterType, setFilterType] = React.useState<string>("all");

  const { data, isLoading, isError, error, refetch } = useHistory(employeeId, true);

  const historyList = React.useMemo(() => {
    const list = data || [];
    if (filterType === "all") return list;
    return list.filter((item) => item.changeType === filterType);
  }, [data, filterType]);

  // Format date utility
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_e) {
      return dateStr;
    }
  };

  // Map changeType to details and styling
  const getChangeTypeDetails = (type: string) => {
    switch (type) {
      case "DESIGNATION_CHANGE":
        return {
          icon: Briefcase,
          color: "text-violet-600 bg-violet-50 border-violet-100",
          label: "Designation Change",
        };
      case "DEPARTMENT_CHANGE":
        return {
          icon: Building,
          color: "text-blue-600 bg-blue-50 border-blue-100",
          label: "Department Change",
        };
      case "PROMOTION":
        return {
          icon: TrendingUp,
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          label: "Promotion",
        };
      case "STATUS_CHANGE":
        return {
          icon: UserCheck,
          color: "text-amber-600 bg-amber-50 border-amber-100",
          label: "Status Change",
        };
      case "BRANCH_CHANGE":
      case "TRANSFER":
        return {
          icon: RefreshCw,
          color: "text-indigo-600 bg-indigo-50 border-indigo-100",
          label: "Transfer",
        };
      case "SALARY_CHANGE":
        return {
          icon: Shield,
          color: "text-rose-600 bg-rose-50 border-rose-100",
          label: "Salary Change",
        };
      default:
        return {
          icon: HelpCircle,
          color: "text-slate-600 bg-slate-50 border-slate-100",
          label: type.replace("_", " "),
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="border-slate-100 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-100 bg-rose-50/20">
        <CardContent className="py-12 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Failed to load history</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {error instanceof Error ? error.message : "An unexpected error occurred while fetching audit trail."}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            Employment History & Audits
          </CardTitle>
          <p className="text-xs text-slate-500">
            Timeline of all designation, department, status, and role adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] h-9 bg-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="DESIGNATION_CHANGE">Designation Changes</SelectItem>
              <SelectItem value="DEPARTMENT_CHANGE">Department Changes</SelectItem>
              <SelectItem value="PROMOTION">Promotions</SelectItem>
              <SelectItem value="STATUS_CHANGE">Status Changes</SelectItem>
              <SelectItem value="TRANSFER">Transfers</SelectItem>
              <SelectItem value="SALARY_CHANGE">Salary Changes</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-9 w-9 bg-white text-slate-500 hover:text-slate-800"
            title="Refresh history"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative">
        {historyList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <History className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">No history records found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This employee doesn&apos;t have any log records for the selected filters.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l border-slate-100 ml-4 space-y-8 py-2">
            {historyList.map((item) => {
              const details = getChangeTypeDetails(item.changeType);
              const Icon = details.icon;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline bullet icon */}
                  <div
                    className={cn(
                      "absolute -left-[38px] sm:-left-[46px] top-0 p-1.5 rounded-full border bg-white transition-transform group-hover:scale-110",
                      details.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 border border-slate-100 text-slate-600">
                      {details.label}
                    </span>
                  </div>

                  {/* Details Card */}
                  <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all">
                    {/* Change information representation */}
                    <div className="text-sm font-medium text-slate-800 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {item.changeType === "DESIGNATION_CHANGE" ? (
                        <>
                          Designation changed from{" "}
                          <span className="font-semibold text-slate-900">
                            {item.oldDesignationId?.name || item.oldValue || "N/A"}
                          </span>{" "}
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 inline" />{" "}
                          <span className="font-semibold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {item.newDesignationId?.name || item.newValue}
                          </span>
                        </>
                      ) : item.changeType === "DEPARTMENT_CHANGE" ? (
                        <>
                          Department changed from{" "}
                          <span className="font-semibold text-slate-900">
                            {item.oldDepartmentId?.name || item.oldValue || "N/A"}
                          </span>{" "}
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 inline" />{" "}
                          <span className="font-semibold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100">
                            {item.newDepartmentId?.name || item.newValue}
                          </span>
                        </>
                      ) : item.changeType === "STATUS_CHANGE" ? (
                        <>
                          Status changed from{" "}
                          <span className="capitalize font-semibold text-slate-500">
                            {item.oldValue || "N/A"}
                          </span>{" "}
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 inline" />{" "}
                          <span className="capitalize font-semibold text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-100">
                            {item.newValue}
                          </span>
                        </>
                      ) : (
                        <>
                          Updated from{" "}
                          <span className="font-semibold text-slate-900">{item.oldValue || "N/A"}</span>{" "}
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 inline" />{" "}
                          <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-150">
                            {item.newValue}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Change author metadata */}
                    {item.changedBy && (
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Modified by:{" "}
                        <span className="text-slate-800">
                          {item.changedBy.firstName} {item.changedBy.lastName}
                        </span>{" "}
                        <span className="text-slate-400">({item.changedBy.email})</span>
                      </p>
                    )}

                    {/* Reason block */}
                    {item.reason && (
                      <div className="mt-3 text-xs bg-white border border-slate-100 rounded-lg p-2.5 text-slate-600 italic">
                        &ldquo;{item.reason}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

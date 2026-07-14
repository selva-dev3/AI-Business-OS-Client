"use client";

import * as React from "react";
import { useLeaves } from "@/hooks/useEmployeeTabData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TreePalm,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaveRequestItem, LeaveBalanceMap } from "@/types/hrms";

const currentYear = new Date().getFullYear();
const LEAVE_TYPES = ["All", "Casual", "Sick", "Earned", "Maternity", "Paternity", "Unpaid"];

export default function LeaveTab({ employeeId }: { employeeId: string }) {
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [year, setYear] = React.useState(currentYear);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useLeaves(
    employeeId,
    {
      status: statusFilter !== "all" ? statusFilter : undefined,
      leaveType: typeFilter !== "All" ? typeFilter : undefined,
      year,
      page,
      limit: 15,
    },
    true
  );

  const requests: LeaveRequestItem[] = data?.requests ?? [];
  const leaveBalance: LeaveBalanceMap = data?.leaveBalance ?? {};
  const totalPages = data?.meta?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 p-4 border rounded-xl">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <p className="text-sm text-slate-500">{(error as any)?.message || "Failed to load leave data"}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Leave Balance */}
      {Object.keys(leaveBalance).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(leaveBalance).map(([type, bal]) => {
            const pct = bal.total > 0 ? Math.round((bal.used / bal.total) * 100) : 0;
            const colors: Record<string, string> = {
              Casual: "bg-emerald-500",
              Sick: "bg-amber-500",
              Earned: "bg-blue-500",
              Maternity: "bg-purple-500",
              Paternity: "bg-cyan-500",
              Unpaid: "bg-slate-400",
            };
            return (
              <Card key={type} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">{type} Leave</p>
                    <span className="text-xs font-bold text-slate-800">{bal.remaining}/{bal.total}</span>
                  </div>
                  <Progress value={pct} className={cn("h-1.5", colors[type] || "bg-indigo-500")} />
                  <p className="text-[10px] text-slate-400">{bal.used} used of {bal.total}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {LEAVE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t === "All" ? "All Types" : t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={(v) => { setYear(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <TreePalm className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium">No leave requests found</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Approved At</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => {
                const leaveTypeName = typeof req.leaveTypeId === "object" && req.leaveTypeId
                  ? `${req.leaveTypeId.name} (${req.leaveTypeId.code})`
                  : (req.leaveType || "N/A");

                const approvedByName = typeof req.approvedBy === "object" && req.approvedBy
                  ? `${req.approvedBy.firstName} ${req.approvedBy.lastName}`
                  : (typeof req.approvedBy === "string" ? req.approvedBy : "—");

                const formatDate = (dateStr?: string) => {
                  if (!dateStr) return "—";
                  try {
                    return new Date(dateStr).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  } catch (_) {
                    return dateStr;
                  }
                };

                const formatDateTime = (dateStr?: string) => {
                  if (!dateStr) return "—";
                  try {
                    return new Date(dateStr).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch (_) {
                    return dateStr;
                  }
                };

                return (
                  <TableRow key={req.id || req._id}>
                    <TableCell className="font-medium text-xs text-slate-800">{leaveTypeName}</TableCell>
                    <TableCell className="text-xs text-slate-600">{formatDate(req.fromDate)}</TableCell>
                    <TableCell className="text-xs text-slate-600">{formatDate(req.toDate)}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700 text-center">{req.days}</TableCell>
                    <TableCell><LeaveStatusBadge status={req.status} /></TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[150px] truncate" title={req.reason}>{req.reason}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{approvedByName}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDateTime(req.approvedAt)}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDateTime(req.createdAt)}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDateTime(req.updatedAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600" },
  };
  const s = map[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", s.className)}>
      {s.label}
    </span>
  );
}

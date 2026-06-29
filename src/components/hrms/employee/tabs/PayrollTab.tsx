"use client";

import * as React from "react";
import { usePayroll } from "@/hooks/useEmployeeTabData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Banknote,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PayrollRecord } from "@/types/hrms";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();

function formatCurrency(amount?: number) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
}

export default function PayrollTab({ employeeId }: { employeeId: string }) {
  const [year, setYear] = React.useState(currentYear);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = usePayroll(
    employeeId,
    { year, status: statusFilter !== "all" ? statusFilter : undefined, page, limit: 12 },
    true
  );

  const records: PayrollRecord[] = data?.records ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <p className="text-sm text-slate-500">{(error as any)?.message || "Failed to load payroll data"}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(year)} onValueChange={(v) => { setYear(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Banknote className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium">No payroll records found</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Month</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => {
                const isExpanded = expandedRow === rec.id;
                const totalDeductions = rec.deductions?.reduce((s, d) => s + d.amount, 0) ?? 0;
                return (
                  <React.Fragment key={rec.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : rec.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {MONTHS[rec.month - 1]} {rec.year}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{formatCurrency(rec.grossSalary)}</TableCell>
                      <TableCell className="text-xs text-rose-600">{formatCurrency(totalDeductions)}</TableCell>
                      <TableCell className="text-xs font-bold text-emerald-700">{formatCurrency(rec.netSalary)}</TableCell>
                      <TableCell><PayStatusBadge status={rec.status} /></TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-slate-50/50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 mb-2">Allowances</h4>
                              {rec.allowances && rec.allowances.length > 0 ? (
                                <div className="space-y-1">
                                  {rec.allowances.map((a, i) => (
                                    <div key={i} className="flex justify-between text-xs text-slate-600">
                                      <span>{a.name}</span>
                                      <span>{formatCurrency(a.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">No allowances recorded</p>
                              )}
                              <div className="flex justify-between text-xs font-bold text-slate-800 mt-2 pt-2 border-t">
                                <span>Gross Total</span>
                                <span>{formatCurrency(rec.grossSalary)}</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 mb-2">Deductions</h4>
                              {rec.deductions && rec.deductions.length > 0 ? (
                                <div className="space-y-1">
                                  {rec.deductions.map((d, i) => (
                                    <div key={i} className="flex justify-between text-xs text-rose-600">
                                      <span>{d.name}</span>
                                      <span>-{formatCurrency(d.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">No deductions recorded</p>
                              )}
                              <div className="flex justify-between text-xs font-bold text-emerald-700 mt-2 pt-2 border-t">
                                <span>Net Pay</span>
                                <span>{formatCurrency(rec.netSalary)}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PayStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
    processed: { label: "Processed", className: "bg-blue-100 text-blue-700" },
    paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
  };
  const s = map[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", s.className)}>
      {s.label}
    </span>
  );
}

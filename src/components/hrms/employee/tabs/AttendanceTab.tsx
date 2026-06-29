"use client";

import * as React from "react";
import { useAttendance } from "@/hooks/useEmployeeTabData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Sun, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendanceLog, AttendanceSummary } from "@/types/hrms";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function AttendanceTab({ employeeId }: { employeeId: string }) {
  const [month, setMonth] = React.useState(currentMonth);
  const [year, setYear] = React.useState(currentYear);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useAttendance(
    employeeId,
    { month, year, status: statusFilter !== "all" ? statusFilter : undefined, page, limit: 15 },
    true
  );

  const records: AttendanceLog[] = data?.records ?? [];
  const summary: AttendanceSummary | undefined = data?.summary;
  const totalPages = data?.meta?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
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
        <p className="text-sm text-slate-500">{(error as any)?.message || "Failed to load attendance"}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Present"
          value={summary?.totalPresent ?? 0}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <SummaryCard
          icon={<XCircle className="h-5 w-5" />}
          label="Absent"
          value={summary?.totalAbsent ?? 0}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Late"
          value={summary?.totalLate ?? 0}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <SummaryCard
          icon={<Sun className="h-5 w-5" />}
          label="Half-Day"
          value={summary?.totalHalfDay ?? 0}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(month)} onValueChange={(v) => { setMonth(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-36">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((name, idx) => (
              <SelectItem key={idx + 1} value={String(idx + 1)}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={(v) => { setYear(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="half-day">Half-Day</SelectItem>
          </SelectContent>
        </Select>

        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium">No attendance records found</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Late (min)</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => (
                <TableRow
                  key={rec.id}
                  className={cn(
                    rec.status === "late" && "bg-amber-50/40",
                    rec.status === "absent" && "bg-rose-50/40"
                  )}
                >
                  <TableCell className="font-medium text-xs">
                    {rec.date ? new Date(rec.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {rec.checkIn || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {rec.checkOut || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={rec.status} />
                  </TableCell>
                  <TableCell className="text-xs">{rec.status === "late" ? rec.lateMinutes : "—"}</TableCell>
                  <TableCell className="text-xs text-slate-400 max-w-[160px] truncate">{rec.notes || "—"}</TableCell>
                </TableRow>
              ))}
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

function SummaryCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <Card className={cn("border-0 shadow-sm", bg)}>
      <CardContent className="p-4 flex items-center gap-3">
        <span className={color}>{icon}</span>
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className={cn("text-xl font-bold", color)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    present: { label: "Present", variant: "default" },
    late: { label: "Late", variant: "secondary" },
    absent: { label: "Absent", variant: "destructive" },
    "half-day": { label: "Half-Day", variant: "outline" },
  };
  const s = map[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={s.variant} className="text-[10px] px-2 py-0.5">
      {s.label}
    </Badge>
  );
}

import React from "react";
import { Edit2, AlertTriangle, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, Column } from "@/components/shared/datatable";
import { AttendanceCheckInButton } from "@/components/hrms/attendance/AttendanceCheckInButton";
import { cn } from "@/lib/utils";
import { Building } from "lucide-react";
import { AttendanceRecord, AttendanceStatus } from "@/hooks/queries/hrms/attendance/attendance.types";

interface Department {
  id: string;
  name: string;
}

interface AttendanceRecordsTableProps {
  records: AttendanceRecord[];
  isLoading: boolean;
  departments: Department[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onCheckIn: (record: AttendanceRecord) => void;
  onCheckOut: (record: AttendanceRecord) => void;
  onRegularize: (record: AttendanceRecord) => void;
  onEdit: (record: AttendanceRecord) => void;
}

export const AttendanceRecordsTable: React.FC<AttendanceRecordsTableProps> = ({
  records,
  isLoading,
  departments,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  onCheckIn,
  onCheckOut,
  onRegularize,
  onEdit,
}) => {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Present</Badge>;
      case "late":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Late</Badge>;
      case "half_day":
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Half Day</Badge>;
      case "absent":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Absent</Badge>;
      case "on_leave":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const columns = React.useMemo<Column<AttendanceRecord>[]>(() => [
    {
      header: "Employee",
      cell: (record) => {
        const emp = record.employee;
        const deptName = departments.find((d) => d.id === emp?.departmentId)?.name || "Corporate";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-full border border-slate-100 bg-indigo-50">
              <AvatarFallback className="text-indigo-700 bg-indigo-50 text-[11px] font-bold">
                {emp ? getInitials(emp.firstName, emp.lastName) : "EM"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {deptName}
              </p>
            </div>
          </div>
        );
      },
      className: "py-3.5 px-6",
    },
    {
      header: "Status",
      cell: (record) => getStatusBadge(record.status),
      className: "py-3.5 px-6 text-center",
    },
    {
      header: "Check-In",
      cell: (record) => formatTime(record.checkIn),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Check-Out",
      cell: (record) => formatTime(record.checkOut),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Hours Worked",
      cell: (record) => {
        const worked = record.totalHours || 0;
        const progressPercent = Math.min((worked / 8) * 100, 100);
        return (
          <div className="flex items-center justify-center gap-2">
            {worked > 0 ? (
              <>
                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      worked >= 8 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 shrink-0">
                  {worked}h
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">-</span>
            )}
          </div>
        );
      },
      className: "py-3.5 px-6",
    },
    {
      header: "Remarks / Note",
      cell: (record) => record.notes || "--",
      className: "py-3.5 px-6 text-xs text-slate-500 max-w-[200px] truncate",
    },
    {
      header: "Actions",
      cell: (record) => {
        const noCheckIn = !record.checkIn && record.status !== "on_leave";
        const checkedInNoCheckOut = !!record.checkIn && !record.checkOut && record.status !== "on_leave";
        return (
          <div className="flex items-center justify-center gap-1">
            {noCheckIn && (
              <AttendanceCheckInButton
                onClick={() => onCheckIn(record)}
                variant="ghost"
                className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[11px] font-semibold"
              />
            )}
            {checkedInNoCheckOut && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckOut(record);
                }}
                className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold"
              >
                <Square className="h-3 w-3 mr-1" />
                Check Out
              </Button>
            )}
            {record.checkIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegularize(record);
                }}
                className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-[11px] font-semibold"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Regularize
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
      className: "py-3.5 px-6 text-center",
    },
  ], [departments, onCheckIn, onCheckOut, onRegularize, onEdit]);

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-0">
        <DataTable
          data={records}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No logs match the current query criteria"
          onRowClick={(row) => router.push(`/hrms/attendance/${row.id}`)}
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Page {currentPage} of {totalPages} ({totalRecords} records)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
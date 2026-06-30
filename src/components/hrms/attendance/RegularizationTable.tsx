import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, Column } from "@/components/shared/datatable";
import { RegularizationRecord } from "@/hooks/queries/hrms/attendance/attendance.types";

interface RegularizationTableProps {
  records: RegularizationRecord[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const RegularizationTable: React.FC<RegularizationTableProps> = ({
  records,
  isLoading,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  onApprove,
  onReject,
}) => {
  const router = useRouter();

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const columns = React.useMemo<Column<RegularizationRecord>[]>(() => [
    {
      header: "Employee",
      cell: (record) => {
        const emp = record.employee;
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
                ID: {emp?.employeeCode || "—"}
              </p>
            </div>
          </div>
        );
      },
      className: "py-3.5 px-6",
    },
    {
      header: "Date",
      cell: (record) => record.date ? record.date.split("T")[0] : "—",
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Requested Check-In",
      cell: (record) => formatTime(record.checkIn),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Requested Check-Out",
      cell: (record) => formatTime(record.checkOut),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Reason",
      cell: (record) => record.reason || "—",
      className: "py-3.5 px-6 text-xs text-slate-500 max-w-[200px] truncate",
    },
    {
      header: "Status",
      cell: (record) => {
        const status = record.status || "PENDING";
        switch (status) {
          case "APPROVED":
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
          case "REJECTED":
            return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rejected</Badge>;
          case "PENDING":
          default:
            return <Badge className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">Pending</Badge>;
        }
      },
      className: "py-3.5 px-6 text-center",
    },
    {
      header: "Actions",
      cell: (record) => {
        const isPending = record.status === "PENDING";
        if (!isPending) {
          return (
            <span className="text-[11px] font-medium text-slate-400">
              Processed
            </span>
          );
        }
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(record.id);
              }}
              className="h-7 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 text-[11px] font-bold"
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReject(record.id);
              }}
              className="h-7 px-2 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border-rose-200 text-[11px] font-bold"
            >
              Reject
            </Button>
          </div>
        );
      },
      className: "py-3.5 px-6 text-center",
    },
  ], [onApprove, onReject]);

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-0">
        <DataTable
          data={records}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No regularization requests found"
          onRowClick={(row) => router.push(`/hrms/attendance/regularization/${row.id}`)}
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
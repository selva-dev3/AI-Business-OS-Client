"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { attendanceApi } from "@/hooks/queries/hrms/attendance/attendance.api";

interface AttendanceExportButtonProps {
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AttendanceExportButton({
  fromDate,
  toDate,
  employeeId,
  variant = "outline",
  size = "sm",
  className = "",
}: AttendanceExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const params: Record<string, string> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (employeeId) params.employeeId = employeeId;

      const response = await attendanceApi.exportAttendance(
        Object.keys(params).length > 0 ? params : undefined
      );

      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `attendance-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Attendance data exported successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  );
}

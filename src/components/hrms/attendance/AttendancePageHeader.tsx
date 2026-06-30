import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceExportButton } from "@/components/hrms/attendance/AttendanceExportButton";

interface AttendancePageHeaderProps {
  activeTab: "records" | "regularization";
  onCreateAttendance: () => void;
  onBulkEntry: () => void;
  onCreateRegularization: () => void;
  dateFilter: string;
}

export const AttendancePageHeader: React.FC<AttendancePageHeaderProps> = ({
  activeTab,
  onCreateAttendance,
  onBulkEntry,
  onCreateRegularization,
  dateFilter,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
          Attendance Tracking
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track daily work check-ins, late compliance, and employee timesheets.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {activeTab === "records" ? (
          <>
            <Button
              onClick={onBulkEntry}
              size="sm"
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Bulk Entry
            </Button>
            <Button
              onClick={onCreateAttendance}
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Attendance
            </Button>
            <AttendanceExportButton
              fromDate={dateFilter}
              toDate={dateFilter}
              variant="outline"
              size="sm"
              className="text-slate-600 dark:text-slate-300"
            />
          </>
        ) : (
          <Button
            onClick={onCreateRegularization}
            size="sm"
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Regularization
          </Button>
        )}
      </div>
    </div>
  );
};
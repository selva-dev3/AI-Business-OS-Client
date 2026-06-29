"use client";

import * as React from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBulkCreateAttendance } from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { BulkAttendanceEntry } from "@/hooks/queries/hrms/attendance/attendance.types";
import { useEmployees } from "@/hooks/queries/hrms/employees/employees.hooks";

interface AttendanceBulkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type EmployeeSelection = {
  employeeId: string;
  employeeName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
};

export function AttendanceBulkDialog({
  open,
  onOpenChange,
  onSuccess,
}: AttendanceBulkDialogProps) {
  const bulkCreate = useBulkCreateAttendance();
  const { data: employeesData } = useEmployees();
  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);
  const [date, setDate] = React.useState(todayStr);
  const [selections, setSelections] = React.useState<EmployeeSelection[]>([]);
  const [defaultStatus, setDefaultStatus] = React.useState<EmployeeSelection["status"]>("PRESENT");

  const employees = React.useMemo(() => {
    return employeesData?.employees || employeesData?.data || [];
  }, [employeesData]);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open && !prevOpen) {
    setDate(todayStr);
    setSelections([]);
    setDefaultStatus("PRESENT");
  }
  if (prevOpen !== open) {
    setPrevOpen(open);
  }

  const handleToggleEmployee = (empId: string, empName: string) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.employeeId === empId);
      if (exists) {
        return prev.filter((s) => s.employeeId !== empId);
      }
      return [...prev, { employeeId: empId, employeeName: empName, status: defaultStatus }];
    });
  };

  const handleStatusChange = (empId: string, status: EmployeeSelection["status"]) => {
    setSelections((prev) =>
      prev.map((s) => (s.employeeId === empId ? { ...s, status } : s))
    );
  };

  const handleSelectAll = () => {
    setSelections(
      employees.map((emp: { id: string; firstName: string; lastName: string }) => ({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        status: defaultStatus,
      }))
    );
  };

  const handleClearAll = () => {
    setSelections([]);
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (selections.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    try {
      const entries: BulkAttendanceEntry[] = selections.map((s) => ({
        employeeId: s.employeeId,
        status: s.status,
        checkIn: s.status !== "ABSENT"
          ? new Date(`${date}T09:00:00`).toISOString()
          : null,
        checkOut: null,
      }));

      const result = await bulkCreate.mutateAsync({ date: new Date(date).toISOString(), entries });

      toast.success(
        `Created ${result.created} records, ${result.skipped} skipped`
      );
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors occurred`);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Bulk creation failed");
    }
  };

  const isPending = bulkCreate.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-full bg-white border border-slate-200 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-500" />
            Bulk Attendance Entry
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Select employees and mark their attendance status for a specific date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-sm w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Default Status</Label>
              <select
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value as EmployeeSelection["status"])}
                className="h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
              >
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isPending}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={isPending || selections.length === 0}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
            {employees.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No employees found
              </div>
            ) : (
              employees.map((emp: { id: string; firstName: string; lastName: string }) => {
                const selected = selections.find((s) => s.employeeId === emp.id);
                return (
                  <div
                    key={emp.id}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      selected ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() =>
                          handleToggleEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-800">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </label>
                    {selected && (
                      <select
                        value={selected.status}
                        onChange={(e) =>
                          handleStatusChange(emp.id, e.target.value as EmployeeSelection["status"])
                        }
                        className="h-8 px-2 text-xs bg-white rounded border border-slate-200 focus:outline-hidden"
                      >
                        <option value="PRESENT">Present</option>
                        <option value="LATE">Late</option>
                        <option value="ABSENT">Absent</option>
                        <option value="HALF_DAY">Half Day</option>
                      </select>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {selections.length > 0 && (
            <div className="text-xs text-slate-500 font-medium">
              {selections.length} employee{selections.length > 1 ? "s" : ""} selected
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending || selections.length === 0}
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-w-[120px]"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            {isPending ? "Creating..." : `Create (${selections.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React from "react";
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
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
  date: string;
  status: "present" | "late" | "half_day" | "absent" | "on_leave";
}

type AttendanceStatus = "present" | "late" | "half_day" | "absent" | "on_leave";

interface EditAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
  dateFilter: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formValues: {
    checkIn: string;
    checkOut: string;
    status: AttendanceStatus;
    notes: string;
  };
  onFormChange: (values: {
    checkIn: string;
    checkOut: string;
    status: AttendanceStatus;
    notes: string;
  }) => void;
}

export const EditAttendanceDialog: React.FC<EditAttendanceDialogProps> = ({
  open,
  onOpenChange,
  record,
  dateFilter,
  onSubmit,
  formValues,
  onFormChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Manual Attendance Adjustment
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Override logs for {record?.employee?.firstName} {record?.employee?.lastName} on {dateFilter}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {/* Status input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Attendance Status</label>
            <select
              value={formValues.status}
              onChange={(e) => onFormChange({ ...formValues, status: e.target.value as AttendanceStatus })}
              className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          {/* Check-In and Check-Out Time Inputs */}
          {formValues.status !== "absent" && formValues.status !== "on_leave" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Check-In Time</label>
                <Input
                  type="time"
                  value={formValues.checkIn}
                  onChange={(e) => onFormChange({ ...formValues, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Check-Out Time</label>
                <Input
                  type="time"
                  value={formValues.checkOut}
                  onChange={(e) => onFormChange({ ...formValues, checkOut: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Reason/Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Adjustment Note / Remark</label>
            <Input
              placeholder="Forgot to clock-in / medical appointment..."
              value={formValues.notes}
              onChange={(e) => onFormChange({ ...formValues, notes: e.target.value })}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
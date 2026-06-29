"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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
import { Employee, SuspendEmployeeData } from "@/hooks/queries/hrms/employees/employees.types";

interface SuspendEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: SuspendEmployeeData) => void;
  isPending: boolean;
}

export function SuspendEmployeeModal({
  employee,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: SuspendEmployeeModalProps) {
  const [reason, setReason] = React.useState("");
  const [expectedReinstatement, setExpectedReinstatement] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setReason("");
      setExpectedReinstatement("");
      setNotes("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Suspension reason is required.");
      return;
    }
    if (trimmedReason.length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }

    onConfirm({
      reason: trimmedReason,
      expectedReinstatement: expectedReinstatement || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-full bg-white border border-slate-200 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Suspend Employee
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Suspending {fullName || "employee"} will restrict their access until reinstated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Read-only Employee info */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <Label className="text-[10px] font-semibold text-slate-400 uppercase">Employee Name</Label>
              <p className="text-sm font-semibold text-slate-800">{fullName || "—"}</p>
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-slate-400 uppercase">Employee ID</Label>
              <p className="text-sm font-semibold text-slate-800">{employee?.employeeCode || employee?.employeeId || "—"}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="suspend-reason" className="text-xs font-semibold text-slate-700">
              Reason <span className="text-rose-500">*</span>
            </Label>
            <textarea
              id="suspend-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this employee is being suspended (min 10 characters)..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Expected Reinstatement */}
          <div className="space-y-1.5">
            <Label htmlFor="expected-reinstatement" className="text-xs font-semibold text-slate-700">
              Expected Reinstatement Date
            </Label>
            <Input
              id="expected-reinstatement"
              type="date"
              value={expectedReinstatement}
              onChange={(e) => setExpectedReinstatement(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="suspend-notes" className="text-xs font-semibold text-slate-700">
              Additional Notes
            </Label>
            <textarea
              id="suspend-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional internal notes..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-md p-2">
              {error}
            </div>
          )}

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
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Confirm Suspend
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

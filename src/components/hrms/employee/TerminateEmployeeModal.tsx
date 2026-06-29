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
import { Employee, TerminateEmployeeData } from "@/hooks/queries/hrms/employees/employees.types";

interface TerminateEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: TerminateEmployeeData) => void;
  isPending: boolean;
}

export function TerminateEmployeeModal({
  employee,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: TerminateEmployeeModalProps) {
  const [lastWorkingDate, setLastWorkingDate] = React.useState("");
  const [reason, setReason] = React.useState<string>("RESIGNATION");
  const [reasonDetails, setReasonDetails] = React.useState("");
  const [noticePeriodServed, setNoticePeriodServed] = React.useState(false);
  const [finalSalaryProcessed, setFinalSalaryProcessed] = React.useState(false);

  // Exit Checklist items
  const [laptopReturned, setLaptopReturned] = React.useState(false);
  const [accessRevoked, setAccessRevoked] = React.useState(false);
  const [fnfSettled, setFnfSettled] = React.useState(false);
  const [relievingLetterIssued, setRelievingLetterIssued] = React.useState(false);
  const [exitInterviewDone, setExitInterviewDone] = React.useState(false);

  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      // Set to today's date by default
      const today = new Date().toISOString().split("T")[0];
      setLastWorkingDate(today);
      setReason("RESIGNATION");
      setReasonDetails("");
      setNoticePeriodServed(false);
      setFinalSalaryProcessed(false);
      setLaptopReturned(false);
      setAccessRevoked(false);
      setFnfSettled(false);
      setRelievingLetterIssued(false);
      setExitInterviewDone(false);
      setError("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!lastWorkingDate) {
      setError("Last working date is required.");
      return;
    }

    onConfirm({
      lastWorkingDate,
      reason: reason as any,
      reasonDetails: reasonDetails.trim() || undefined,
      noticePeriodServed,
      finalSalaryProcessed,
      exitChecklist: {
        laptopReturned,
        accessRevoked,
        fnfSettled,
        relievingLetterIssued,
        exitInterviewDone,
      },
    });
  };

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-full bg-white border border-slate-200 rounded-xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            Terminate Employee
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Terminating {fullName || "employee"} will change their status to Terminated and revoke system access.
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

          <div className="grid grid-cols-2 gap-4">
            {/* Last Working Date */}
            <div className="space-y-1.5">
              <Label htmlFor="last-working-date" className="text-xs font-semibold text-slate-700">
                Last Working Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="last-working-date"
                type="date"
                required
                value={lastWorkingDate}
                onChange={(e) => setLastWorkingDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label htmlFor="terminate-reason" className="text-xs font-semibold text-slate-700">
                Reason <span className="text-rose-500">*</span>
              </Label>
              <select
                id="terminate-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="RESIGNATION">Resignation</option>
                <option value="TERMINATION">Termination</option>
                <option value="RETIREMENT">Retirement</option>
                <option value="CONTRACT_END">Contract End</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <Label htmlFor="reason-details" className="text-xs font-semibold text-slate-700">
              Reason Details / Remarks
            </Label>
            <textarea
              id="reason-details"
              rows={2}
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="Provide additional details or notes about the termination..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Notice & Salary Options */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Payroll & Notice</h4>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noticePeriodServed}
                  onChange={(e) => setNoticePeriodServed(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Notice Period Served</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalSalaryProcessed}
                  onChange={(e) => setFinalSalaryProcessed(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Final Salary Processed</span>
              </label>
            </div>
          </div>

          {/* Exit Checklist */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Exit Checklist</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={laptopReturned}
                  onChange={(e) => setLaptopReturned(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700">Laptop/Assets Returned</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessRevoked}
                  onChange={(e) => setAccessRevoked(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700">System Access Revoked</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fnfSettled}
                  onChange={(e) => setFnfSettled(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700">Full & Final Settled</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={relievingLetterIssued}
                  onChange={(e) => setRelievingLetterIssued(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700">Relieving Letter Issued</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exitInterviewDone}
                  onChange={(e) => setExitInterviewDone(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700">Exit Interview Done</span>
              </label>
            </div>
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
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Confirm Terminate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

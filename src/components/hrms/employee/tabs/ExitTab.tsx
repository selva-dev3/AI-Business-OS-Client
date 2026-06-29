"use client";

import * as React from "react";
import { useTerminateEmployee } from "@/hooks/useEmployeeMutations";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LogOut,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeeProfile, TerminationDetails } from "@/types/hrms";
import { employeesKeys } from "@/hooks/queries/hrms/employees/employees.keys";
import { toast } from "sonner";

const TERMINATION_REASONS = [
  { value: "RESIGNATION", label: "Resignation" },
  { value: "TERMINATION", label: "Termination" },
  { value: "RETIREMENT", label: "Retirement" },
  { value: "CONTRACT_END", label: "Contract End" },
  { value: "OTHER", label: "Other" },
];

const CHECKLIST_ITEMS: { key: keyof NonNullable<TerminationDetails["exitChecklist"]>; label: string }[] = [
  { key: "laptopReturned", label: "Laptop returned" },
  { key: "accessRevoked", label: "Access revoked" },
  { key: "fnfSettled", label: "Full & final settlement done" },
  { key: "relievingLetterIssued", label: "Relieving letter issued" },
  { key: "exitInterviewDone", label: "Exit interview completed" },
];

export default function ExitTab({ employee }: { employee: EmployeeProfile }) {
  const qc = useQueryClient();
  const terminateMutation = useTerminateEmployee();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Form state
  const [lastWorkingDate, setLastWorkingDate] = React.useState("");
  const [reason, setReason] = React.useState("RESIGNATION");
  const [reasonDetails, setReasonDetails] = React.useState("");
  const [noticePeriodServed, setNoticePeriodServed] = React.useState(false);
  const [finalSalaryProcessed, setFinalSalaryProcessed] = React.useState(false);
  const [exitChecklist, setExitChecklist] = React.useState<Record<string, boolean>>({
    laptopReturned: false,
    accessRevoked: false,
    fnfSettled: false,
    relievingLetterIssued: false,
    exitInterviewDone: false,
  });

  const isTerminated = employee.status?.toLowerCase() === "terminated" || !!employee.terminationDetails;
  const terminationDetails = employee.terminationDetails;

  const resetForm = () => {
    setLastWorkingDate(new Date().toISOString().split("T")[0]);
    setReason("RESIGNATION");
    setReasonDetails("");
    setNoticePeriodServed(false);
    setFinalSalaryProcessed(false);
    setExitChecklist({
      laptopReturned: false,
      accessRevoked: false,
      fnfSettled: false,
      relievingLetterIssued: false,
      exitInterviewDone: false,
    });
  };

  const handleTerminate = async () => {
    if (!lastWorkingDate) {
      toast.error("Last working date is required");
      return;
    }
    try {
      await terminateMutation.mutateAsync({
        id: employee.id,
        data: {
          lastWorkingDate,
          reason: reason as any,
          reasonDetails: reasonDetails || undefined,
          noticePeriodServed,
          finalSalaryProcessed,
          exitChecklist: {
            laptopReturned: exitChecklist.laptopReturned,
            accessRevoked: exitChecklist.accessRevoked,
            fnfSettled: exitChecklist.fnfSettled,
            relievingLetterIssued: exitChecklist.relievingLetterIssued,
            exitInterviewDone: exitChecklist.exitInterviewDone,
          },
        },
      });
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: employeesKeys.detail(employee.id) });
    } catch {
      // handled by mutation
    }
  };

  // ── TERMINATED VIEW ─────────────────────────────────────────────────────────
  if (isTerminated && terminationDetails) {
    return (
      <div className="space-y-4 p-1">
        <Card className="border-rose-100 bg-rose-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Exit & Offboarding Details
            </CardTitle>
            <CardDescription className="text-xs text-rose-600">
              This employee has been offboarded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Termination Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ExitDetail icon={<CalendarDays className="h-4 w-4" />} label="Last Working Day" value={terminationDetails.lastWorkingDate} />
              <ExitDetail icon={<AlertTriangle className="h-4 w-4" />} label="Reason" value={terminationDetails.reason} />
              <ExitDetail icon={<CalendarDays className="h-4 w-4" />} label="Terminated At" value={terminationDetails.terminatedAt} />
            </div>
            {terminationDetails.reasonDetails && (
              <div className="text-xs text-slate-600 bg-white rounded-lg p-3 border">
                <span className="font-semibold text-slate-700">Reason Details: </span>
                {terminationDetails.reasonDetails}
              </div>
            )}

            {/* Exit Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Exit Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHECKLIST_ITEMS.map((item) => {
                  const done = terminationDetails.exitChecklist?.[item.key];
                  return (
                    <div key={item.key} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span className={done ? "text-slate-800" : "text-slate-400"}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── NOT TERMINATED VIEW ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4 p-1">
      <Card className="border-amber-100 bg-amber-50/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Offboarding
          </CardTitle>
          <CardDescription className="text-xs text-amber-600">
            This action is irreversible. Please ensure all approvals are obtained before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <LogOut className="h-4 w-4" /> Initiate Exit Process
          </Button>
        </CardContent>
      </Card>

      {/* Exit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Initiate Exit Process</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last Working Date *</Label>
                <Input type="date" value={lastWorkingDate} onChange={(e) => setLastWorkingDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Reason *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMINATION_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason Details (optional)</Label>
              <Textarea value={reasonDetails} onChange={(e) => setReasonDetails(e.target.value)} rows={2} />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="noticePeriod"
                  checked={noticePeriodServed}
                  onCheckedChange={(v: boolean | "indeterminate") => setNoticePeriodServed(v === true)}
                />
                <Label htmlFor="noticePeriod" className="text-xs">Notice period served</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="finalSalary"
                  checked={finalSalaryProcessed}
                  onCheckedChange={(v: boolean | "indeterminate") => setFinalSalaryProcessed(v === true)}
                />
                <Label htmlFor="finalSalary" className="text-xs">Final salary processed</Label>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Exit Checklist</h4>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Checkbox
                      id={item.key}
                      checked={!!exitChecklist[item.key]}
                      onCheckedChange={(v: boolean | "indeterminate") =>
                        setExitChecklist((prev) => ({ ...prev, [item.key]: v === true }))
                      }
                    />
                    <Label htmlFor={item.key} className="text-xs font-normal cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleTerminate}
              disabled={terminateMutation.isPending}
              className="gap-2"
            >
              {terminateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Confirm Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExitDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold text-slate-500">{label}</p>
        <p className="text-xs font-medium text-slate-800">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </p>
      </div>
    </div>
  );
}

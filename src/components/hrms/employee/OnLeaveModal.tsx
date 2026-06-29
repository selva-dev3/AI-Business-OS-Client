"use client";

import * as React from "react";
import { useInitiateLeave } from "@/hooks/useEmployeeMutations";
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
import { Button } from "@/components/ui/button";
import { TreePalm, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LEAVE_TYPES = [
  { value: "Casual", label: "Casual Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Earned", label: "Earned Leave" },
  { value: "Maternity", label: "Maternity Leave" },
  { value: "Paternity", label: "Paternity Leave" },
  { value: "Unpaid", label: "Unpaid Leave" },
];

interface OnLeaveModalProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function OnLeaveModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
  onSuccess,
}: OnLeaveModalProps) {
  const mutation = useInitiateLeave();

  const [leaveType, setLeaveType] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const resetForm = () => {
    setLeaveType(""); setStartDate(""); setEndDate(""); setReason(""); setNotes("");
  };

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error("Leave type, start date, end date, and reason are required");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }
    try {
      await mutation.mutateAsync({
        id: employeeId,
        data: {
          leaveTypeId: leaveType,
          startDate,
          endDate,
          reason,
          notes: notes || undefined,
        },
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePalm className="h-5 w-5 text-amber-500" />
            Initiate Leave — {employeeName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Medical leave" />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TreePalm className="h-4 w-4" />
            )}
            Initiate Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

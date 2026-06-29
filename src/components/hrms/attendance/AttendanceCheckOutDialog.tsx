"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AttendanceCheckOutForm } from "./AttendanceCheckOutForm";
import { useCheckOut } from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { CheckOutFormData } from "@/hooks/queries/hrms/attendance/attendance.types";

interface AttendanceCheckOutDialogProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
    employeeId?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function toLocalTimeString(date: Date): string {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function toLocalDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function AttendanceCheckOutDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: AttendanceCheckOutDialogProps) {
  const checkOutMutation = useCheckOut();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues = React.useMemo<CheckOutFormData>(() => {
    const d = new Date();
    return {
      employeeId: employee?.id || "",
      date: toLocalDateString(d),
      checkOut: toLocalTimeString(d),
      remarks: "",
    };
  }, [employee]);

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "";
  const employeeCode = employee?.employeeCode || employee?.employeeId || "";

  const handleSubmit = async (data: CheckOutFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const checkOutISO = new Date(`${data.date}T${data.checkOut}:00`).toISOString();

      await checkOutMutation.mutateAsync({
        employeeId: data.employeeId,
        date: new Date(data.date).toISOString(),
        checkOut: checkOutISO,
        notes: data.remarks || undefined,
      });

      toast.success(`${employeeName} checked out successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || "Failed to check out";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!isSubmitting) {
        onOpenChange(nextOpen);
      }
    }}>
      <DialogContent className="sm:max-w-md max-w-full bg-white border border-slate-200 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Attendance Check-Out
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Record check-out for {employeeName || "employee"}.
          </DialogDescription>
        </DialogHeader>

        <AttendanceCheckOutForm
          defaultValues={defaultValues}
          employeeName={employeeName}
          employeeCode={employeeCode}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

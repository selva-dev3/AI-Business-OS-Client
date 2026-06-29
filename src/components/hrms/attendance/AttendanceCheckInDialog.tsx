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
import { AttendanceCheckInForm } from "./AttendanceCheckInForm";
import { useCreateAttendance } from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { CheckInFormData } from "@/hooks/queries/hrms/attendance/attendance.types";

interface AttendanceCheckInDialogProps {
  employee: {
    id: string;
    _id?: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
    employeeId?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (checkInTime?: string) => void;
}

function toLocalTimeString(date: Date): string {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function toLocalDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function AttendanceCheckInDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: AttendanceCheckInDialogProps) {
  const createAttendance = useCreateAttendance();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues = React.useMemo<CheckInFormData>(() => {
    const d = new Date();
    return {
      employeeId: employee?.id || employee?._id || "",
      attendanceDate: toLocalDateString(d),
      checkIn: toLocalTimeString(d),
      attendanceType: "PRESENT",
      shift: "",
      workLocation: "",
      remarks: "",
    };
  }, [employee]);

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "";
  const employeeCode = employee?.employeeCode || employee?.employeeId || "";

  const handleSubmit = async (data: CheckInFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const checkInISO = new Date(`${data.attendanceDate}T${data.checkIn}:00`).toISOString();
      const dateISO = new Date(data.attendanceDate).toISOString();

      const remarksParts: string[] = [];
      if (data.shift) remarksParts.push(`Shift: ${data.shift}`);
      if (data.workLocation) remarksParts.push(`Location: ${data.workLocation}`);
      if (data.remarks) remarksParts.push(data.remarks);
      const combinedNotes = remarksParts.join(" | ");

      await createAttendance.mutateAsync({
        employeeId: data.employeeId,
        date: dateISO,
        status: data.attendanceType,
        checkIn: checkInISO,
        checkOut: null,
        notes: combinedNotes || null,
      });

      toast.success(`${employeeName} checked in successfully`);
      onOpenChange(false);
      onSuccess?.(checkInISO);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || "Failed to check in";
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
            Attendance Check-In
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Record check-in for {employeeName || "employee"}.
          </DialogDescription>
        </DialogHeader>

        <AttendanceCheckInForm
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

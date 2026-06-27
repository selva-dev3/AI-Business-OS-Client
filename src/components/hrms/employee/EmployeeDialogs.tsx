"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";

interface EmployeeDialogsProps {
  employee: Employee;
  // Deactivate
  isDeleteOpen: boolean;
  setIsDeleteOpen: (v: boolean) => void;
  onConfirmDelete: () => void;
  isDeletePending: boolean;
  // Activate
  isActivateOpen: boolean;
  setIsActivateOpen: (v: boolean) => void;
  onConfirmActivate: () => void;
  isActivatePending: boolean;
  // Permanent delete
  isPermanentDeleteOpen: boolean;
  setIsPermanentDeleteOpen: (v: boolean) => void;
  onConfirmPermanentDelete: () => void;
  isPermanentDeletePending: boolean;
}

export function EmployeeDialogs({
  employee,
  isDeleteOpen,
  setIsDeleteOpen,
  onConfirmDelete,
  isDeletePending,
  isActivateOpen,
  setIsActivateOpen,
  onConfirmActivate,
  isActivatePending,
  isPermanentDeleteOpen,
  setIsPermanentDeleteOpen,
  onConfirmPermanentDelete,
  isPermanentDeletePending,
}: EmployeeDialogsProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <>
      {/* Deactivate Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {fullName}? This will set their status to
              Inactive and record their exit date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isDeletePending}
            >
              {isDeletePending && (
                <Loader2 className="h-3 w-3 animate-spin text-white mr-1" />
              )}
              Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate {fullName}? This will restore their status to
              Active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsActivateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onConfirmActivate}
              disabled={isActivatePending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isActivatePending && (
                <Loader2 className="h-3 w-3 animate-spin text-white mr-1" />
              )}
              Confirm Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog open={isPermanentDeleteOpen} onOpenChange={setIsPermanentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600 font-bold">
              Permanently Delete Employee
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {fullName}? This will remove all their
              records (attendance, payslips, leaves, etc.) and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPermanentDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmPermanentDelete}
              disabled={isPermanentDeletePending}
            >
              {isPermanentDeletePending && (
                <Loader2 className="h-3 w-3 animate-spin text-white mr-1" />
              )}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
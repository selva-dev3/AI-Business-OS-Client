"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";

interface EmployeeActionBarProps {
  employee: Employee;
  isEditing: boolean;
  isSaving: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onMarkInactive: () => void;
  onActivate: () => void;
  onPermanentDelete: () => void;
}

export function EmployeeActionBar({
  employee,
  isEditing,
  isSaving,
  onBack,
  onEdit,
  onCancel,
  onSave,
  onMarkInactive,
  onActivate,
  onPermanentDelete,
}: EmployeeActionBarProps) {
  const isInactiveOrTerminated =
    employee?.status === "inactive" || employee?.status === "terminated";

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="gap-2 border-slate-200 text-slate-600 hover:text-indigo-650 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all rounded-lg"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Directory</span>
      </Button>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-white" />}
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {!isInactiveOrTerminated ? (
            <Button
              size="sm"
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              onClick={onMarkInactive}
            >
              Mark Inactive
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold"
                onClick={onActivate}
              >
                Activate Employee
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                onClick={onPermanentDelete}
              >
                Delete Profile
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
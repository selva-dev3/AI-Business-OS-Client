"use client";

import { Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";
import { getEmploymentTypeLabel } from "@/components/hrms/employee/types/employee-detail.utils";

interface EmploymentCardProps extends BaseCardProps {
  employeesList: Employee[];
}

export function EmploymentCard({
  employee,
  isEditing,
  editForm,
  setEditForm,
  employeesList,
}: EmploymentCardProps) {
  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-indigo-650" />
          <CardTitle className="text-sm font-bold text-slate-800">Employment Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-xs">
        {/* Employee Code — read-only always */}
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 font-medium">Employee Code</span>
          <span className="text-slate-900 font-mono font-bold text-indigo-600">
            {employee.employeeId || "No ID"}
          </span>
        </div>

        {/* Reporting Manager */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-slate-400 font-medium text-[10px]">Reporting Manager</Label>
          {isEditing ? (
            <select
              value={editForm.managerId}
              onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
            >
              <option value="">No direct reporting manager</option>
              {employeesList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-900 font-semibold">
              {employee.manager
                ? `${employee.manager.firstName} ${employee.manager.lastName}`
                : "No direct reporting manager"}
            </span>
          )}
        </div>

        {/* Employment Type */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-slate-400 font-medium text-[10px]">Employment Type</Label>
          {isEditing ? (
            <select
              value={editForm.employmentType}
              onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
            >
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Internship</option>
            </select>
          ) : (
            <span className="text-slate-900 font-semibold capitalize">
              {getEmploymentTypeLabel(employee.employmentType)}
            </span>
          )}
        </div>

        {/* Date of Joining — read-only */}
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-400 font-medium">Date of Joining</span>
          <span className="text-slate-900 font-semibold">
            {employee.dateOfJoining
              ? new Date(employee.dateOfJoining).toLocaleDateString()
              : "N/A"}
          </span>
        </div>

        {/* Profile Registered — read-only */}
        {employee.createdAt && (
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-medium">Profile Registered</span>
            <span className="text-slate-900 font-semibold">
              {new Date(employee.createdAt).toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
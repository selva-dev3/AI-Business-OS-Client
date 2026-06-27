"use client";

import { User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";

export function PersonalInfoCard({ employee, isEditing, editForm, setEditForm }: BaseCardProps) {
  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-indigo-650" />
          <CardTitle className="text-sm font-bold text-slate-800">Personal Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-400 font-medium text-[10px]">Date of Birth</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                className="h-8 text-xs font-semibold"
              />
            ) : (
              <span className="text-slate-900 font-semibold">
                {employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </span>
            )}
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-400 font-medium text-[10px]">Gender</Label>
            {isEditing ? (
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <span className="text-slate-900 font-semibold capitalize">
                {employee.gender || "N/A"}
              </span>
            )}
          </div>

          {/* Blood Group */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-400 font-medium text-[10px]">Blood Group</Label>
            {isEditing ? (
              <Input
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                placeholder="Blood Group"
                className="h-8 text-xs font-semibold uppercase"
              />
            ) : (
              <span className="text-slate-900 font-semibold uppercase">
                {employee.bloodGroup || "N/A"}
              </span>
            )}
          </div>

          {/* Marital Status */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-400 font-medium text-[10px]">Marital Status</Label>
            {isEditing ? (
              <select
                value={editForm.maritalStatus}
                onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            ) : (
              <span className="text-slate-900 font-semibold capitalize">
                {employee.maritalStatus || "N/A"}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { HeartPulse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";

interface EmergencyContactCardProps extends BaseCardProps {
  onStartEdit: () => void;
}

export function EmergencyContactCard({
  employee,
  isEditing,
  editForm,
  setEditForm,
  onStartEdit,
}: EmergencyContactCardProps) {
  const hasEmergencyContact = !!(
    employee?.emergencyContact?.name ||
    employee?.emergencyContact?.relation ||
    employee?.emergencyContact?.phone
  );

  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4.5 w-4.5 text-indigo-650" />
          <CardTitle className="text-sm font-bold text-slate-800">Emergency Contact</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-xs">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <Label className="text-slate-400 font-medium text-[10px]">Primary Nominee</Label>
              <Input
                value={editForm.emergencyName}
                onChange={(e) => setEditForm({ ...editForm, emergencyName: e.target.value })}
                placeholder="Contact Name"
                className="h-8 text-xs font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">Relationship</Label>
                <Input
                  value={editForm.emergencyRelation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, emergencyRelation: e.target.value })
                  }
                  placeholder="Relationship"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">Phone Number</Label>
                <Input
                  value={editForm.emergencyPhone}
                  onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                  placeholder="Phone Number"
                  className="h-8 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        ) : hasEmergencyContact ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-medium">Primary Nominee</span>
              <span className="text-slate-900 font-semibold">
                {employee.emergencyContact?.name || "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Relationship</span>
                <span className="text-slate-900 font-semibold capitalize">
                  {employee.emergencyContact?.relation || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <span className="text-slate-900 font-semibold select-all">
                  {employee.emergencyContact?.phone || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <p className="text-slate-400 text-xs">No details added yet.</p>
            <Button size="sm" variant="outline" onClick={onStartEdit}>
              + Add Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
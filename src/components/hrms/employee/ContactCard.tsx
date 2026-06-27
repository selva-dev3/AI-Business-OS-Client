"use client";

import { Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";

export function ContactCard({ employee, isEditing, editForm, setEditForm }: BaseCardProps) {
  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Mail className="h-4.5 w-4.5 text-indigo-650" />
          <CardTitle className="text-sm font-bold text-slate-800">Contact Channels</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-xs">
        {[
          { label: "Work Email", field: "email" as const, placeholder: "Work Email" },
          { label: "Personal Email", field: "personalEmail" as const, placeholder: "Personal Email" },
          { label: "Mobile Phone", field: "phone" as const, placeholder: "Mobile Phone" },
          { label: "Alternate Phone", field: "alternatePhone" as const, placeholder: "Alternate Phone" },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <Label className="text-slate-400 font-medium text-[10px]">{label}</Label>
            {isEditing ? (
              <Input
                value={editForm[field]}
                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                placeholder={placeholder}
                className="h-8 text-xs font-semibold"
              />
            ) : (
              <span className="text-slate-900 font-semibold select-all">
                {(employee as any)[field] || "N/A"}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
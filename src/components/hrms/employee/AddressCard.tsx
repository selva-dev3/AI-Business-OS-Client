"use client";

import { MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";

export function AddressCard({ employee, isEditing, editForm, setEditForm }: BaseCardProps) {
  const hasAddress = !!(employee.address || employee.city || employee.state);

  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <MapPin className="h-4.5 w-4.5 text-indigo-650" />
          <CardTitle className="text-sm font-bold text-slate-800">Primary Address</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-xs">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <Label className="text-slate-400 font-medium text-[10px]">Street</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Street address"
                className="h-8 text-xs font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  placeholder="City"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">State</Label>
                <Input
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  placeholder="State"
                  className="h-8 text-xs font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">Country</Label>
                <Input
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  placeholder="Country"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">Zip Code</Label>
                <Input
                  value={editForm.zipCode}
                  onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                  placeholder="Zip Code"
                  className="h-8 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        ) : hasAddress ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-medium">Street</span>
              <span className="text-slate-900 font-semibold leading-relaxed">
                {employee.address || "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">City & State</span>
                <span className="text-slate-900 font-semibold">
                  {employee.city || ""}
                  {employee.city && employee.state ? ", " : ""}
                  {employee.state || ""}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Country & Zip</span>
                <span className="text-slate-900 font-semibold">
                  {employee.country || "USA"} {employee.zipCode || ""}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 font-medium">
            No address register recorded.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
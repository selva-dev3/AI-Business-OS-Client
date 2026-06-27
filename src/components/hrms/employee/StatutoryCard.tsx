"use client";

import { useState } from "react";
import { FileText, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";
import { maskPanNumber, maskAadharNumber } from "@/components/hrms/employee/types/employee-detail.utils";

export function StatutoryCard({ employee, isEditing, editForm, setEditForm }: BaseCardProps) {
  const [showPan, setShowPan] = useState(false);
  const [showAadhar, setShowAadhar] = useState(false);

  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-indigo-650" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Statutory Identification
            </CardTitle>
          </div>
          <Badge className="bg-amber-50/80 text-amber-700 font-semibold border border-amber-200/50 text-[10px] rounded-md px-2 py-0.5 flex items-center gap-1 select-none">
            <span>⚠</span> Sensitive — Restricted Access
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-xs">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-slate-400 font-medium text-[10px]">PAN Card Number</Label>
              <Input
                value={editForm.panNumber}
                onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                placeholder="e.g. ABCDE1234F"
                className="h-8 text-xs font-semibold uppercase font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-slate-400 font-medium text-[10px]">
                Aadhar Identity Number
              </Label>
              <Input
                value={editForm.aadharNumber}
                onChange={(e) => setEditForm({ ...editForm, aadharNumber: e.target.value })}
                placeholder="12-digit Aadhar"
                className="h-8 text-xs font-semibold font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PAN */}
            <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium">PAN Card Number</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-mono font-bold tracking-wider uppercase">
                  {showPan
                    ? employee.panNumber || "Not Provided"
                    : maskPanNumber(employee.panNumber)}
                </span>
                {employee.panNumber && (
                  <button
                    type="button"
                    onClick={() => setShowPan(!showPan)}
                    className="text-slate-400 hover:text-indigo-650 transition-colors"
                  >
                    {showPan ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Aadhar */}
            <div className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium">Aadhar Identity Number</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-mono font-bold tracking-wider">
                  {showAadhar
                    ? employee.aadharNumber || "Not Provided"
                    : maskAadharNumber(employee.aadharNumber)}
                </span>
                {employee.aadharNumber && (
                  <button
                    type="button"
                    onClick={() => setShowAadhar(!showAadhar)}
                    className="text-slate-400 hover:text-indigo-650 transition-colors"
                  >
                    {showAadhar ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
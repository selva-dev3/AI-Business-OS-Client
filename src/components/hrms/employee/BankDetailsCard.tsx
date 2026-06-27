"use client";

import { useState } from "react";
import { CreditCard, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCardProps } from "@/components/hrms/employee/types/employee-detail.types";
import { maskAccountNumber } from "@/components/hrms/employee/types/employee-detail.utils";

interface BankDetailsCardProps extends BaseCardProps {
  onStartEdit: () => void;
}

export function BankDetailsCard({
  employee,
  isEditing,
  editForm,
  setEditForm,
  onStartEdit,
}: BankDetailsCardProps) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const hasBankDetails = !!(
    employee?.bankDetails?.bankName ||
    employee?.bankDetails?.accountNumber ||
    employee?.bankDetails?.ifscCode
  );

  return (
    <Card className="border-slate-100 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-indigo-650" />
            <CardTitle className="text-sm font-bold text-slate-800">Bank Account Details</CardTitle>
          </div>
          <Badge className="bg-amber-50/80 text-amber-700 font-semibold border border-amber-200/50 text-[10px] rounded-md px-2 py-0.5 flex items-center gap-1 select-none">
            <span>⚠</span> Sensitive — Restricted Access
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3.5 text-xs">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <Label className="text-slate-400 font-medium text-[10px]">Bank Name</Label>
              <Input
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                placeholder="Bank Name"
                className="h-8 text-xs font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">Account Number</Label>
                <Input
                  value={editForm.accountNumber}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  placeholder="Account Number"
                  className="h-8 text-xs font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-400 font-medium text-[10px]">IFSC Code</Label>
                <Input
                  value={editForm.ifscCode}
                  onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value })}
                  placeholder="IFSC Code"
                  className="h-8 text-xs font-semibold font-mono uppercase"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-slate-400 font-medium text-[10px]">Account Type</Label>
              <select
                value={editForm.accountType}
                onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value })}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-hidden focus:ring-1 focus:ring-ring text-slate-900 font-semibold"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
          </div>
        ) : hasBankDetails ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-medium">Bank Name</span>
              <span className="text-slate-900 font-bold">
                {employee.bankDetails?.bankName || "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Account Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-mono font-semibold">
                    {showAccountNumber
                      ? employee.bankDetails?.accountNumber || "N/A"
                      : maskAccountNumber(employee.bankDetails?.accountNumber)}
                  </span>
                  {employee.bankDetails?.accountNumber && (
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="text-slate-400 hover:text-indigo-650 transition-colors"
                    >
                      {showAccountNumber ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">IFSC Code</span>
                <span className="text-slate-900 font-mono font-semibold uppercase">
                  {employee.bankDetails?.ifscCode || "N/A"}
                </span>
              </div>
            </div>
            {employee.bankDetails?.accountType && (
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Account Type</span>
                <span className="text-slate-900 font-semibold capitalize">
                  {employee.bankDetails.accountType}
                </span>
              </div>
            )}
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
"use client";

import * as React from "react";
import { ArrowLeft, Mail, Phone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EmployeeProfile } from "@/types/hrms";
import { EmployeeActionsMenu } from "./EmployeeActionsMenu";

function getInitials(first: string, last: string) {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "inactive":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "on_leave":
    case "on leave":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "suspended":
      return "bg-red-50 text-red-700 border-red-200";
    case "terminated":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getTypeLabel(type?: string) {
  const map: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
    intern: "Intern",
  };
  return map[type?.toLowerCase() || ""] || type || "N/A";
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function CopyableText({ text, label }: { text?: string; label: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);
  if (!text) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className="font-medium text-slate-700">{text}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        }}
        className="text-slate-400 hover:text-indigo-600 transition-colors"
        title="Copy"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

export function EmployeeHeader({
  employee,
  onBack,
  onEmployeeUpdate,
}: {
  employee: EmployeeProfile;
  onBack: () => void;
  onEmployeeUpdate: () => void;
}) {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const empCode = employee.employeeId || employee.employeeCode || "N/A";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Back button + actions */}
        <div className="flex items-center justify-between md:hidden">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-16 w-16 rounded-full bg-indigo-50 border border-slate-200">
            <AvatarImage src={employee.avatar} alt={fullName} />
            <AvatarFallback className="text-indigo-700 bg-indigo-50 text-lg font-bold">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {empCode}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {employee.designation && (
                <span className="text-sm text-slate-600 font-medium">{employee.designation}</span>
              )}
              {employee.department && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold capitalize"
                  style={{
                    borderColor: employee.department.color || "#e2e8f0",
                    color: employee.department.color || "#64748b",
                    background: `${employee.department.color || "#f1f5f9"}15`,
                  }}
                >
                  {employee.department.name}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Badge variant="outline" className={`text-[10px] font-bold capitalize ${getStatusColor(employee.status)}`}>
                {employee.status}
              </Badge>
              <span className="text-xs text-slate-500 font-medium">{getTypeLabel(employee.employmentType)}</span>
              <span className="text-xs text-slate-400">Joined {formatDate(employee.dateOfJoining)}</span>
            </div>
          </div>
        </div>

        {/* Right: Contact + Actions */}
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <CopyableText text={employee.email} label={<Mail className="h-3.5 w-3.5" />} />
            <CopyableText text={employee.phone} label={<Phone className="h-3.5 w-3.5" />} />
          </div>
          {employee.manager && (
            <div className="text-xs text-slate-500">
              Reports to:{" "}
              <a href={`/hrms/employees/${employee.manager.id}`} className="text-indigo-600 hover:underline font-medium">
                {employee.manager.firstName} {employee.manager.lastName}
              </a>
            </div>
          )}
          <EmployeeActionsMenu employee={employee} onUpdate={onEmployeeUpdate} />
        </div>
      </div>
    </div>
  );
}

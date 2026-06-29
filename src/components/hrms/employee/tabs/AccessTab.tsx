"use client";

import * as React from "react";
import { useResetPassword } from "@/hooks/useEmployeeMutations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Key, Mail, Shield, Clock, Send, Loader2 } from "lucide-react";
import { EmployeeProfile } from "@/types/hrms";
import { ResetPasswordResponse } from "@/hooks/queries/hrms/employees/employees.types";

export default function AccessTab({ employee }: { employee: EmployeeProfile }) {
  const resetMutation = useResetPassword();

  return (
    <div className="space-y-4 p-1">
      {/* System Access */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" />
            System Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AccessDetail
              icon={<Mail className="h-4 w-4" />}
              label="Login Email"
              value={employee.email}
            />
            <AccessDetail
              icon={<Clock className="h-4 w-4" />}
              label="Last Login"
              value={employee.userId ? "—" : "Not available"}
            />
            <AccessDetail
              icon={<Shield className="h-4 w-4" />}
              label="Account Status"
              value={employee.status}
              valueClass={
                employee.status?.toLowerCase() === "active"
                  ? "text-emerald-600"
                  : employee.status?.toLowerCase() === "suspended"
                  ? "text-amber-600"
                  : "text-slate-600"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-600" />
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionButton
            icon={<Send className="h-4 w-4" />}
            title="Send Password Reset Email"
            description="Send the employee a link to reset their password. The link expires after a set duration."
            onClick={() =>
              resetMutation.mutate({ id: employee.id, data: { action: "reset_password", notifyEmployee: true } })
            }
            isPending={resetMutation.isPending}
          />

          <Separator />

          <ActionButton
            icon={<Mail className="h-4 w-4" />}
            title="Resend Welcome / Invite Email"
            description="Resend the initial welcome email with account setup instructions."
            onClick={() =>
              resetMutation.mutate({ id: employee.id, data: { action: "resend_invite", notifyEmployee: true } })
            }
            isPending={resetMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AccessDetail({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold text-slate-500">{label}</p>
        <p className={`text-xs font-medium text-slate-800 ${valueClass || ""}`}>{value || "—"}</p>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
  isPending,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="text-slate-400 mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-medium text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onClick} disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
      </Button>
    </div>
  );
}

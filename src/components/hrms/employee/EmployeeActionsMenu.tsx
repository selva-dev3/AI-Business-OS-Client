"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Edit,
  OctagonAlert,
  TreePalm,
  Key,
  AlertTriangle,
  Trash2,
  FileDown,
  Ban,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { EmployeeProfile } from "@/types/hrms";
import {
  useSuspendEmployee,
  useReinstateEmployee,
  useTerminateEmployee,
  useResetPassword,
} from "@/hooks/useEmployeeMutations";
import { SuspendEmployeeModal } from "@/components/hrms/employee/SuspendEmployeeModal";
import { TerminateEmployeeModal } from "@/components/hrms/employee/TerminateEmployeeModal";
import { OnLeaveModal } from "@/components/hrms/employee/OnLeaveModal";

export function EmployeeActionsMenu({
  employee,
  onUpdate,
}: {
  employee: EmployeeProfile;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toLowerCase?.() || "";
  const isAdmin = role.includes("admin") || role === "super admin";
  const isHrManager = role.includes("hr_manager") || isAdmin;

  const suspendMutation = useSuspendEmployee();
  const reinstateMutation = useReinstateEmployee();
  const terminateMutation = useTerminateEmployee();
  const resetPasswordMutation = useResetPassword();

  const [suspendOpen, setSuspendOpen] = React.useState(false);
  const [terminateOpen, setTerminateOpen] = React.useState(false);
  const [onLeaveOpen, setOnLeaveOpen] = React.useState(false);

  const status = employee.status?.toLowerCase() || "";

  const handleReinstate = async () => {
    try {
      await reinstateMutation.mutateAsync({ id: employee.id, data: {} });
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reinstate");
    }
  };

  const handleSendReset = async () => {
    try {
      await resetPasswordMutation.mutateAsync({
        id: employee.id,
        data: { action: "reset_password", notifyEmployee: true },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MoreVertical className="h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => /* TODO: open edit sheet */ toast.info("Edit coming soon")}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {isHrManager && status === "active" && (
            <DropdownMenuItem onClick={() => setSuspendOpen(true)}>
              <OctagonAlert className="mr-2 h-4 w-4 text-amber-500" />
              Suspend Employee
            </DropdownMenuItem>
          )}
          {isHrManager && status === "suspended" && (
            <DropdownMenuItem onClick={handleReinstate}>
              <OctagonAlert className="mr-2 h-4 w-4 text-emerald-500" />
              Reinstate Employee
            </DropdownMenuItem>
          )}
          {isHrManager && status === "active" && (
            <DropdownMenuItem onClick={() => setOnLeaveOpen(true)}>
              <TreePalm className="mr-2 h-4 w-4 text-amber-500" />
              Put On Leave
            </DropdownMenuItem>
          )}
          {isHrManager && status !== "terminated" && (
            <DropdownMenuItem onClick={handleSendReset}>
              <Key className="mr-2 h-4 w-4 text-slate-500" />
              Reset Password
            </DropdownMenuItem>
          )}

          {isAdmin && status !== "terminated" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTerminateOpen(true)}>
                <AlertTriangle className="mr-2 h-4 w-4 text-rose-500" />
                Terminate Employee
              </DropdownMenuItem>
            </>
          )}

          {isAdmin && (
            <DropdownMenuItem
              onClick={() => toast.info("Permanent delete coming soon")}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <Trash2 className="mr-2 h-4 w-4 text-rose-500" />
              Permanent Delete
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.info("Export PDF coming soon")}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Profile PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SuspendEmployeeModal
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeCode: employee.employeeId || employee.employeeCode || "",
          employeeId: employee.employeeId || employee.employeeCode || "",
          email: employee.email,
          status: employee.status as any,
          // satisfy remaining required fields with safe defaults
          ...((employee as unknown as Record<string, unknown>) || {}),
          designation: employee.designation || "",
        } as any}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        onConfirm={async (data) => {
          try {
            await suspendMutation.mutateAsync({ id: employee.id, data });
            setSuspendOpen(false);
            onUpdate();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to suspend");
          }
        }}
        isPending={suspendMutation.isPending}
      />

      <OnLeaveModal
        employeeId={employee.id}
        employeeName={`${employee.firstName} ${employee.lastName}`}
        open={onLeaveOpen}
        onOpenChange={setOnLeaveOpen}
        onSuccess={onUpdate}
      />

      <TerminateEmployeeModal
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeCode: employee.employeeId || employee.employeeCode || "",
          employeeId: employee.employeeId || employee.employeeCode || "",
          email: employee.email,
          status: employee.status as any,
          // satisfy remaining required fields with safe defaults
          ...((employee as unknown as Record<string, unknown>) || {}),
          designation: employee.designation || "",
        } as any}
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        onConfirm={async (data) => {
          try {
            await terminateMutation.mutateAsync({ id: employee.id, data });
            setTerminateOpen(false);
            onUpdate();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to terminate");
          }
        }}
        isPending={terminateMutation.isPending}
      />
    </>
  );
}

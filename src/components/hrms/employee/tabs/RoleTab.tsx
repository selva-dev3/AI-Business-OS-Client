"use client";

import * as React from "react";
import { useAssignRole } from "@/hooks/useEmployeeMutations";
import { useHistory } from "@/hooks/useEmployeeTabData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Building,
  User,
  CalendarDays,
  ChevronRight,
  History,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeeProfile } from "@/types/hrms";
import { EmployeeHistoryItem } from "@/hooks/queries/hrms/employees/employees.types";
import { toast } from "sonner";

const REASONS = ["Promotion", "Demotion", "Transfer", "Role Change", "Department Change", "Other"];
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "intern"];

export default function RoleTab({ employee }: { employee: EmployeeProfile }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const assignMutation = useAssignRole();
  const { data: fullHistory, isLoading: historyLoading, isError: historyError, refetch: refetchHistory } = useHistory(employee.id, historyOpen);

  // Form state
  const [designation, setDesignation] = React.useState("");
  const [deptId, setDeptId] = React.useState("");
  const [empType, setEmpType] = React.useState("full_time");
  const [managerId, setManagerId] = React.useState("");
  const [effectiveDate, setEffectiveDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const resetForm = () => {
    setDesignation(""); setDeptId(""); setEmpType("full_time");
    setManagerId(""); setEffectiveDate(""); setReason(""); setNotes("");
  };

  const openChange = () => {
    setDesignation(employee.designation || "");
    setDeptId(employee.departmentId || "");
    setEmpType(employee.employmentType || "full_time");
    setManagerId(employee.managerId || "");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
    setReason("");
    setNotes("");
    setDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!effectiveDate || !reason) {
      toast.error("Effective date and reason are required");
      return;
    }
    try {
      await assignMutation.mutateAsync({
        id: employee.id,
        data: {
          designation: designation || undefined,
          departmentId: deptId || undefined,
          employmentType: empType,
          reportingManagerId: managerId || undefined,
          effectiveDate,
          reason,
          notes: notes || undefined,
        },
      });
      setDialogOpen(false);
    } catch {
      // handled by mutation
    }
  };

  const roleHistory = employee.roleHistory ?? [];

  return (
    <div className="space-y-4 p-1">
      {/* Current Role */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-600" />
            Current Role
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4 mr-1" /> History
            </Button>
            <Button size="sm" variant="outline" onClick={openChange}>
              Change Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RoleDetail icon={<Briefcase className="h-4 w-4" />} label="Designation" value={employee.designation} />
            <RoleDetail icon={<Building className="h-4 w-4" />} label="Department" value={employee.department?.name} />
            <RoleDetail icon={<User className="h-4 w-4" />} label="Employment Type" value={formatEmpType(employee.employmentType)} />
            <RoleDetail icon={<User className="h-4 w-4" />} label="Reports To" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "N/A"} />
          </div>
        </CardContent>
      </Card>

      {/* Role History Timeline */}
      {roleHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              Role History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 relative">
              {roleHistory
                .slice()
                .reverse()
                .map((item, idx) => {
                  const isLast = idx === roleHistory.length - 1;
                  return (
                    <div key={idx} className="relative flex gap-4 pb-4">
                      {!isLast && (
                        <span className="absolute left-[5px] top-5 bottom-0 w-px bg-indigo-100" />
                      )}
                      <span className="relative mt-1 h-3 w-3 rounded-full bg-indigo-400 ring-2 ring-white shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500">
                          {item.changedAt ? new Date(item.changedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                        </p>
                        <p className="text-xs font-medium text-slate-800">
                          {item.reason || "Role Change"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.designation && `Designation: ${item.designation}`}
                          {item.departmentId && ` · Dept: ${item.departmentId}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {roleHistory.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Briefcase className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium">No role history recorded</p>
        </div>
      )}

      {/* Full History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              Employee Change History
            </DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : historyError ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <AlertTriangle className="h-8 w-8 mx-auto text-rose-400" />
              <p className="text-sm">Failed to load history</p>
              <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                <RefreshCw className="h-4 w-4 mr-1" /> Retry
              </Button>
            </div>
          ) : !fullHistory || fullHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm font-medium">No history records found</p>
            </div>
          ) : (
            <div className="space-y-0 relative py-4">
              {(fullHistory as EmployeeHistoryItem[])
                .map((item, idx) => {
                  const isLast = idx === (fullHistory as EmployeeHistoryItem[]).length - 1;
                  const changeLabel = formatChangeType(item.changeType);
                  const from = item.oldValue || (item.oldDesignationId as any)?.name || (item.oldDepartmentId as any)?.name;
                  const to = item.newValue || (item.newDesignationId as any)?.name || (item.newDepartmentId as any)?.name;
                  return (
                    <div key={item.id || idx} className="relative flex gap-4 pb-5">
                      {!isLast && (
                        <span className="absolute left-[5px] top-5 bottom-0 w-px bg-indigo-100" />
                      )}
                      <span className="relative mt-1 h-3 w-3 rounded-full bg-indigo-400 ring-2 ring-white shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{changeLabel}</Badge>
                          <span className="text-[10px] text-slate-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        {from && to && (
                          <p className="text-xs text-slate-700 mt-1">
                            <span className="line-through text-slate-400">{from}</span>
                            <ChevronRight className="h-3 w-3 inline mx-1 text-slate-300" />
                            <span className="font-medium text-slate-800">{to}</span>
                          </p>
                        )}
                        {item.reason && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                        )}
                        {item.changedBy && typeof item.changedBy === "object" && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            by {item.changedBy.firstName} {item.changedBy.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Department ID</Label>
                <Input value={deptId} onChange={(e) => setDeptId(e.target.value)} placeholder="dept-id" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={empType} onValueChange={setEmpType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{formatEmpType(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reporting Manager ID</Label>
                <Input value={managerId} onChange={(e) => setManagerId(e.target.value)} placeholder="manager-id" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective Date *</Label>
                <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Reason *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? "Saving..." : "Save Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div>
        <p className="text-[10px] text-slate-500 font-semibold">{label}</p>
        <p className="text-xs font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function formatEmpType(type?: string) {
  const map: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
    intern: "Intern",
  };
  return map[type?.toLowerCase() || ""] || type || "—";
}

function formatChangeType(type?: string) {
  const map: Record<string, string> = {
    DESIGNATION_CHANGE: "Designation Change",
    DEPARTMENT_CHANGE: "Department Change",
    BRANCH_CHANGE: "Branch Change",
    PROMOTION: "Promotion",
    TRANSFER: "Transfer",
    STATUS_CHANGE: "Status Change",
    SALARY_CHANGE: "Salary Change",
    OTHER: "Other",
  };
  return map[type || ""] || type || "Change";
}

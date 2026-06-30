"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useRegularizationDetails, useApproveRejectRegularization } from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { useDepartments } from "@/hooks/queries/hrms/departments/departments.hooks";


export default function RegularizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params?.id as string;

  const { data: serverRecord, isLoading, isError, refetch } = useRegularizationDetails(id);
  const { data: dbDepartments } = useDepartments();
  const departments = dbDepartments || [];

  const record = React.useMemo(() => {
    if (!serverRecord) return null;
    return (serverRecord as any).data || serverRecord;
  }, [serverRecord]);

  const approveRejectMutation = useApproveRejectRegularization();

  // Confirmation modal states
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<"approve" | "reject" | null>(null);
  const [confirmComments, setConfirmComments] = React.useState("");

  const handleApprove = () => {
    setConfirmType("approve");
    setConfirmComments("");
    setIsConfirmOpen(true);
  };

  const handleReject = () => {
    setConfirmType("reject");
    setConfirmComments("");
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmType) return;
    if (confirmType === "reject" && !confirmComments.trim()) {
      toast.error("Rejection comments are required.");
      return;
    }

    try {
      await approveRejectMutation.mutateAsync({
        id,
        data: {
          status: confirmType === "approve" ? "APPROVED" : "REJECTED",
          comments: confirmComments.trim() || (confirmType === "approve" ? "Approved by Manager/Admin" : ""),
        },
      });
      toast.success(
        confirmType === "approve"
          ? "Regularization request approved successfully!"
          : "Regularization request rejected successfully!"
      );
      setIsConfirmOpen(false);
      refetch();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to process regularization request");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">Pending</Badge>;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; // Handle plain hh:mm if any
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLong = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Clock className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 mt-3 animate-pulse">Loading regularization details...</p>
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/hrms/attendance")} className="gap-2 text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Back to Logs
        </Button>
        <Card className="border-rose-100 bg-rose-50/20">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Regularization Request Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t retrieve the regularization details for ID &quot;{id}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const emp = record.employee || record.employeeId;
  const deptName = departments.find((d: any) => d.id === emp?.departmentId || d._id === emp?.departmentId)?.name || "Corporate";
  const initials = emp ? `${emp.firstName?.charAt(0) || ""}${emp.lastName?.charAt(0) || ""}`.toUpperCase() || "EM" : "EM";

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/hrms/attendance")}
            className="h-9 w-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Regularization Request</span>
              {getStatusBadge(record.status)}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {formatDateLong(record.date)}
            </h1>
          </div>
        </div>

        {record.status === "PENDING" && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReject}
              variant="outline"
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 rounded-lg px-4"
            >
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button
              onClick={handleApprove}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4"
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Employee Info Card */}
        <Card className="border border-slate-200/80 shadow-sm md:col-span-1 rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 border-2 border-indigo-100 bg-indigo-50">
                <AvatarFallback className="text-xl text-indigo-700 font-extrabold bg-indigo-50">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-base font-bold text-slate-950 mt-3">
                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                <Building className="h-3.5 w-3.5 text-indigo-500" /> {deptName}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Employee ID
                </span>
                <span className="font-semibold text-slate-800 text-xs bg-slate-100/80 px-2 py-0.5 rounded">
                  {emp?.employeeCode || (record.employeeId as string).substring(0, 8)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" /> Designation
                </span>
                <span className="font-semibold text-slate-800 text-xs">
                  {emp?.designation || "Not Configured"}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-50 pt-3">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Contact Email</span>
                <span className="text-slate-700 text-xs font-semibold break-all">
                  {emp?.email || "No Email Provided"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Columns: Comparison Grid & Status Card */}
        <div className="md:col-span-2 space-y-6">
          {/* Correction Comparison Card */}
          <Card className="border border-slate-200/80 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Correction Request Comparison</CardTitle>
              <CardDescription>Review the differences between original logs and requested values.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Original Values Panel */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Original Timesheet
                  </span>
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Check In</span>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {formatTime(record.originalCheckIn)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Check Out</span>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {formatTime(record.originalCheckOut)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requested Correction Panel */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-500 animate-pulse" /> Requested Values
                  </span>
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[10px] text-indigo-500 font-bold uppercase">Requested Check In</span>
                      <p className="text-sm font-bold text-indigo-950 mt-0.5">
                        {formatTime(record.checkIn)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-500 font-bold uppercase">Requested Check Out</span>
                      <p className="text-sm font-bold text-indigo-950 mt-0.5">
                        {formatTime(record.checkOut)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason for Correction */}
              <div className="mt-6 border-t border-slate-100 pt-5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Reason for Correction
                </span>
                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 p-4 rounded-lg italic">
                  &ldquo;{record.reason || "No reason specified."}&rdquo;
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Log History */}
          <Card className="border border-slate-200/80 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" /> Approval Comments & Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {record.status !== "PENDING" ? (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/50 pb-2">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Processed By:</span>
                      <span>
                        {record.approvedBy
                          ? `${record.approvedBy.firstName} ${record.approvedBy.lastName}`
                          : "Manager/Admin"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">On:</span>{" "}
                      {record.approvedAt ? new Date(record.approvedAt).toLocaleString() : new Date(record.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Remarks Comments</span>
                    <p className="text-slate-700 italic font-medium">
                      &ldquo;{record.comments || "No process comments left."}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-lg">
                  This request is currently pending review by HR Managers/Admins.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">Submitted On</span>
                  <span className="text-slate-700 font-semibold">
                    {record.createdAt ? new Date(record.createdAt).toLocaleString() : "--"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">Last Updated On</span>
                  <span className="text-slate-700 font-semibold">
                    {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "--"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog with Comments Box */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {confirmType === "approve" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Approve Regularization Request
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-rose-600" /> Reject Regularization Request
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              {confirmType === "approve"
                ? "This will accept the requested times and automatically update the corresponding actual Attendance Record."
                : "This will decline the request. You must provide rejection feedback reasons."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Remarks / Comments {confirmType === "reject" && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                value={confirmComments}
                onChange={(e) => setConfirmComments(e.target.value)}
                rows={3}
                required={confirmType === "reject"}
                placeholder={
                  confirmType === "approve"
                    ? "Add optional comments for approval (e.g. approved based on email log)"
                    : "Add mandatory reasons for rejection..."
                }
                className="w-full text-sm rounded-lg border border-slate-200 p-2 text-slate-800 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={approveRejectMutation.isPending}
                className={cn(
                  "text-white rounded-lg text-xs",
                  confirmType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {approveRejectMutation.isPending ? "Processing..." : confirmType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

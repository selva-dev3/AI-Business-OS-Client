"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Loader2, AlertCircle, Calendar, Bookmark, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from "@/hooks/queries/hrms/leave/leave.hooks";
import { cn } from "@/lib/utils";

type LeaveTypeFormData = {
  name: string;
  code: string;
  maxDays: string;
  description: string;
  requiresApproval: boolean;
  isActive: boolean;
};

export default function LeaveTypeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: leaveType, isLoading, isError, refetch } = useLeaveType(id);
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<LeaveTypeFormData>({
    name: "",
    code: "",
    maxDays: "",
    description: "",
    requiresApproval: true,
    isActive: true,
  });
  const [formError, setFormError] = React.useState<string | null>(null);

  // Synchronize form data when leaveType is fetched
  React.useEffect(() => {
    if (leaveType) {
      setFormData({
        name: leaveType.name,
        code: leaveType.code,
        maxDays: String(leaveType.maxDays ?? ""),
        description: leaveType.description || "",
        requiresApproval: leaveType.requiresApproval !== false,
        isActive: leaveType.isActive !== false,
      });
    }
  }, [leaveType]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500 mt-3 animate-pulse">Loading leave type details...</p>
      </div>
    );
  }

  if (isError || !leaveType) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/hrms/leave")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Leave Management
        </Button>
        <Card className="border-rose-100 bg-rose-50/20">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Leave Type Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t retrieve information for Leave Type ID &quot;{id}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.maxDays) {
      setFormError("Name, code, and max days are required.");
      return false;
    }
    if (Number(formData.maxDays) < 1) {
      setFormError("Max days must be at least 1.");
      return false;
    }
    return true;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: formData.name,
          code: formData.code.toUpperCase(),
          maxDays: Number(formData.maxDays),
          description: formData.description || undefined,
          requiresApproval: formData.requiresApproval,
          isActive: formData.isActive,
        },
      });
      toast.success("Leave type updated successfully");
      setIsEditOpen(false);
      setFormError(null);
      refetch();
    } catch (err) {
      toast.error("Failed to update leave type");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Leave type deleted successfully");
      setIsDeleteOpen(false);
      router.push("/hrms/leave");
    } catch (err) {
      toast.error("Failed to delete leave type");
    }
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-5xl mx-auto">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/hrms/leave")}
          className="self-start gap-2 text-slate-500 hover:text-slate-900 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leave Management
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent">
                {leaveType.name}
              </h1>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-150 uppercase font-semibold text-xs">
                {leaveType.code}
              </Badge>
              <Badge
                className={
                  leaveType.isActive !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }
              >
                {leaveType.isActive !== false ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Leave category configuration and restrictions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 border shadow-xs"
            >
              <Pencil className="h-4 w-4" />
              Edit Details
            </Button>
            <Button
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete Type
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main detail card */}
        <Card className="md:col-span-2 border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">Leave Type Information</CardTitle>
            <CardDescription className="text-xs">
              General settings applied to this leave category.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Leave Code</span>
                <span className="text-sm font-medium text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                  {leaveType.code}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Max Days Allowed</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  {leaveType.maxDays || 0} Days / Year
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Approval Requirement</span>
                <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <CheckCircle className={cn("h-4 w-4", leaveType.requiresApproval ? "text-amber-500" : "text-slate-400")} />
                  {leaveType.requiresApproval ? "Requires Manager Approval" : "Auto-Approved / No Approval Required"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Status</span>
                <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", leaveType.isActive !== false ? "bg-emerald-500" : "bg-slate-400")} />
                  {leaveType.isActive !== false ? "Enabled for all employees" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Description</span>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {leaveType.description || "No description provided for this leave type."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar overview card */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">Quick Stats</CardTitle>
            <CardDescription className="text-xs">
              System references and metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Created At</span>
              <span className="text-slate-700 font-medium">
                {leaveType.createdAt ? new Date(leaveType.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-semibold uppercase">Last Updated</span>
              <span className="text-slate-700 font-medium">
                {leaveType.updatedAt ? new Date(leaveType.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-semibold uppercase">Unique ID</span>
              <span className="text-slate-500 font-mono truncate max-w-[120px]">{leaveType._id}</span>
            </div>

            <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex gap-3">
              <Bookmark className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950">Active Usage</h4>
                <p className="text-[11px] text-indigo-800/80 mt-1 leading-relaxed">
                  Employees can select this leave type when submitting request forms. Changing the allowance resets calculations for future requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setFormError(null); } }}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Leave Type</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update configuration settings for this leave type.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Leave Type Name *</label>
              <Input
                placeholder="e.g. Bereavement Leave"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Leave Code *</label>
                <Input
                  placeholder="e.g. BRV"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Max Days / Year *</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 5"
                  value={formData.maxDays}
                  onChange={(e) => setFormData({ ...formData, maxDays: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <Textarea
                placeholder="Description of the leave type..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-20"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700">Requires Approval</label>
                <p className="text-[11px] text-slate-400 mt-0.5">Manager must approve requests for this type</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, requiresApproval: !formData.requiresApproval })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  formData.requiresApproval ? "bg-indigo-600" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    formData.requiresApproval ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700">Active</label>
                <p className="text-[11px] text-slate-400 mt-0.5">Employees can submit requests for this type</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  formData.isActive ? "bg-emerald-500" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Delete Leave Type</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure you want to delete the leave type &quot;{leaveType.name}&quot;? This action cannot be undone and will affect any existing balance records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

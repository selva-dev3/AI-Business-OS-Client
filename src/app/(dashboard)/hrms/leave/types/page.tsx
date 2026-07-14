"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, Column } from "@/components/shared/datatable";
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from "@/hooks/queries/hrms/leave/leave.hooks";
import { LeaveTypeOption, LeaveTypeDetail, CreateLeaveTypeData, UpdateLeaveTypeData } from "@/hooks/queries/hrms/leave/leave.types";
import { cn } from "@/lib/utils";

type LeaveTypeFormData = {
  name: string;
  code: string;
  maxDays: string;
  description: string;
  requiresApproval: boolean;
  isActive: boolean;
};

const initialFormData: LeaveTypeFormData = {
  name: "",
  code: "",
  maxDays: "",
  description: "",
  requiresApproval: true,
  isActive: true,
};

export default function LeaveTypesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<LeaveTypeFormData>(initialFormData);
  const [formError, setFormError] = React.useState<string | null>(null);

  const { data: leaveTypes, isLoading, refetch } = useLeaveTypes();
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();

  const filteredList = React.useMemo(() => {
    const list = Array.isArray(leaveTypes) ? leaveTypes : [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (lt) =>
        lt.name.toLowerCase().includes(q) ||
        lt.code.toLowerCase().includes(q)
    );
  }, [leaveTypes, searchQuery]);

  const resetForm = () => {
    setFormData(initialFormData);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (lt: LeaveTypeOption) => {
    setEditingId(lt._id);
    setFormData({
      name: lt.name,
      code: lt.code,
      maxDays: String(lt.daysPerYear ?? ""),
      description: "",
      requiresApproval: true,
      isActive: lt.isActive ?? true,
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.code.toUpperCase(),
        maxDays: Number(formData.maxDays),
        description: formData.description || undefined,
        requiresApproval: formData.requiresApproval,
        isActive: formData.isActive,
      });
      toast.success("Leave type created successfully");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error("Failed to create leave type");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingId) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
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
      resetForm();
      setEditingId(null);
      refetch();
    } catch (err) {
      toast.error("Failed to update leave type");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Leave type deleted successfully");
      setIsDeleteOpen(false);
      setDeletingId(null);
      refetch();
    } catch (err) {
      toast.error("Failed to delete leave type");
    }
  };

  const columns = React.useMemo<Column<LeaveTypeOption>[]>(
    () => [
      {
        header: "Name",
        cell: (lt) => (
          <span className="font-semibold text-slate-900">{lt.name}</span>
        ),
      },
      {
        header: "Code",
        cell: (lt) => (
          <span className="font-mono text-xs text-slate-500">{lt.code}</span>
        ),
      },
      {
        header: "Max Days / Year",
        cell: (lt) => (
          <span className="font-semibold text-slate-700">
            {lt.daysPerYear ?? "-"}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (lt) => (
          <Badge
            className={
              lt.isActive !== false
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }
          >
            {lt.isActive !== false ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Actions",
        cell: (lt) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEdit(lt)}
              className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDelete(lt._id)}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent">
            Leave Types
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage leave categories and their allocation rules.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Leave Type
        </Button>
      </div>

      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">All Leave Types</CardTitle>
              <CardDescription className="text-xs">
                {filteredList.length} type{filteredList.length !== 1 ? "s" : ""} defined
              </CardDescription>
            </div>
            <div className="relative max-w-[240px] w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search leave types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filteredList}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No leave types found. Click 'Create Leave Type' to add one."
            onRowClick={(row) => router.push(`/hrms/leave/types/${row._id}`)}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create Leave Type</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Define a new leave category for the organization.
            </DialogDescription>
          </DialogHeader>
          <FormContent
            formData={formData}
            setFormData={setFormData}
            formError={formError}
            onSubmit={handleCreate}
            onCancel={() => { setIsCreateOpen(false); resetForm(); }}
            isPending={createMutation.isPending}
            submitLabel="Create Leave Type"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); resetForm(); setEditingId(null); } }}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Leave Type</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update the leave category settings.
            </DialogDescription>
          </DialogHeader>
          <FormContent
            formData={formData}
            setFormData={setFormData}
            formError={formError}
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); resetForm(); setEditingId(null); }}
            isPending={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Delete Leave Type</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure you want to delete this leave type? This action cannot be undone.
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

function FormContent({
  formData,
  setFormData,
  formError,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  formData: LeaveTypeFormData;
  setFormData: React.Dispatch<React.SetStateAction<LeaveTypeFormData>>;
  formError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2">
      {formError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
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
          placeholder="Optional description for this leave type..."
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
          <p className="text-[11px] text-slate-400 mt-0.5">Employees can use this leave type</p>
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
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
        >
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

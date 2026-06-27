"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  useDesignations,
  useDesignationSelect,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
  useRestoreDesignation,
  useBulkDeleteDesignations,
  useBulkRestoreDesignations,
  useChangeDesignationStatus,
} from "@/hooks/queries/hrms/designations/designation.hooks";
import {
  Designation,
  DesignationFilters,
} from "@/hooks/queries/hrms/designations/designation.types";
import { designationApi } from "@/hooks/queries/hrms/designations/designation.api";
import { useDepartments } from "@/hooks/queries/hrms/departments/departments.hooks";
import { Department } from "@/hooks/queries/hrms/departments/departments.types";

function SortIcon({ field, sortBy, sortOrder: order }: { field: string; sortBy: string; sortOrder: "asc" | "desc" }) {
  if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 inline opacity-40" />;
  return order === "asc" ? <ChevronUp className="h-3 w-3 ml-1 inline" /> : <ChevronDown className="h-3 w-3 ml-1 inline" />;
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERN: "Intern",
  FREELANCE: "Freelance",
};

const flattenDepartments = (depts: any[]): any[] => {
  const result: any[] = [];
  const traverse = (d: any) => {
    result.push({ ...d, id: d.id || d._id });
    if (d.children && Array.isArray(d.children)) {
      d.children.forEach(traverse);
    }
  };
  depts.forEach(traverse);
  return result;
};

const INITIAL_FORM = {
  name: "",
  designationCode: "",
  description: "",
  level: "",
  hierarchyOrder: "",
  employmentTypes: [] as string[],
  color: "#6366f1",
  departmentId: "",
  status: "ACTIVE" as "ACTIVE" | "INACTIVE",
};

export default function DesignationsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [sortBy, setSortBy] = React.useState("hierarchyOrder");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [formData, setFormData] = React.useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [viewingDesignation, setViewingDesignation] = React.useState<Designation | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const filters: DesignationFilters = {
    page,
    limit: 10,
    search: searchQuery || undefined,
    departmentId: deptFilter || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, refetch } = useDesignations(filters);
  const { data: selectData } = useDesignationSelect();
  const { data: deptData } = useDepartments();
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const deleteMutation = useDeleteDesignation();
  const restoreMutation = useRestoreDesignation();
  const bulkDeleteMutation = useBulkDeleteDesignations();
  const bulkRestoreMutation = useBulkRestoreDesignations();
  const statusMutation = useChangeDesignationStatus();

  const designations = React.useMemo(() => {
    const rawList = Array.isArray(data) ? data : ((data as any)?.data || []);
    return rawList.map((d: any) => ({ ...d, id: d.id || d._id })) as Designation[];
  }, [data]);

  const meta = (data as any)?.meta;

  const allDesignations = React.useMemo(() => {
    const rawList = Array.isArray(selectData) ? selectData : ((selectData as any)?.data || []);
    return rawList.map((d: any) => ({ ...d, id: d.id || d._id })) as Designation[];
  }, [selectData]);

  const departments = React.useMemo(() => {
    return flattenDepartments(deptData || []) as Department[];
  }, [deptData]);

  const resetForm = React.useCallback(() => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setEditingId(null);
  }, []);

  const openCreate = React.useCallback(() => {
    setFormMode("create");
    resetForm();
    setIsFormOpen(true);
  }, [resetForm]);

  const openEdit = React.useCallback((d: Designation) => {
    setFormMode("edit");
    setEditingId(d.id);
    setFormData({
      name: d.name,
      designationCode: d.designationCode || "",
      description: d.description || "",
      level: d.level !== undefined ? String(d.level) : "",
      hierarchyOrder: d.hierarchyOrder !== undefined ? String(d.hierarchyOrder) : "",
      employmentTypes: d.employmentTypes || [],
      color: d.color || "#6366f1",
      departmentId: typeof d.departmentId === "object" && d.departmentId ? (d.departmentId as { _id?: string; id?: string })._id || (d.departmentId as { id?: string }).id || "" : (d.departmentId as string) || "",
      status: d.status || "ACTIVE",
    });
    setFormErrors({});
    setIsFormOpen(true);
  }, []);

  const openView = React.useCallback((d: Designation) => {
    setViewingDesignation(d);
    setIsViewOpen(true);
  }, []);

  const openDelete = React.useCallback((id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  }, []);

  const handleFormOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIsFormOpen(false);
      resetForm();
    }
  }, [resetForm]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (formData.name.trim().length > 200) errors.name = "Max 200 characters";
    if (formData.level && (isNaN(Number(formData.level)) || Number(formData.level) < 0)) errors.level = "Must be a non-negative number";
    if (formData.hierarchyOrder && (isNaN(Number(formData.hierarchyOrder)) || Number(formData.hierarchyOrder) < 0)) errors.hierarchyOrder = "Must be a non-negative number";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      designationCode: formData.designationCode.trim() || undefined,
      description: formData.description.trim() || undefined,
      level: formData.level ? Number(formData.level) : undefined,
      hierarchyOrder: formData.hierarchyOrder ? Number(formData.hierarchyOrder) : undefined,
      employmentTypes: formData.employmentTypes.length > 0 ? formData.employmentTypes : undefined,
      color: formData.color || undefined,
      departmentId: formData.departmentId || undefined,
      status: formData.status,
    };

    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success("Designation created successfully");
      } else if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Designation updated successfully");
      }
      setIsFormOpen(false);
      resetForm();
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingId });
      toast.success("Designation deleted");
      setIsDeleteOpen(false);
      setDeletingId(null);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteMutation.mutateAsync({ ids: selectedIds });
      toast.success(`${selectedIds.length} designation(s) deleted`);
      setSelectedIds([]);
      setSelectAll(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkRestoreMutation.mutateAsync({ ids: selectedIds });
      toast.success(`${selectedIds.length} designation(s) restored`);
      setSelectedIds([]);
      setSelectAll(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk restore failed");
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await designationApi.exportCSV({
        departmentId: deptFilter || undefined,
        status: statusFilter || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "designations.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (err: unknown) {
      toast.error("Export failed");
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await designationApi.exportExcel({
        departmentId: deptFilter || undefined,
        status: statusFilter || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "designations.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  React.useEffect(() => {
    if (selectAll && designations.length > 0) {
      setSelectedIds(designations.map((d) => d.id));
    } else if (!selectAll) {
      setSelectedIds([]);
    }
  }, [selectAll, designations]);

  const getDeptName = (d: Designation): string => {
    if (!d.departmentId) return "-";
    if (typeof d.departmentId === "object") return (d.departmentId as { name?: string }).name || "-";
    const dept = departments.find((dep) => dep.id === d.departmentId);
    return dept?.name || "-";
  };

  const getDeptId = (d: Designation): string => {
    if (!d.departmentId) return "";
    if (typeof d.departmentId === "object") {
      const obj = d.departmentId as { _id?: string; id?: string };
      return obj._id || obj.id || "";
    }
    return d.departmentId;
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Designation Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage job titles, hierarchy levels, and employment types.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedIds.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRestore}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restore ({selectedIds.length})
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-slate-200 text-slate-700"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="border-slate-200 text-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Designation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-100 bg-white shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-1.5 flex-1 min-w-[200px] max-w-xs">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="bg-transparent border-0 text-xs focus:outline-hidden w-full text-slate-700"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="h-8 px-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 px-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-100 bg-white shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectAll && designations.length > 0}
                      onChange={() => setSelectAll(!selectAll)}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    Name <SortIcon field="name" sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort("departmentId")}>
                    Department <SortIcon field="departmentId" sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                  <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort("level")}>
                    Level <SortIcon field="level" sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                  <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort("hierarchyOrder")}>
                    Order <SortIcon field="hierarchyOrder" sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                  <th className="py-3 px-4">Types</th>
                  <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                    Status <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                      <span className="text-xs mt-2 block font-medium">Loading designations...</span>
                    </td>
                  </tr>
                ) : designations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <AlertCircle className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                      <span className="text-xs font-medium">
                        {searchQuery || deptFilter || statusFilter
                          ? "No designations match your filters"
                          : "No designations yet. Click 'Create Designation' to add one."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  designations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(d.id)}
                          onChange={() => toggleSelect(d.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {d.color && (
                            <span
                              className="h-3 w-3 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                          )}
                          <span className="font-semibold text-slate-800">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">{d.designationCode || "-"}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{getDeptName(d)}</td>
                      <td className="py-3 px-4">{d.level !== undefined ? d.level : "-"}</td>
                      <td className="py-3 px-4">{d.hierarchyOrder !== undefined ? d.hierarchyOrder : "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(d.employmentTypes || []).length > 0
                            ? d.employmentTypes!.map((t) => (
                                <Badge key={t} className="bg-slate-100 text-slate-700 border-0 text-[9px] font-medium">
                                  {EMPLOYMENT_TYPE_LABELS[t] || t}
                                </Badge>
                              ))
                            : <span className="text-xs text-slate-400">-</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={cn(
                            "text-[10px] font-semibold border-0",
                            d.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {d.status || "INACTIVE"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openView(d)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(d)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDelete(d.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 rounded-xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {formMode === "create" ? "Create Designation" : "Edit Designation"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {formMode === "create" ? "Add a new job title and configure its attributes." : "Update designation details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {Object.keys(formErrors).length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                {Object.values(formErrors).join(". ")}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Name <span className="text-rose-500">*</span></label>
              <Input
                placeholder="E.g., Senior Software Engineer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(formErrors.name && "border-rose-300")}
              />
              {formErrors.name && <span className="text-[11px] text-rose-500">{formErrors.name}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Designation Code</label>
                <Input
                  placeholder="E.g., SSE"
                  value={formData.designationCode}
                  onChange={(e) => setFormData({ ...formData, designationCode: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                >
                  <option value="">No Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Level</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="E.g., 3"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                />
                {formErrors.level && <span className="text-[11px] text-rose-500">{formErrors.level}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Hierarchy Order</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="E.g., 30"
                  value={formData.hierarchyOrder}
                  onChange={(e) => setFormData({ ...formData, hierarchyOrder: e.target.value })}
                />
                {formErrors.hierarchyOrder && <span className="text-[11px] text-rose-500">{formErrors.hierarchyOrder}</span>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Employment Types</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.employmentTypes.includes(value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, employmentTypes: [...formData.employmentTypes, value] });
                        } else {
                          setFormData({ ...formData, employmentTypes: formData.employmentTypes.filter((t) => t !== value) });
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Color</label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-9 p-1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <Textarea
                placeholder="Brief description of this role..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setIsFormOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span>
                ) : (
                  formMode === "create" ? "Create Designation" : "Update Designation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{viewingDesignation?.name}</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Full details of the designation.</DialogDescription>
          </DialogHeader>
          {viewingDesignation && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Code</span>
                  <span className="text-sm font-semibold text-slate-800">{viewingDesignation.designationCode || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                  <span className="text-sm font-semibold text-slate-800">{getDeptName(viewingDesignation)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Level</span>
                  <span className="text-sm font-semibold text-slate-800">{viewingDesignation.level ?? "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hierarchy Order</span>
                  <span className="text-sm font-semibold text-slate-800">{viewingDesignation.hierarchyOrder ?? "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <Badge className={cn("text-[10px] font-semibold border-0 mt-1", viewingDesignation.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                    {viewingDesignation.status || "INACTIVE"}
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Color</span>
                  <div className="flex items-center gap-2 mt-1">
                    {viewingDesignation.color && <span className="h-4 w-4 rounded-full inline-block" style={{ backgroundColor: viewingDesignation.color }} />}
                    <span className="text-sm text-slate-800">{viewingDesignation.color || "-"}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employment Types</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(viewingDesignation.employmentTypes || []).length > 0
                    ? viewingDesignation.employmentTypes!.map((t) => (
                        <Badge key={t} className="bg-slate-100 text-slate-700 border-0 text-[10px] font-medium">{EMPLOYMENT_TYPE_LABELS[t] || t}</Badge>
                      ))
                    : <span className="text-xs text-slate-400">-</span>}
                </div>
              </div>
              {viewingDesignation.description && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                  <p className="text-sm text-slate-600 mt-1">{viewingDesignation.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created</span>
                  <span className="text-xs text-slate-600">{new Date(viewingDesignation.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Updated</span>
                  <span className="text-xs text-slate-600">{new Date(viewingDesignation.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button type="button" size="sm" onClick={() => setIsViewOpen(false)} className="bg-indigo-600 text-white hover:bg-indigo-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Delete Designation</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure you want to delete this designation? This action can be undone by restoring it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button type="button" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending} className="bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

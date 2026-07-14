"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Building,
  User,
  PlusCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  MapPin,
  Phone,
  Loader2,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import leave hooks and types
import {
  useLeaveRequests,
  useLeaveBalances,
  useLeaveCalendar,
  useCreateLeaveRequest,
  useApproveLeave,
  useRejectLeave,
  useCancelLeave,
  useLeaveTypes,
  useUpdateLeaveType,
  useDeleteLeaveType,
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from "@/hooks/queries/hrms/leave/leave.hooks";
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus, LeaveTypeOption, Holiday, HolidayType } from "@/hooks/queries/hrms/leave/leave.types";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import { leaveApi } from "@/hooks/queries/hrms/leave/leave.api";
import { DataTable, Column } from "@/components/shared/datatable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function LeavePage() {
  const router = useRouter();
  const [topTab, setTopTab] = React.useState<"requests" | "types" | "holidays">("requests");
  const [activeTab, setActiveTab] = React.useState<"my-requests" | "team-approvals" | "outages">("my-requests");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<string>(""); // leaveTypeId

  // Modals state
  const [isRequestOpen, setIsRequestOpen] = React.useState(false);
  const [isApprovalNoteOpen, setIsApprovalNoteOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<LeaveRequest | null>(null);
  const [approvalAction, setApprovalAction] = React.useState<"approve" | "reject">("approve");
  const [managerNotes, setManagerNotes] = React.useState("");

  // Create Leave Type modal state
  const [isCreateLeaveTypeModalOpen, setIsCreateLeaveTypeModalOpen] = React.useState(false);
  const [leaveTypeForm, setLeaveTypeForm] = React.useState({
    name: "",
    code: "",
    maxDays: "",
    description: "",
    requiresApproval: true,
  });
  const [leaveTypeSubmitting, setLeaveTypeSubmitting] = React.useState(false);
  const [leaveTypeError, setLeaveTypeError] = React.useState<string | null>(null);

  // Edit Leave Type modal state
  const [editingLeaveType, setEditingLeaveType] = React.useState<LeaveTypeOption | null>(null);
  const [editLeaveTypeForm, setEditLeaveTypeForm] = React.useState({
    name: "",
    code: "",
    maxDays: "",
    description: "",
    requiresApproval: true,
  });
  const [isEditLeaveTypeModalOpen, setIsEditLeaveTypeModalOpen] = React.useState(false);
  const [editLeaveTypeError, setEditLeaveTypeError] = React.useState<string | null>(null);
  const [editLeaveTypeSubmitting, setEditLeaveTypeSubmitting] = React.useState(false);

  // Delete Leave Type confirmation state
  const [leaveTypeToDelete, setLeaveTypeToDelete] = React.useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  // ─── HOLIDAY STATE ──────────────────────────────────────────────────────────
  const [isCreateHolidayModalOpen, setIsCreateHolidayModalOpen] = React.useState(false);
  const [holidayForm, setHolidayForm] = React.useState({
    name: "",
    date: "",
    type: "PUBLIC" as HolidayType,
    isOptional: false,
  });
  const [holidaySubmitting, setHolidaySubmitting] = React.useState(false);
  const [holidayError, setHolidayError] = React.useState<string | null>(null);

  const [isEditHolidayModalOpen, setIsEditHolidayModalOpen] = React.useState(false);
  const [editingHoliday, setEditingHoliday] = React.useState<Holiday | null>(null);
  const [editHolidayForm, setEditHolidayForm] = React.useState({
    name: "",
    date: "",
    type: "PUBLIC" as HolidayType,
    isOptional: false,
  });
  const [editHolidaySubmitting, setEditHolidaySubmitting] = React.useState(false);
  const [editHolidayError, setEditHolidayError] = React.useState<string | null>(null);

  const [holidayToDelete, setHolidayToDelete] = React.useState<string | null>(null);
  const [isDeleteHolidayConfirmOpen, setIsDeleteHolidayConfirmOpen] = React.useState(false);

  // Mutations
  const updateLeaveTypeMutation = useUpdateLeaveType();
  const deleteLeaveTypeMutation = useDeleteLeaveType();
  const createHolidayMutation = useCreateHoliday();
  const updateHolidayMutation = useUpdateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();

  // Leave Form values
  const [formValues, setFormValues] = React.useState({
    employeeId: "",
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    emergencyContact: "",
  });

  // Employees list for dropdown
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = React.useState(false);

  // Fetch from Tanstack React Query hooks — pass server-compatible filters
  const { data: serverRequests, isLoading, refetch } = useLeaveRequests({
    status: statusFilter || undefined,
    leaveTypeId: typeFilter || undefined,
  });

  const { data: serverBalances } = useLeaveBalances();

  const createRequestMutation = useCreateLeaveRequest();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const cancelMutation = useCancelLeave();

  const { data: leaveTypes, isLoading: isLoadingLeaveTypes, isError: isLeaveTypesError, refetch: refetchLeaveTypes } = useLeaveTypes();
  const { data: holidays, isLoading: isLoadingHolidays, refetch: refetchHolidays } = useHolidays();

  // Static departments mapping
  const departments = [
    { id: "dept-1", name: "Engineering" },
    { id: "dept-2", name: "Product & Design" },
    { id: "dept-3", name: "Sales & Marketing" },
    { id: "dept-4", name: "Human Resources" },
    { id: "dept-5", name: "Finance & Legal" },
    { id: "dept-6", name: "Customer Support" },
  ];

  // Leave balances from API
  const balancesList = React.useMemo(() => {
    if (serverBalances && Array.isArray(serverBalances) && serverBalances.length > 0) {
      return serverBalances;
    }
    // Fallback balances when API returns empty
    return [
      { id: "bal-1", employeeId: "current-user", leaveType: "annual" as LeaveType, totalAllocated: 20, used: 6, pending: 0, available: 14 },
      { id: "bal-2", employeeId: "current-user", leaveType: "sick" as LeaveType, totalAllocated: 12, used: 4, pending: 0, available: 8 },
      { id: "bal-3", employeeId: "current-user", leaveType: "casual" as LeaveType, totalAllocated: 6, used: 2, pending: 0, available: 4 },
      { id: "bal-4", employeeId: "current-user", leaveType: "unpaid" as LeaveType, totalAllocated: 0, used: 2, pending: 0, available: 0 },
    ];
  }, [serverBalances]);

  // Combined Data Lists — API data with client-side search filter
  const requestsList = React.useMemo(() => {
    const apiData = serverRequests?.data || [];
    if (!searchQuery) return apiData;

    // Client-side text search (server doesn't support text search on populated fields)
    return apiData.filter((req) => {
      const nameMatch = req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : false;
      const reasonMatch = (req.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || reasonMatch;
    });
  }, [serverRequests, searchQuery]);

  // My requests — same API data, shown in the "My Leave Log" tab
  // In a full auth setup, this would filter by the current user's employeeId
  const myRequestsList = React.useMemo(() => {
    return serverRequests?.data || [];
  }, [serverRequests]);

  // Auto calculate total days in request dialog
  const calculatedDays = React.useMemo(() => {
    if (!formValues.fromDate || !formValues.toDate) return 0;
    const start = new Date(formValues.fromDate);
    const end = new Date(formValues.toDate);
    if (end < start) return 0;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Add 1 to make it inclusive
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [formValues.fromDate, formValues.toDate]);

  // Handle open leave request dialog
  const handleOpenRequest = async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setFormValues({
      employeeId: "",
      leaveTypeId: "",
      fromDate: tomorrow,
      toDate: tomorrow,
      reason: "",
      emergencyContact: "",
    });
    setIsRequestOpen(true);

    setEmployeesLoading(true);
    try {
      const employeesRes = await leaveApi.getEmployees();
      setEmployees(employeesRes?.employees || employeesRes?.data || []);
    } catch (err) {
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Submit leave request form
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!formValues.leaveTypeId || !formValues.fromDate || !formValues.toDate || !formValues.reason) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    if (new Date(formValues.toDate) < new Date(formValues.fromDate)) {
      toast.error("End date cannot be prior to start date");
      return;
    }

    const payload = {
      employeeId: formValues.employeeId,
      leaveTypeId: formValues.leaveTypeId,
      fromDate: new Date(formValues.fromDate).toISOString().split("T")[0],
      toDate: new Date(formValues.toDate).toISOString().split("T")[0],
      reason: formValues.reason,
      emergencyContact: formValues.emergencyContact || undefined,
    };

    try {
      await createRequestMutation.mutateAsync(payload);
      toast.success("Leave request submitted successfully!");
      setIsRequestOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit leave request.");
    }
  };

  // Trigger cancel leave request
  const handleCancelRequest = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Leave request cancelled");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel leave request.");
    }
  };

  // Open Approval Note modal
  const handleOpenApprovalAction = (req: LeaveRequest, action: "approve" | "reject") => {
    setSelectedRequest(req);
    setApprovalAction(action);
    setManagerNotes("");
    setIsApprovalNoteOpen(true);
  };

  // Apply manager approve/reject review
  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      if (approvalAction === "approve") {
        await approveMutation.mutateAsync({
          id: selectedRequest.id,
          data: { managerNotes },
        });
        toast.success("Leave request approved successfully");
      } else {
        await rejectMutation.mutateAsync({
          id: selectedRequest.id,
          data: { managerNotes },
        });
        toast.success("Leave request rejected");
      }
      setIsApprovalNoteOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${approvalAction} leave request.`);
    }
  };

  // Helpers for formatting types
  const getLeaveTypeLabel = (type: LeaveType) => {
    switch (type) {
      case "annual":
        return "Annual Leave";
      case "sick":
        return "Sick Leave";
      case "casual":
        return "Casual Leave";
      case "unpaid":
        return "Unpaid Leave";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rejected</Badge>;
      case "cancelled":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle create leave type
  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveTypeError(null);

    if (!leaveTypeForm.name || !leaveTypeForm.code || !leaveTypeForm.maxDays) {
      setLeaveTypeError("Please fill in all required fields.");
      return;
    }

    setLeaveTypeSubmitting(true);
    try {
      await leaveApi.createLeaveType({
        name: leaveTypeForm.name,
        code: leaveTypeForm.code.toUpperCase(),
        maxDays: parseInt(leaveTypeForm.maxDays, 10),
        description: leaveTypeForm.description || undefined,
        requiresApproval: leaveTypeForm.requiresApproval,
        isActive: true,
      });
      toast.success("Leave type created successfully!");
      setIsCreateLeaveTypeModalOpen(false);
      setLeaveTypeForm({ name: "", code: "", maxDays: "", description: "", requiresApproval: true });
      refetchLeaveTypes();
    } catch (err) {
      setLeaveTypeError(err instanceof Error ? err.message : "Failed to create leave type. Please try again.");
    } finally {
      setLeaveTypeSubmitting(false);
    }
  };

  // Handle edit leave type submit
  const handleEditLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLeaveTypeError(null);

    if (!editLeaveTypeForm.name || !editLeaveTypeForm.code || !editLeaveTypeForm.maxDays || !editingLeaveType) {
      setEditLeaveTypeError("Please fill in all required fields.");
      return;
    }

    setEditLeaveTypeSubmitting(true);
    try {
      await updateLeaveTypeMutation.mutateAsync({
        id: editingLeaveType._id,
        data: {
          name: editLeaveTypeForm.name,
          code: editLeaveTypeForm.code.toUpperCase(),
          maxDays: parseInt(editLeaveTypeForm.maxDays, 10),
          description: editLeaveTypeForm.description || undefined,
          requiresApproval: editLeaveTypeForm.requiresApproval,
        },
      });
      toast.success("Leave type updated successfully!");
      setIsEditLeaveTypeModalOpen(false);
      setEditingLeaveType(null);
      refetchLeaveTypes();
    } catch (err) {
      setEditLeaveTypeError(err instanceof Error ? err.message : "Failed to update leave type. Please try again.");
    } finally {
      setEditLeaveTypeSubmitting(false);
    }
  };

  // Handle delete leave type
  const handleDeleteLeaveType = React.useCallback((id: string) => {
    setLeaveTypeToDelete(id);
    setIsDeleteConfirmOpen(true);
  }, []);

  const confirmDeleteLeaveType = async () => {
    if (!leaveTypeToDelete) return;
    try {
      await deleteLeaveTypeMutation.mutateAsync(leaveTypeToDelete);
      toast.success("Leave type deleted successfully!");
      refetchLeaveTypes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete leave type. Please try again.");
    } finally {
      setIsDeleteConfirmOpen(false);
      setLeaveTypeToDelete(null);
    }
  };

  // ─── HOLIDAY HANDLERS ──────────────────────────────────────────────────────
  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setHolidayError(null);
    if (!holidayForm.name || !holidayForm.date) {
      setHolidayError("Please fill in all required fields.");
      return;
    }
    setHolidaySubmitting(true);
    try {
      await createHolidayMutation.mutateAsync({
        name: holidayForm.name,
        date: holidayForm.date,
        type: holidayForm.type,
        isOptional: holidayForm.isOptional,
      });
      toast.success("Holiday created successfully!");
      setIsCreateHolidayModalOpen(false);
      setHolidayForm({ name: "", date: "", type: "PUBLIC", isOptional: false });
      refetchHolidays();
    } catch (err) {
      setHolidayError(err instanceof Error ? err.message : "Failed to create holiday.");
    } finally {
      setHolidaySubmitting(false);
    }
  };

  const handleEditHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditHolidayError(null);
    if (!editHolidayForm.name || !editHolidayForm.date || !editingHoliday) {
      setEditHolidayError("Please fill in all required fields.");
      return;
    }
    setEditHolidaySubmitting(true);
    try {
      await updateHolidayMutation.mutateAsync({
        id: editingHoliday._id,
        data: {
          name: editHolidayForm.name,
          date: editHolidayForm.date,
          type: editHolidayForm.type,
          isOptional: editHolidayForm.isOptional,
        },
      });
      toast.success("Holiday updated successfully!");
      setIsEditHolidayModalOpen(false);
      setEditingHoliday(null);
      refetchHolidays();
    } catch (err) {
      setEditHolidayError(err instanceof Error ? err.message : "Failed to update holiday.");
    } finally {
      setEditHolidaySubmitting(false);
    }
  };

  const handleDeleteHoliday = React.useCallback((id: string) => {
    setHolidayToDelete(id);
    setIsDeleteHolidayConfirmOpen(true);
  }, []);

  const confirmDeleteHoliday = async () => {
    if (!holidayToDelete) return;
    try {
      await deleteHolidayMutation.mutateAsync(holidayToDelete);
      toast.success("Holiday deleted successfully!");
      refetchHolidays();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete holiday.");
    } finally {
      setIsDeleteHolidayConfirmOpen(false);
      setHolidayToDelete(null);
    }
  };

  // Calendar dates details showing away employees (Today or upcoming)
  const calendarEvents = React.useMemo(() => {
    return requestsList.filter((req) => req.status === "approved");
  }, [requestsList]);

  // ─── HOLIDAY COLUMNS ───────────────────────────────────────────────────────
  const holidayColumns = React.useMemo<Column<any>[]>(() => [
    {
      header: "Holiday Name",
      cell: (h) => (
        <span className="font-semibold text-slate-800">{h.name}</span>
      ),
      className: "px-6",
    },
    {
      header: "Date",
      cell: (h) => {
        const d = new Date(h.date);
        return (
          <span className="text-slate-600 text-sm">
            {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        );
      },
      className: "px-6",
    },
    {
      header: "Day",
      cell: (h) => {
        const d = new Date(h.date);
        return (
          <span className="text-slate-500 text-sm">
            {d.toLocaleDateString("en-IN", { weekday: "long" })}
          </span>
        );
      },
      className: "px-6",
    },
    {
      header: "Type",
      cell: (h) => {
        const typeColors: Record<string, string> = {
          PUBLIC: "bg-emerald-50 text-emerald-700 border-emerald-200",
          RESTRICTED: "bg-amber-50 text-amber-700 border-amber-200",
          OPTIONAL: "bg-sky-50 text-sky-700 border-sky-200",
        };
        return (
          <Badge variant="outline" className={cn("text-xs font-medium capitalize", typeColors[h.type] || "bg-slate-50 text-slate-600")}>
            {(h.type || "public").toLowerCase()}
          </Badge>
        );
      },
      className: "px-6",
    },
    {
      header: "Optional",
      cell: (h) => (
        <Badge variant="outline" className={cn("text-xs font-medium", h.isOptional ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-500 border-slate-200")}>
          {h.isOptional ? "Optional" : "Mandatory"}
        </Badge>
      ),
      className: "px-6",
    },
    {
      header: "",
      cell: (h) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-md">
            <DropdownMenuItem
              onClick={() => {
                setEditingHoliday(h);
                setEditHolidayForm({
                  name: h.name,
                  date: h.date ? new Date(h.date).toISOString().split("T")[0] : "",
                  type: h.type || "PUBLIC",
                  isOptional: h.isOptional || false,
                });
                setIsEditHolidayModalOpen(true);
              }}
              className="cursor-pointer flex items-center"
            >
              <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteHoliday(h._id || h.id)}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4 text-rose-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right px-6",
    },
  ], [handleDeleteHoliday]);

  const leaveTypeColumns = React.useMemo<Column<any>[]>(() => [
    {
      header: "Leave Name",
      cell: (lt) => (
        <span className="font-semibold text-slate-800">
          {lt.name}
        </span>
      ),
      className: "px-6",
    },
    {
      header: "Code",
      cell: (lt) => (
        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-150 uppercase font-semibold text-[10px]">
          {lt.code}
        </Badge>
      ),
      className: "px-6",
    },
    {
      header: "Max Days / Year",
      cell: (lt) => (
        <span className="font-bold text-slate-800">
          {lt.maxDays || lt.daysPerYear || 0}
        </span>
      ),
      className: "text-center px-6",
    },
    {
      header: "Requires Approval",
      cell: (lt) => (
        lt.requiresApproval ? (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold scale-90">Yes</Badge>
        ) : (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 font-medium scale-90">No</Badge>
        )
      ),
      className: "text-center px-6",
    },
    {
      header: "Description",
      cell: (lt) => (
        <span className="text-xs text-slate-500 max-w-[300px] truncate block">
          {lt.description || "—"}
        </span>
      ),
      className: "px-6",
    },
    {
      header: "Status",
      cell: (lt) => (
        lt.isActive !== false ? (
          <Badge className="bg-emerald-50 text-emerald-750 border-emerald-150 font-bold scale-90">Active</Badge>
        ) : (
          <Badge className="bg-rose-50 text-rose-750 border-rose-150 font-bold scale-90">Inactive</Badge>
        )
      ),
    },
    {
      header: "Actions",
      cell: (lt) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-md">
            <DropdownMenuItem
              onClick={() => {
                setEditingLeaveType(lt);
                setEditLeaveTypeForm({
                  name: lt.name,
                  code: lt.code,
                  maxDays: String(lt.maxDays || lt.daysPerYear || ""),
                  description: lt.description || "",
                  requiresApproval: lt.requiresApproval !== false,
                });
                setIsEditLeaveTypeModalOpen(true);
              }}
              className="cursor-pointer flex items-center"
            >
              <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteLeaveType(lt._id || lt.id)}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4 text-rose-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right px-6",
    },
  ], [handleDeleteLeaveType, setEditingLeaveType, setEditLeaveTypeForm, setIsEditLeaveTypeModalOpen]);

  const myLeaveColumns = React.useMemo<Column<LeaveRequest>[]>(() => [
    {
      header: "Leave Type",
      cell: (req) => (
        <span className="font-semibold text-slate-850">
          {getLeaveTypeLabel(req.leaveType)}
        </span>
      ),
      className: "px-6",
    },
    {
      header: "Dates Range",
      cell: (req) => (
        <span className="text-xs text-slate-700 font-medium">
          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
        </span>
      ),
      className: "px-6",
    },
    {
      header: "Days",
      cell: (req) => (
        <span className="font-bold text-slate-800">
          {req.totalDays}
        </span>
      ),
      className: "text-center px-6",
    },
    {
      header: "Status",
      cell: (req) => getStatusBadge(req.status),
      className: "text-center px-6",
    },
    {
      header: "Reason / Remarks",
      cell: (req) => (
        <div className="max-w-[200px] truncate text-xs text-slate-500">
          <span className="font-semibold text-slate-700 block">Reason: {req.reason}</span>
          {req.managerNotes && (
            <span className="text-rose-600 font-medium block mt-0.5">Note: {req.managerNotes}</span>
          )}
        </div>
      ),
      className: "px-6",
    },
    {
      header: "Actions",
      cell: (req) => (
        <div className="flex justify-center">
          {req.status === "pending" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancelRequest(req.id)}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:bg-rose-50 rounded-md py-1 h-7"
            >
              Cancel
            </Button>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
      ),
      className: "text-center px-6",
    },
  ], [handleCancelRequest]);

  const teamApprovalColumns = React.useMemo<Column<LeaveRequest>[]>(() => [
    {
      header: "Employee",
      cell: (req) => {
        const emp = req.employee;
        const deptName = departments.find((d) => d.id === emp?.departmentId)?.name || "Corporate";
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 border border-slate-200">
              {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : "EM"}
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Building className="h-3 w-3" />
                {deptName}
              </p>
            </div>
          </div>
        );
      },
      className: "px-6",
    },
    {
      header: "Leave Details",
      cell: (req) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">
            {getLeaveTypeLabel(req.leaveType)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
          </span>
        </div>
      ),
      className: "px-6",
    },
    {
      header: "Days",
      cell: (req) => (
        <span className="font-bold text-slate-800">
          {req.totalDays}
        </span>
      ),
      className: "text-center px-6",
    },
    {
      header: "Status",
      cell: (req) => getStatusBadge(req.status),
      className: "text-center px-6",
    },
    {
      header: "Reason Given",
      cell: (req) => (
        <span className="text-xs text-slate-500 max-w-[200px] truncate block">
          {req.reason}
        </span>
      ),
      className: "px-6",
    },
    {
      header: "Action Review",
      cell: (req) => (
        <div className="flex justify-center">
          {req.status === "pending" ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenApprovalAction(req, "approve")}
                className="text-xs px-2.5 h-7 font-semibold border-emerald-250 text-emerald-600 hover:bg-emerald-50/50"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenApprovalAction(req, "reject")}
                className="text-xs px-2.5 h-7 font-semibold border-rose-250 text-rose-600 hover:bg-rose-50/50"
              >
                Deny
              </Button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">
              Reviewed by {req.approvedByUser?.firstName || "Sarah"}
            </span>
          )}
        </div>
      ),
      className: "text-center px-6",
    },
  ], [departments, handleOpenApprovalAction]);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Apply for time off, view allocated leave balances, and review team requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setLeaveTypeForm({ name: "", code: "", maxDays: "", description: "", requiresApproval: true });
              setLeaveTypeError(null);
              setIsCreateLeaveTypeModalOpen(true);
            }}
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Leave Type
          </Button>
          <Button
            onClick={handleOpenRequest}
            className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        </div>
      </div>

      {/* Top Tabbar */}
      <div className="flex border-b border-slate-200 gap-2 mb-2">
        <Button
          variant="ghost"
          onClick={() => setTopTab("requests")}
          className={cn(
            "rounded-none border-b-2 pb-3 px-4 font-semibold text-sm transition-all -mb-[1px] flex items-center gap-2 h-auto hover:bg-transparent hover:text-indigo-600 bg-transparent text-slate-500 shadow-none border-t-0 border-x-0",
            topTab === "requests"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent hover:border-slate-300"
          )}
        >
          <FileText className="h-4 w-4 shrink-0" />
          Leave Requests
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setTopTab("types");
            refetchLeaveTypes();
          }}
          className={cn(
            "rounded-none border-b-2 pb-3 px-4 font-semibold text-sm transition-all -mb-[1px] flex items-center gap-2 h-auto hover:bg-transparent hover:text-indigo-600 bg-transparent text-slate-500 shadow-none border-t-0 border-x-0",
            topTab === "types"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent hover:border-slate-300"
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Leave Types
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setTopTab("holidays");
            refetchHolidays();
          }}
          className={cn(
            "rounded-none border-b-2 pb-3 px-4 font-semibold text-sm transition-all -mb-[1px] flex items-center gap-2 h-auto hover:bg-transparent hover:text-indigo-600 bg-transparent text-slate-500 shadow-none border-t-0 border-x-0",
            topTab === "holidays"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent hover:border-slate-300"
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Holidays
        </Button>
      </div>

      {topTab === "requests" ? (
        <>
          {/* Leave Balances Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {balancesList.map((bal) => {
          let colorClass = "bg-indigo-50/50 text-indigo-700 border-indigo-100";
          let progressColor = "bg-indigo-600";
          if (bal.leaveType === "sick") {
            colorClass = "bg-amber-50/50 text-amber-700 border-amber-100";
            progressColor = "bg-amber-500";
          } else if (bal.leaveType === "casual") {
            colorClass = "bg-emerald-50/50 text-emerald-700 border-emerald-100";
            progressColor = "bg-emerald-500";
          } else if (bal.leaveType === "unpaid") {
            colorClass = "bg-rose-50/50 text-rose-700 border-rose-100";
            progressColor = "bg-rose-500";
          }

          const percent = bal.totalAllocated > 0 
            ? Math.round((bal.used / bal.totalAllocated) * 100) 
            : 100;

          return (
            <Card key={bal.id} className="border-slate-100 bg-white shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {getLeaveTypeLabel(bal.leaveType)}
                  </span>
                  <div className={cn("px-2 py-0.5 rounded text-[11px] font-bold border", colorClass)}>
                    {bal.available} days left
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {bal.used}{" "}
                    {bal.totalAllocated > 0 && (
                      <span className="text-xs font-normal text-slate-400">/ {bal.totalAllocated} Days Used</span>
                    )}
                  </h3>
                  
                  {bal.totalAllocated > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", progressColor)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Used {percent}%</span>
                        <span>{bal.pending} pending</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      Uncapped / No baseline allowance
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabbar */}
      <div className="flex border-b border-slate-200 gap-2 mb-2">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("my-requests")}
          className={cn(
            "rounded-none border-b-2 pb-3 px-4 font-semibold text-sm transition-all -mb-[1px] flex items-center gap-2 h-auto hover:bg-transparent hover:text-indigo-600 bg-transparent text-slate-500 shadow-none border-t-0 border-x-0",
            activeTab === "my-requests"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent hover:border-slate-300"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          My Leave History
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("team-approvals")}
          className={cn(
            "rounded-none border-b-2 pb-3 px-4 font-semibold text-sm transition-all -mb-[1px] flex items-center gap-2 h-auto hover:bg-transparent hover:text-indigo-600 bg-transparent text-slate-500 shadow-none border-t-0 border-x-0",
            activeTab === "team-approvals"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent hover:border-slate-300"
          )}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          Team Approvals
          {requestsList.filter(r => r.status === "pending").length > 0 && (
            <Badge className="ml-1 bg-amber-500 text-white border-0 hover:bg-amber-600 font-bold text-[10px] scale-90">
              {requestsList.filter(r => r.status === "pending").length}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("outages")}
          className={cn(
            "rounded-none border-b-2 pb-3 px-4 font-semibold text-sm transition-all -mb-[1px] flex items-center gap-2 h-auto hover:bg-transparent hover:text-indigo-600 bg-transparent text-slate-500 shadow-none border-t-0 border-x-0",
            activeTab === "outages"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent hover:border-slate-300"
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Outages Calendar
        </Button>
      </div>

      {/* Main View Container */}
      <div className="w-full">
        {/* Tab 1: My Requests */}
        {activeTab === "my-requests" && (
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800">My Leave Log</CardTitle>
              <CardDescription className="text-xs">
                Your submitted requests, approvals, and cancellation triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={myRequestsList}
                columns={myLeaveColumns}
                isLoading={isLoading}
                emptyMessage="No leave requests found. Click 'Request Leave' above to create one."
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Team Approvals */}
        {activeTab === "team-approvals" && (
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">Team Requests Review</CardTitle>
                  <CardDescription className="text-xs">
                    Approve or deny pending leave requests submitted by staff members.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 max-w-[200px] text-xs"
                  />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-8 px-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                  >
                    <option value="">All Leave Types</option>
                    {leaveTypes?.map((lt) => (
                      <option key={lt._id} value={lt._id}>
                        {lt.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 px-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={requestsList}
                columns={teamApprovalColumns}
                isLoading={isLoading}
                emptyMessage="No requests match criteria"
              />
            </CardContent>
          </Card>
        )}

          {/* Tab 3: Leave Outages */}
          {activeTab === "outages" && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-800">Outages & Team Absence</CardTitle>
                <CardDescription className="text-xs">
                  Review team calendars to ensure resource and shift coverage limits are respected.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {calendarEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">No approved outages currently recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Upcoming</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {calendarEvents.map((event) => {
                        const emp = event.employee;
                        const dept = departments.find((d) => d.id === emp?.departmentId)?.name || "Corporate";
                        
                        return (
                          <div
                            key={event.id}
                            className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 mt-0.5">
                                {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : "EM"}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                  {emp ? `${emp.firstName} ${emp.lastName}` : "Employee"}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {dept}
                                </p>
                                <p className="text-[11px] font-semibold text-indigo-600 mt-2 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                  {getLeaveTypeLabel(event.leaveType)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-slate-800 block">
                                {event.totalDays} {event.totalDays > 1 ? "days" : "day"}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                to {new Date(event.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </div>
        </>
      ) : topTab === "types" ? (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">Leave Categories</CardTitle>
              <CardDescription className="text-xs">
                Active leave types and their yearly allocations.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={leaveTypes || []}
              columns={leaveTypeColumns}
              isLoading={isLoadingLeaveTypes}
              emptyMessage="No leave types found. Create one using the button above."
              onRowClick={(row) => router.push(`/hrms/leave/types/${row._id}`)}
            />
          </CardContent>
        </Card>
      ) : topTab === "holidays" ? (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">Company Holidays</CardTitle>
              <CardDescription className="text-xs">
                Public, restricted, and optional holidays for the current year.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateHolidayModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Holiday
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={holidays || []}
              columns={holidayColumns}
              isLoading={isLoadingHolidays}
              emptyMessage="No holidays found. Add one using the button above."
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Leave Request Dialog Form */}
      <Dialog open={isRequestOpen} onOpenChange={(open) => {
        setIsRequestOpen(open);
        if (!open) {
          setEmployees([]);
          setEmployeesLoading(false);
        }
      }}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Submit Leave Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Request time-off allocation. Your manager will receive approval alerts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestSubmit} className="space-y-4 py-2">
            
            {/* Employee selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Employee <span className="text-rose-500">*</span>
              </label>
              {employeesLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading employees...
                </div>
              ) : (
                <select
                  value={formValues.employeeId}
                  onChange={(e) => setFormValues({ ...formValues, employeeId: e.target.value })}
                  className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden disabled:opacity-50"
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.employeeId}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Type selector - API driven */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Leave Category</label>
              <select
                value={formValues.leaveTypeId}
                onChange={(e) => setFormValues({ ...formValues, leaveTypeId: e.target.value })}
                disabled={isLoadingLeaveTypes}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden disabled:opacity-50"
                required
              >
                {isLoadingLeaveTypes && (
                  <option value="" disabled>Loading leave types...</option>
                )}
                {isLeaveTypesError && (
                  <option value="" disabled>Failed to load leave types</option>
                )}
                {!isLoadingLeaveTypes && !isLeaveTypesError && (
                  <option value="">Select leave type</option>
                )}
                {!isLoadingLeaveTypes && !isLeaveTypesError && leaveTypes?.map((lt) => (
                  <option key={lt._id} value={lt._id}>{lt.name}</option>
                ))}
              </select>
            </div>

            {/* Date ranges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">From Date</label>
                <Input
                  type="date"
                  value={formValues.fromDate}
                  onChange={(e) => setFormValues({ ...formValues, fromDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">To Date</label>
                <Input
                  type="date"
                  value={formValues.toDate}
                  onChange={(e) => setFormValues({ ...formValues, toDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {calculatedDays > 0 && (
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs font-semibold text-indigo-700 flex items-center justify-between">
                <span>Calculated Period:</span>
                <span>{calculatedDays} Working Days</span>
              </div>
            )}

            {/* Contact details */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Emergency Contact Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formValues.emergencyContact}
                onChange={(e) => setFormValues({ ...formValues, emergencyContact: e.target.value })}
              />
            </div>

            {/* Reason details */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Detailed Reason</label>
              <Textarea
                placeholder="Specify the purpose of requested time off..."
                value={formValues.reason}
                onChange={(e) => setFormValues({ ...formValues, reason: e.target.value })}
                required
                className="h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRequestOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoadingLeaveTypes || createRequestMutation.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Review Notes Dialog */}
      <Dialog open={isApprovalNoteOpen} onOpenChange={setIsApprovalNoteOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {approvalAction === "approve" ? "Confirm Leave Approval" : "Confirm Leave Rejection"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Submit review notes for {selectedRequest?.employee?.firstName}'s leave request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApprovalSubmit} className="space-y-4 py-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Review Notes / Reason</label>
              <Textarea
                placeholder={
                  approvalAction === "approve"
                    ? "Approved. Have a great vacation!"
                    : "Unfortunately, we cannot approve this due to lack of team coverage..."
                }
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                required
                className="h-20 text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsApprovalNoteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={cn(
                  "text-white font-semibold",
                  approvalAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                Confirm {approvalAction === "approve" ? "Approval" : "Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Leave Type Dialog */}
      <Dialog
        open={isCreateLeaveTypeModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateLeaveTypeModalOpen(false);
            setLeaveTypeForm({ name: "", code: "", maxDays: "", description: "", requiresApproval: true });
            setLeaveTypeError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create Leave Type
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Define a new leave category for the organization.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLeaveType} className="space-y-4 py-2">
            {leaveTypeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                {leaveTypeError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Leave Type Name *</label>
              <Input
                type="text"
                placeholder="e.g. Bereavement Leave"
                value={leaveTypeForm.name}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Leave Code *</label>
                <Input
                  type="text"
                  placeholder="e.g. BRV"
                  value={leaveTypeForm.code}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Max Days / Year *</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 5"
                  value={leaveTypeForm.maxDays}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, maxDays: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <Textarea
                placeholder="Optional description for this leave type..."
                value={leaveTypeForm.description}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, description: e.target.value })}
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
                onClick={() => setLeaveTypeForm({ ...leaveTypeForm, requiresApproval: !leaveTypeForm.requiresApproval })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  leaveTypeForm.requiresApproval ? "bg-indigo-600" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    leaveTypeForm.requiresApproval ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateLeaveTypeModalOpen(false);
                  setLeaveTypeForm({ name: "", code: "", maxDays: "", description: "", requiresApproval: true });
                  setLeaveTypeError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={leaveTypeSubmitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {leaveTypeSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Leave Type"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Type Dialog */}
      <Dialog
        open={isEditLeaveTypeModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditLeaveTypeModalOpen(false);
            setEditingLeaveType(null);
            setEditLeaveTypeForm({ name: "", code: "", maxDays: "", description: "", requiresApproval: true });
            setEditLeaveTypeError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Edit Leave Type
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Modify the configuration of the selected leave type.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditLeaveType} className="space-y-4 py-2">
            {editLeaveTypeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                {editLeaveTypeError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Leave Type Name *</label>
              <Input
                type="text"
                placeholder="e.g. Bereavement Leave"
                value={editLeaveTypeForm.name}
                onChange={(e) => setEditLeaveTypeForm({ ...editLeaveTypeForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Leave Code *</label>
                <Input
                  type="text"
                  placeholder="e.g. BRV"
                  value={editLeaveTypeForm.code}
                  onChange={(e) => setEditLeaveTypeForm({ ...editLeaveTypeForm, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Max Days / Year *</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 5"
                  value={editLeaveTypeForm.maxDays}
                  onChange={(e) => setEditLeaveTypeForm({ ...editLeaveTypeForm, maxDays: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <Textarea
                placeholder="Optional description for this leave type..."
                value={editLeaveTypeForm.description}
                onChange={(e) => setEditLeaveTypeForm({ ...editLeaveTypeForm, description: e.target.value })}
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
                onClick={() => setEditLeaveTypeForm({ ...editLeaveTypeForm, requiresApproval: !editLeaveTypeForm.requiresApproval })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  editLeaveTypeForm.requiresApproval ? "bg-indigo-600" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    editLeaveTypeForm.requiresApproval ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditLeaveTypeModalOpen(false);
                  setEditingLeaveType(null);
                  setEditLeaveTypeForm({ name: "", code: "", maxDays: "", description: "", requiresApproval: true });
                  setEditLeaveTypeError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={editLeaveTypeSubmitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {editLeaveTypeSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Leave Type Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Leave Type"
        description="Are you sure you want to delete this leave type? This action cannot be undone."
        onConfirm={confirmDeleteLeaveType}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setLeaveTypeToDelete(null);
        }}
      />

      {/* Create Holiday Dialog */}
      <Dialog
        open={isCreateHolidayModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateHolidayModalOpen(false);
            setHolidayForm({ name: "", date: "", type: "PUBLIC", isOptional: false });
            setHolidayError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Add Holiday</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Create a new company holiday.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateHoliday} className="space-y-4 py-2">
            {holidayError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" /> {holidayError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Holiday Name *</label>
              <Input
                placeholder="e.g. Republic Day"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Date *</label>
              <Input
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Type</label>
              <select
                value={holidayForm.type}
                onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value as HolidayType })}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="OPTIONAL">Optional</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOptional"
                checked={holidayForm.isOptional}
                onChange={(e) => setHolidayForm({ ...holidayForm, isOptional: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="isOptional" className="text-xs font-medium text-slate-600">Optional Holiday</label>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateHolidayModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={holidaySubmitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {holidaySubmitting ? "Creating..." : "Create Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      <Dialog
        open={isEditHolidayModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditHolidayModalOpen(false);
            setEditingHoliday(null);
            setEditHolidayError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Holiday</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Update holiday details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditHoliday} className="space-y-4 py-2">
            {editHolidayError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" /> {editHolidayError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Holiday Name *</label>
              <Input
                placeholder="e.g. Republic Day"
                value={editHolidayForm.name}
                onChange={(e) => setEditHolidayForm({ ...editHolidayForm, name: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Date *</label>
              <Input
                type="date"
                value={editHolidayForm.date}
                onChange={(e) => setEditHolidayForm({ ...editHolidayForm, date: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Type</label>
              <select
                value={editHolidayForm.type}
                onChange={(e) => setEditHolidayForm({ ...editHolidayForm, type: e.target.value as HolidayType })}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="OPTIONAL">Optional</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsOptional"
                checked={editHolidayForm.isOptional}
                onChange={(e) => setEditHolidayForm({ ...editHolidayForm, isOptional: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="editIsOptional" className="text-xs font-medium text-slate-600">Optional Holiday</label>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditHolidayModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={editHolidaySubmitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {editHolidaySubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Holiday Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteHolidayConfirmOpen}
        title="Delete Holiday"
        description="Are you sure you want to delete this holiday? This action cannot be undone."
        onConfirm={confirmDeleteHoliday}
        onCancel={() => {
          setIsDeleteHolidayConfirmOpen(false);
          setHolidayToDelete(null);
        }}
      />

    </div>
  );
}

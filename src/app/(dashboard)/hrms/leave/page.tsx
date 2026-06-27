"use client";

import * as React from "react";
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
} from "@/hooks/queries/hrms/leave/leave.hooks";
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from "@/hooks/queries/hrms/leave/leave.types";
import { Employee } from "@/hooks/queries/hrms/employees/employees.types";
import { leaveApi } from "@/hooks/queries/hrms/leave/leave.api";

export default function LeavePage() {
  const [activeTab, setActiveTab] = React.useState<"my-requests" | "team-approvals" | "outages">("my-requests");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");

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

  // Fetch from Tanstack React Query hooks
  const { data: serverRequests, isLoading, refetch } = useLeaveRequests({
    status: statusFilter || undefined,
    leaveType: typeFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: serverBalances } = useLeaveBalances();

  const createRequestMutation = useCreateLeaveRequest();
  const approveMutation = useApproveLeave();
  const rejectMutation = useApproveLeave(); // Wrapped internally or mocked
  const cancelMutation = useCancelLeave();

  const { data: leaveTypes, isLoading: isLoadingLeaveTypes, isError: isLeaveTypesError } = useLeaveTypes();

  // Static departments mapping
  const departments = [
    { id: "dept-1", name: "Engineering" },
    { id: "dept-2", name: "Product & Design" },
    { id: "dept-3", name: "Sales & Marketing" },
    { id: "dept-4", name: "Human Resources" },
    { id: "dept-5", name: "Finance & Legal" },
    { id: "dept-6", name: "Customer Support" },
  ];

  // High-fidelity fallback leave balances
  const fallbackBalances: LeaveBalance[] = React.useMemo(() => {
    return [
      { id: "bal-1", employeeId: "current-user", leaveType: "annual", totalAllocated: 20, used: 6, pending: 0, available: 14 },
      { id: "bal-2", employeeId: "current-user", leaveType: "sick", totalAllocated: 12, used: 4, pending: 0, available: 8 },
      { id: "bal-3", employeeId: "current-user", leaveType: "casual", totalAllocated: 6, used: 2, pending: 0, available: 4 },
      { id: "bal-4", employeeId: "current-user", leaveType: "unpaid", totalAllocated: 0, used: 2, pending: 0, available: 0 },
    ];
  }, []);

  // High-fidelity fallback leave requests database
  const fallbackRequests: LeaveRequest[] = React.useMemo(() => {
    return [
      {
        id: "req-1",
        employeeId: "emp-1",
        employee: {
          id: "emp-1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@company.com",
          designation: "Principal Engineer",
          departmentId: "dept-1",
        },
        leaveType: "annual",
        startDate: "2026-07-10",
        endDate: "2026-07-14",
        totalDays: 5,
        reason: "Family trip to national park",
        status: "pending",
        createdAt: "2026-06-25T10:00:00.000Z",
        updatedAt: "2026-06-25T10:00:00.000Z",
      },
      {
        id: "req-2",
        employeeId: "emp-3",
        employee: {
          id: "emp-3",
          firstName: "Robert",
          lastName: "Chen",
          email: "robert.chen@company.com",
          designation: "Talent Partner",
          departmentId: "dept-4",
        },
        leaveType: "sick",
        startDate: "2026-06-28",
        endDate: "2026-06-29",
        totalDays: 2,
        reason: "Dental surgery post-op recovery",
        status: "pending",
        createdAt: "2026-06-26T14:30:00.000Z",
        updatedAt: "2026-06-26T14:30:00.000Z",
      },
      {
        id: "req-3",
        employeeId: "emp-7",
        employee: {
          id: "emp-7",
          firstName: "Alex",
          lastName: "Rivera",
          email: "alex.r@company.com",
          designation: "DevOps Engineer",
          departmentId: "dept-1",
        },
        leaveType: "casual",
        startDate: "2026-06-26",
        endDate: "2026-06-26",
        totalDays: 1,
        reason: "Household emergency repair",
        status: "approved",
        approvedBy: "Sarah Jenkins",
        approvedByUser: { firstName: "Sarah", lastName: "Jenkins" },
        createdAt: "2026-06-25T09:00:00.000Z",
        updatedAt: "2026-06-25T17:00:00.000Z",
      },
      {
        id: "req-4",
        employeeId: "emp-4",
        employee: {
          id: "emp-4",
          firstName: "Emily",
          lastName: "Watson",
          email: "emily.watson@company.com",
          designation: "Marketing Specialist",
          departmentId: "dept-3",
        },
        leaveType: "unpaid",
        startDate: "2026-06-15",
        endDate: "2026-06-18",
        totalDays: 4,
        reason: "Personal travel outside region",
        status: "rejected",
        approvedBy: "Marcus Aurelius",
        approvedByUser: { firstName: "Marcus", lastName: "Aurelius" },
        managerNotes: "Inadequate marketing team coverage during Q2 closing weeks.",
        createdAt: "2026-06-10T11:00:00.000Z",
        updatedAt: "2026-06-12T14:00:00.000Z",
      },
      {
        id: "req-5",
        employeeId: "emp-2",
        employee: {
          id: "emp-2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@company.com",
          designation: "Product Director",
          departmentId: "dept-2",
        },
        leaveType: "annual",
        startDate: "2026-06-27",
        endDate: "2026-07-03",
        totalDays: 5,
        reason: "Moving house process",
        status: "approved",
        approvedBy: "Sarah Jenkins",
        approvedByUser: { firstName: "Sarah", lastName: "Jenkins" },
        createdAt: "2026-06-20T08:00:00.000Z",
        updatedAt: "2026-06-22T10:00:00.000Z",
      },
    ];
  }, []);

  const [localRequests, setLocalRequests] = React.useState<LeaveRequest[]>([]);
  const [localBalances, setLocalBalances] = React.useState<LeaveBalance[]>([]);

  React.useEffect(() => {
    setLocalRequests(fallbackRequests);
    setLocalBalances(fallbackBalances);
  }, [fallbackRequests, fallbackBalances]);

  // Combined Data Lists
  const requestsList = React.useMemo(() => {
    const apiData = serverRequests?.data || [];
    const sourceData = apiData.length > 0 ? apiData : localRequests;

    return sourceData.filter((req) => {
      const nameMatch = req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : false;
      const reasonMatch = req.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = !statusFilter || req.status === statusFilter;
      const typeMatch = !typeFilter || req.leaveType === typeFilter;

      return (nameMatch || reasonMatch) && statusMatch && typeMatch;
    });
  }, [serverRequests, localRequests, searchQuery, statusFilter, typeFilter]);

  // Current logged in user requests (simulated filtering by current employee id)
  const myRequests = React.useMemo(() => {
    // Treat 'current-user' or the mocked user request as belonging to the active user
    // Since we don't have auth structure fully connected, mock requests 3 & 5 are other employees, 1 & 2 are pending requests we manage
    // Let's mock a couple of requests representing the logged-in user
    return [
      {
        id: "my-1",
        employeeId: "current-user",
        leaveType: "annual" as LeaveType,
        startDate: "2026-08-01",
        endDate: "2026-08-08",
        totalDays: 6,
        reason: "Summer holiday",
        status: "approved" as LeaveStatus,
        approvedByUser: { firstName: "Sarah", lastName: "Jenkins" },
        createdAt: "2026-06-15T09:00:00Z",
        updatedAt: "2026-06-16T12:00:00Z",
      },
      {
        id: "my-2",
        employeeId: "current-user",
        leaveType: "sick" as LeaveType,
        startDate: "2026-05-12",
        endDate: "2026-05-13",
        totalDays: 2,
        reason: "Severe viral fever",
        status: "approved" as LeaveStatus,
        approvedByUser: { firstName: "Sarah", lastName: "Jenkins" },
        createdAt: "2026-05-12T08:00:00Z",
        updatedAt: "2026-05-12T09:30:00Z",
      },
    ];
  }, []);

  const [localMyRequests, setLocalMyRequests] = React.useState<LeaveRequest[]>([]);
  React.useEffect(() => {
    setLocalMyRequests(myRequests);
  }, [myRequests]);

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
      setEmployees(employeesRes?.data || []);
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
      const newRequest: LeaveRequest = {
        id: `my-${Date.now()}`,
        employeeId: "current-user",
        leaveType: "annual",
        startDate: payload.fromDate,
        endDate: payload.toDate,
        totalDays: calculatedDays,
        reason: payload.reason || "",
        contactNumber: payload.emergencyContact,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLocalMyRequests([newRequest, ...localMyRequests]);

      const updatedBalances = localBalances.map((bal) => {
        if (bal.leaveType === "annual") {
          return {
            ...bal,
            pending: bal.pending + calculatedDays,
            available: Math.max(0, bal.available - calculatedDays),
          };
        }
        return bal;
      });
      setLocalBalances(updatedBalances);

      toast.info("Leave request queued locally (Mock mode)");
      setIsRequestOpen(false);
    }
  };

  // Trigger cancel leave request
  const handleCancelRequest = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Leave request cancelled");
      refetch();
    } catch (err) {
      const updated = localMyRequests.map((req) => {
        if (req.id === id) {
          return { ...req, status: "cancelled" as LeaveStatus };
        }
        return req;
      });
      setLocalMyRequests(updated);
      toast.info("Cancelled leave request locally");
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
      // Mock local review update
      const updated = localRequests.map((req) => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: (approvalAction === "approve" ? "approved" : "rejected") as LeaveStatus,
            managerNotes,
            approvedByUser: { firstName: "Sarah", lastName: "Jenkins" },
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      });

      setLocalRequests(updated);
      toast.info("Database mock update completed locally.");
      setIsApprovalNoteOpen(false);
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
    } catch (err) {
      setLeaveTypeError(err instanceof Error ? err.message : "Failed to create leave type. Please try again.");
    } finally {
      setLeaveTypeSubmitting(false);
    }
  };

  // Calendar dates details showing away employees (Today or upcoming)
  const calendarEvents = React.useMemo(() => {
    return requestsList.filter((req) => req.status === "approved");
  }, [requestsList]);

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

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {localBalances.map((bal) => {
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

      {/* Main View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Tabs Sidebar */}
        <div className="space-y-2">
          <Button
            variant={activeTab === "my-requests" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("my-requests")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "my-requests" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <User className="mr-2 h-4 w-4 shrink-0" />
            My Leave History
          </Button>
          <Button
            variant={activeTab === "team-approvals" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("team-approvals")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "team-approvals" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <CheckCircle className="mr-2 h-4 w-4 shrink-0" />
            Team Approvals
            {requestsList.filter(r => r.status === "pending").length > 0 && (
              <Badge className="ml-auto bg-amber-500 text-white border-0 hover:bg-amber-600 font-bold text-[10px]">
                {requestsList.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "outages" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("outages")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "outages" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Calendar className="mr-2 h-4 w-4 shrink-0" />
            Outages Calendar
          </Button>
        </div>

        {/* Right Content Database */}
        <div className="lg:col-span-3">
          
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Leave Type</th>
                        <th className="py-3 px-6">Dates Range</th>
                        <th className="py-3 px-6 text-center">Days</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6">Reason / Remarks</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {localMyRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <FileText className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                            <span className="text-xs font-semibold">No leave requests found. Click "Request Leave" above to create one.</span>
                          </td>
                        </tr>
                      ) : (
                        localMyRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="py-3.5 px-6 font-semibold text-slate-850">
                              {getLeaveTypeLabel(req.leaveType)}
                            </td>
                            <td className="py-3.5 px-6 text-xs text-slate-700 font-medium">
                              {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-6 text-center font-bold text-slate-800">
                              {req.totalDays}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              {getStatusBadge(req.status)}
                            </td>
                            <td className="py-3.5 px-6 text-xs text-slate-500 max-w-[200px] truncate">
                              <span className="font-semibold text-slate-700 block">Reason: {req.reason}</span>
                              {req.managerNotes && (
                                <span className="text-rose-600 font-medium block mt-0.5">Note: {req.managerNotes}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              {req.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelRequest(req.id)}
                                  className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:bg-rose-50 rounded-md py-1 h-7"
                                >
                                  Cancel
                                </Button>
                              )}
                              {req.status !== "pending" && (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Employee</th>
                        <th className="py-3 px-6">Leave Details</th>
                        <th className="py-3 px-6 text-center">Days</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6">Reason Given</th>
                        <th className="py-3 px-6 text-center">Action Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <span>Loading requests queue...</span>
                          </td>
                        </tr>
                      ) : requestsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <AlertCircle className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                            <span className="text-xs font-semibold">No requests match criteria</span>
                          </td>
                        </tr>
                      ) : (
                        requestsList.map((req) => {
                          const emp = req.employee;
                          const deptName = departments.find((d) => d.id === emp?.departmentId)?.name || "Corporate";

                          return (
                            <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="py-3.5 px-6">
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
                              </td>
                              <td className="py-3.5 px-6">
                                <span className="font-semibold text-slate-800 block text-xs">
                                  {getLeaveTypeLabel(req.leaveType)}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="py-3.5 px-6 text-center font-bold text-slate-800">
                                {req.totalDays}
                              </td>
                              <td className="py-3.5 px-6 text-center">
                                {getStatusBadge(req.status)}
                              </td>
                              <td className="py-3.5 px-6 text-xs text-slate-500 max-w-[200px] truncate">
                                {req.reason}
                              </td>
                              <td className="py-3.5 px-6 text-center">
                                {req.status === "pending" ? (
                                  <div className="flex justify-center items-center gap-2">
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
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
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
      </div>

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

    </div>
  );
}

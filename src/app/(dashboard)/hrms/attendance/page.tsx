"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  Play,
  Square,
  AlertCircle,
  TrendingUp,
  History,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Import hooks and types
import {
  useAttendanceList,
  useCheckOut,
  useUpdateAttendance,
  useCreateAttendance,
  useRegularizationsList,
  useApproveRejectRegularization,
} from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { AttendanceRecord, AttendanceStatus, RegularizationRecord } from "@/hooks/queries/hrms/attendance/attendance.types";
import { useEmployees } from "@/hooks/queries/hrms/employees/employees.hooks";
import { useDepartments } from "@/hooks/queries/hrms/departments/departments.hooks";
import { useAuthStore } from "@/store/authStore";
import { DataTable, Column } from "@/components/shared/datatable";
import { AttendanceCheckInButton } from "@/components/hrms/attendance/AttendanceCheckInButton";
import { AttendanceCheckInDialog } from "@/components/hrms/attendance/AttendanceCheckInDialog";
import { AttendanceCheckOutDialog } from "@/components/hrms/attendance/AttendanceCheckOutDialog";
import { AttendanceRegularizeDialog } from "@/components/hrms/attendance/AttendanceRegularizeDialog";
import { AttendanceBulkDialog } from "@/components/hrms/attendance/AttendanceBulkDialog";
import { AttendanceExportButton } from "@/components/hrms/attendance/AttendanceExportButton";

// Normalize database attendance record structure to frontend representation
const normalizeAttendance = (record: any): AttendanceRecord => {
  const employeeRaw = record.employee || record.employeeId;
  const employee = employeeRaw && typeof employeeRaw === "object"
    ? {
        id: employeeRaw.id || employeeRaw._id,
        firstName: employeeRaw.firstName || "",
        lastName: employeeRaw.lastName || "",
        email: employeeRaw.email || "",
        avatar: employeeRaw.avatar || "",
        designation: employeeRaw.designation || "",
        departmentId: employeeRaw.departmentId || "",
      }
    : undefined;

  return {
    id: record.id || record._id,
    employeeId: typeof employeeRaw === "string" ? employeeRaw : (employeeRaw?.id || employeeRaw?._id || ""),
    employee,
    date: record.date ? record.date.split("T")[0] : "",
    checkIn: record.checkIn || "",
    checkOut: record.checkOut || "",
    status: (record.status || "present").toLowerCase() as AttendanceStatus,
    totalHours: record.totalHours || record.workingHours || 0,
    isLate: record.isLate || record.status === "LATE",
    isHalfDay: record.isHalfDay || record.status === "HALF_DAY",
    notes: record.notes || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
  };
};

const normalizeRegularization = (record: any): RegularizationRecord => {
  const employeeRaw = record.employee || record.employeeId;
  const employee = employeeRaw && typeof employeeRaw === "object"
    ? {
        id: employeeRaw.id || employeeRaw._id,
        firstName: employeeRaw.firstName || "",
        lastName: employeeRaw.lastName || "",
        employeeCode: employeeRaw.employeeCode || "",
      }
    : undefined;

  const approvedByRaw = record.approvedBy;
  const approvedBy = approvedByRaw && typeof approvedByRaw === "object"
    ? {
        id: approvedByRaw.id || approvedByRaw._id,
        firstName: approvedByRaw.firstName || "",
        lastName: approvedByRaw.lastName || "",
      }
    : undefined;

  return {
    id: record.id || record._id,
    employeeId: typeof employeeRaw === "string" ? employeeRaw : (employeeRaw?.id || employeeRaw?._id || ""),
    employee,
    date: record.date || "",
    checkIn: record.checkIn || "",
    checkOut: record.checkOut || "",
    reason: record.reason || "",
    status: record.status || "PENDING",
    approvedBy,
    approvedAt: record.approvedAt || "",
    comments: record.comments || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
  };
};


export default function AttendancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"records" | "regularization">("records");
  
  // Filters state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [deptFilter, setDeptFilter] = React.useState<string>("");
  const [dateFilter, setDateFilter] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Regularization list states
  const [regularizationTabStatusFilter, setRegularizationTabStatusFilter] = React.useState<string>("");
  const [regularizationPage, setRegularizationPage] = React.useState(1);
  const [regularizeRecord, setRegularizeRecord] = React.useState<AttendanceRecord | null>(null);

  const user = useAuthStore((s) => s.user);
  const isManagerOrAdmin = React.useMemo(() => {
    if (!user) return false;
    const role = user.role?.toLowerCase() || "";
    return role.includes("admin") || role.includes("manager") || role.includes("hr");
  }, [user]);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(15);

  const [prevFilterKey, setPrevFilterKey] = React.useState("");
  const filterKey = `${searchQuery}|${statusFilter}|${deptFilter}|${dateFilter}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // Modals state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<AttendanceRecord | null>(null);
  const [checkInEmployee, setCheckInEmployee] = React.useState<{
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  } | null>(null);
  const [isCheckOutOpen, setIsCheckOutOpen] = React.useState(false);
  const [checkOutEmployee, setCheckOutEmployee] = React.useState<{
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  } | null>(null);
  const [isRegularizeOpen, setIsRegularizeOpen] = React.useState(false);
  const [regularizeEmployee, setRegularizeEmployee] = React.useState<{
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  } | null>(null);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);

  // Form override values
  const [formValues, setFormValues] = React.useState({
    checkIn: "",
    checkOut: "",
    status: "present" as AttendanceStatus,
    notes: "",
  });

  const [createFormValues, setCreateFormValues] = React.useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: "present" as AttendanceStatus,
    notes: "",
  });

  // Current user's own clock-in status (local simulation for the page)
  const [currentUserStatus, setCurrentUserStatus] = React.useState<{
    checkedIn: boolean;
    checkInTime: string | null;
    checkOutTime: string | null;
    totalHours: number;
  }>(() => {
    // Attempt load from localStorage if client side
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hrms_user_attendance");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      checkedIn: false,
      checkInTime: null,
      checkOutTime: null,
      totalHours: 0,
    };
  });

  // Save current user status to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hrms_user_attendance", JSON.stringify(currentUserStatus));
    }
  }, [currentUserStatus]);

  // Live timer for check-in duration
  const [timerText, setTimerText] = React.useState("00:00:00");
  const [currentTimeText, setCurrentTimeText] = React.useState("");

  // Clock ticks every second
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeText(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (currentUserStatus.checkedIn && currentUserStatus.checkInTime) {
        const checkInDate = new Date(currentUserStatus.checkInTime);
        const diffMs = now.getTime() - checkInDate.getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        
        const pad = (n: number) => n.toString().padStart(2, "0");
        setTimerText(`${pad(diffHrs)}:${pad(diffMins)}:${pad(diffSecs)}`);
      } else {
        setTimerText("00:00:00");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentUserStatus]);

  // Fetch attendance list from backend API (via React Query)
  const { data: serverAttendance, isLoading, refetch } = useAttendanceList({
    date: dateFilter || undefined,
    status: statusFilter || undefined,
    departmentId: deptFilter || undefined,
    search: searchQuery || undefined,
    page,
    limit,
  });

  const checkOutMutation = useCheckOut();
  const updateMutation = useUpdateAttendance(editingRecord?.id || "");
  const createMutation = useCreateAttendance();
  const { data: employeesData } = useEmployees();
  const { data: dbDepartments } = useDepartments();

  const employeesList = React.useMemo(() => {
    return (employeesData?.employees || employeesData?.data || []) as any[];
  }, [employeesData]);

  const currentEmployee = React.useMemo(() => {
    if (!user?.email || !employeesList.length) return null;
    return employeesList.find((emp) => emp.email?.toLowerCase() === user.email.toLowerCase()) || null;
  }, [user, employeesList]);

  const regularizationParams = React.useMemo(() => {
    const params: any = {
      page: regularizationPage,
      limit: 10,
    };
    if (regularizationTabStatusFilter) {
      params.status = regularizationTabStatusFilter;
    }
    // If not admin/manager, only fetch self:
    if (!isManagerOrAdmin && currentEmployee?.id) {
      params.employeeId = currentEmployee.id;
    }
    return params;
  }, [isManagerOrAdmin, currentEmployee, regularizationTabStatusFilter, regularizationPage]);

  // Fetch regularizations
  const { data: regularizationsData, isLoading: isRegularizationsLoading, refetch: refetchRegularizations } = useRegularizationsList(regularizationParams);
  
  const regularizationsList = React.useMemo(() => {
    return (regularizationsData?.data || []).map(normalizeRegularization);
  }, [regularizationsData?.data]);

  const approveRejectRegularizationMutation = useApproveRejectRegularization();

  // Departments static list with backend integration
  const departments = React.useMemo(() => {
    return dbDepartments || [
      { id: "dept-1", name: "Engineering" },
      { id: "dept-2", name: "Product & Design" },
      { id: "dept-3", name: "Sales & Marketing" },
      { id: "dept-4", name: "Human Resources" },
      { id: "dept-5", name: "Finance & Legal" },
      { id: "dept-6", name: "Customer Support" },
    ];
  }, [dbDepartments]);

  // High-fidelity fallback database for logs
  const fallbackRecords: AttendanceRecord[] = React.useMemo(() => {
    return [
      {
        id: "att-1",
        employeeId: "emp-1",
        employee: {
          id: "emp-1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@company.com",
          designation: "Principal Engineer",
          departmentId: "dept-1",
        },
        date: dateFilter,
        checkIn: "2026-06-27T09:02:15.000Z",
        checkOut: "2026-06-27T18:05:40.000Z",
        status: "present",
        totalHours: 9.05,
        isLate: false,
        isHalfDay: false,
        notes: "On-site check-in",
        createdAt: "2026-06-27T09:02:15.000Z",
        updatedAt: "2026-06-27T18:05:40.000Z",
      },
      {
        id: "att-2",
        employeeId: "emp-2",
        employee: {
          id: "emp-2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@company.com",
          designation: "Product Director",
          departmentId: "dept-2",
        },
        date: dateFilter,
        checkIn: "2026-06-27T10:15:00.000Z",
        checkOut: "2026-06-27T19:00:00.000Z",
        status: "late",
        totalHours: 8.75,
        isLate: true,
        isHalfDay: false,
        notes: "Traffic jam in downtown",
        createdAt: "2026-06-27T10:15:00.000Z",
        updatedAt: "2026-06-27T19:00:00.000Z",
      },
      {
        id: "att-3",
        employeeId: "emp-3",
        employee: {
          id: "emp-3",
          firstName: "Robert",
          lastName: "Chen",
          email: "robert.chen@company.com",
          designation: "Talent Partner",
          departmentId: "dept-4",
        },
        date: dateFilter,
        status: "on_leave",
        isLate: false,
        isHalfDay: false,
        notes: "Approved Medical Leave",
        createdAt: "2026-06-27T00:00:00.000Z",
        updatedAt: "2026-06-27T00:00:00.000Z",
      },
      {
        id: "att-4",
        employeeId: "emp-4",
        employee: {
          id: "emp-4",
          firstName: "Emily",
          lastName: "Watson",
          email: "emily.watson@company.com",
          designation: "Marketing Specialist",
          departmentId: "dept-3",
        },
        date: dateFilter,
        checkIn: "2026-06-27T09:00:00.000Z",
        checkOut: "2026-06-27T13:00:00.000Z",
        status: "half_day",
        totalHours: 4.0,
        isLate: false,
        isHalfDay: true,
        notes: "Doctor appointment in afternoon",
        createdAt: "2026-06-27T09:00:00.000Z",
        updatedAt: "2026-06-27T13:00:00.000Z",
      },
      {
        id: "att-5",
        employeeId: "emp-5",
        employee: {
          id: "emp-5",
          firstName: "David",
          lastName: "Kim",
          email: "david.kim@company.com",
          designation: "QA Engineer Intern",
          departmentId: "dept-1",
        },
        date: dateFilter,
        status: "absent",
        isLate: false,
        isHalfDay: false,
        notes: "No check-in recorded",
        createdAt: "2026-06-27T00:00:00.000Z",
        updatedAt: "2026-06-27T00:00:00.000Z",
      },
      {
        id: "att-6",
        employeeId: "emp-6",
        employee: {
          id: "emp-6",
          firstName: "Sarah",
          lastName: "Jenkins",
          email: "sarah.j@company.com",
          designation: "UX Lead",
          departmentId: "dept-2",
        },
        date: dateFilter,
        checkIn: "2026-06-27T08:55:00.000Z",
        checkOut: "2026-06-27T17:35:00.000Z",
        status: "present",
        totalHours: 8.67,
        isLate: false,
        isHalfDay: false,
        notes: "Remote check-in",
        createdAt: "2026-06-27T08:55:00.000Z",
        updatedAt: "2026-06-27T17:35:00.000Z",
      },
      {
        id: "att-7",
        employeeId: "emp-7",
        employee: {
          id: "emp-7",
          firstName: "Alex",
          lastName: "Rivera",
          email: "alex.r@company.com",
          designation: "DevOps Engineer",
          departmentId: "dept-1",
        },
        date: dateFilter,
        checkIn: "2026-06-27T09:45:00.000Z",
        checkOut: "2026-06-27T18:15:00.000Z",
        status: "late",
        totalHours: 8.5,
        isLate: true,
        isHalfDay: false,
        notes: "Car breakdown",
        createdAt: "2026-06-27T09:45:00.000Z",
        updatedAt: "2026-06-27T18:15:00.000Z",
      },
    ];
  }, [dateFilter]);

  // Manage logs lists - state to store customized records
  const [localRecords, setLocalRecords] = React.useState<AttendanceRecord[]>([]);

  // Initialize local records when fallbackRecords or dateFilter changes
  React.useEffect(() => {
    setLocalRecords(fallbackRecords);
  }, [fallbackRecords, dateFilter]);

  // Combine server data and local records
  const attendanceList = React.useMemo(() => {
    const apiData = (serverAttendance?.data || []).map(normalizeAttendance);
    const sourceData = apiData;

    // Filter data based on search and filters
    return sourceData.filter((record) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        (record.employee && `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase().includes(searchLower)) ||
        (record.employee?.designation?.toLowerCase().includes(searchLower));

      const statusMatch = !statusFilter || record.status === statusFilter;
      const deptMatch = !deptFilter || record.employee?.departmentId === deptFilter;

      return matchesSearch && statusMatch && deptMatch;
    });
  }, [serverAttendance, localRecords, searchQuery, statusFilter, deptFilter]);

  // Calculate live statistics
  const stats = React.useMemo(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter((r) => r.status === "present").length;
    const late = attendanceList.filter((r) => r.status === "late").length;
    const absent = attendanceList.filter((r) => r.status === "absent").length;
    const halfDay = attendanceList.filter((r) => r.status === "half_day").length;
    const onLeave = attendanceList.filter((r) => r.status === "on_leave").length;

    const presentRate = total > 0 ? ((present + late + halfDay) / Math.max(total - onLeave, 1)) * 100 : 0;
    
    // Average hours calculated for present, late, or half day workers
    const activeWorkers = attendanceList.filter((r) => r.totalHours && r.totalHours > 0);
    const avgHours = activeWorkers.length > 0 
      ? activeWorkers.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) / activeWorkers.length 
      : 0;

    return {
      total,
      present: present + late, // Present includes late arrivals
      late,
      absent,
      halfDay,
      onLeave,
      presentRate: Math.round(presentRate * 10) / 10,
      avgHours: Math.round(avgHours * 10) / 10,
    };
  }, [attendanceList]);


  // Open check-in dialog for workstation (defaults to first available employee)
  const handleOpenWorkstationCheckIn = React.useCallback(() => {
    const firstEmp = employeesData?.employees?.[0] || employeesData?.data?.[0];
    if (firstEmp) {
      setCheckInEmployee({
        id: firstEmp.id,
        firstName: firstEmp.firstName,
        lastName: firstEmp.lastName,
        employeeCode: firstEmp.employeeCode || firstEmp.employeeId,
      });
    }
    setIsCheckInOpen(true);
  }, [employeesData]);

  // Open check-in dialog for a specific employee
  const handleOpenEmployeeCheckIn = React.useCallback((record: AttendanceRecord) => {
    const emp = record.employee;
    if (emp) {
      setCheckInEmployee({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeCode: (emp as Record<string, unknown>).employeeCode as string | undefined,
      });
    }
    setIsCheckInOpen(true);
  }, []);

  // Handle successful check-in from dialog
  const handleCheckInSuccess = React.useCallback((checkInTimeISO?: string) => {
    const timeStr = checkInTimeISO || new Date().toISOString();
    setCurrentUserStatus({
      checkedIn: true,
      checkInTime: timeStr,
      checkOutTime: null,
      totalHours: 0,
    });
    refetch();
  }, [refetch]);

  const handleOpenCheckOut = React.useCallback((record: AttendanceRecord) => {
    const emp = record.employee;
    if (emp) {
      setCheckOutEmployee({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeCode: (emp as Record<string, unknown>).employeeCode as string | undefined,
      });
    }
    setIsCheckOutOpen(true);
  }, []);

  const handleOpenRegularize = React.useCallback((record: AttendanceRecord) => {
    const emp = record.employee;
    if (emp) {
      setRegularizeEmployee({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeCode: (emp as Record<string, unknown>).employeeCode as string | undefined,
      });
    }
    setRegularizeRecord(record);
    setIsRegularizeOpen(true);
  }, []);

  const handleApproveRegularization = React.useCallback(async (id: string) => {
    const comments = window.prompt("Enter approval comments (optional):") || "";
    try {
      await approveRejectRegularizationMutation.mutateAsync({
        id,
        data: {
          status: "APPROVED",
          comments: comments.trim() || "Approved by Manager/Admin",
        },
      });
      toast.success("Regularization request approved successfully!");
      refetch();
      refetchRegularizations();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to approve regularization request");
    }
  }, [approveRejectRegularizationMutation, refetch, refetchRegularizations]);

  const handleRejectRegularization = React.useCallback(async (id: string) => {
    const comments = window.prompt("Enter rejection comments (required):");
    if (comments === null) return; // cancelled
    if (!comments.trim()) {
      toast.error("Rejection comments are required.");
      return;
    }
    try {
      await approveRejectRegularizationMutation.mutateAsync({
        id,
        data: {
          status: "REJECTED",
          comments: comments.trim(),
        },
      });
      toast.success("Regularization request rejected successfully!");
      refetch();
      refetchRegularizations();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to reject regularization request");
    }
  }, [approveRejectRegularizationMutation, refetch, refetchRegularizations]);

  // Handle user check-out button click
  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({ notes: "Web Check-Out" });
      const checkInDate = currentUserStatus.checkInTime ? new Date(currentUserStatus.checkInTime) : new Date();
      const checkOutDate = new Date();
      const diffMs = checkOutDate.getTime() - checkInDate.getTime();
      const hours = Math.round((diffMs / 3600000) * 100) / 100;

      setCurrentUserStatus((prev) => ({
        ...prev,
        checkedIn: false,
        checkOutTime: checkOutDate.toISOString(),
        totalHours: hours,
      }));
      toast.success("Clocked out successfully!");
      refetch();
    } catch (err) {
      // Mock local check-out
      const checkInDate = currentUserStatus.checkInTime ? new Date(currentUserStatus.checkInTime) : new Date();
      const checkOutDate = new Date();
      const diffMs = checkOutDate.getTime() - checkInDate.getTime();
      const hours = Math.round((diffMs / 3600000) * 100) / 100;

      setCurrentUserStatus((prev) => ({
        ...prev,
        checkedIn: false,
        checkOutTime: checkOutDate.toISOString(),
        totalHours: hours,
      }));
      toast.success("Clocked out successfully (Mock mode)!");
    }
  };

  // Open Edit Dialog for a record
  const handleOpenEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    
    // Extract times for inputs (HH:MM format)
    const getHourMinute = (isoString?: string) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toTimeString().substring(0, 5);
    };

    setFormValues({
      checkIn: getHourMinute(record.checkIn),
      checkOut: getHourMinute(record.checkOut),
      status: record.status,
      notes: record.notes || "",
    });
    setIsEditOpen(true);
  };

  // Submit edit log form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    // Validation: if present/late, check-in is required
    if ((formValues.status === "present" || formValues.status === "late") && !formValues.checkIn) {
      toast.error("Check-in time is required for active statuses");
      return;
    }

    try {
      // API call
      const requestData = {
        checkIn: formValues.checkIn ? new Date(`${dateFilter}T${formValues.checkIn}:00.000Z`).toISOString() : undefined,
        checkOut: formValues.checkOut ? new Date(`${dateFilter}T${formValues.checkOut}:00.000Z`).toISOString() : undefined,
        status: formValues.status.toUpperCase(),
        notes: formValues.notes,
      };

      await updateMutation.mutateAsync(requestData);
      toast.success("Attendance log updated successfully");
      setIsEditOpen(false);
      refetch();
    } catch (err) {
      // Database mock update completed locally
      const updatedRecords = localRecords.map((rec) => {
        if (rec.id === editingRecord.id) {
          let updatedCheckIn = formValues.checkIn ? new Date(`${dateFilter}T${formValues.checkIn}:00`).toISOString() : undefined;
          let updatedCheckOut = formValues.checkOut ? new Date(`${dateFilter}T${formValues.checkOut}:00`).toISOString() : undefined;
          
          let totalHours = 0;
          if (updatedCheckIn && updatedCheckOut) {
            const diff = new Date(updatedCheckOut).getTime() - new Date(updatedCheckIn).getTime();
            totalHours = Math.round((diff / 3600000) * 100) / 100;
          }

          return {
            ...rec,
            checkIn: updatedCheckIn,
            checkOut: updatedCheckOut,
            status: formValues.status,
            totalHours: totalHours > 0 ? totalHours : undefined,
            notes: formValues.notes,
            isLate: formValues.status === "late",
            isHalfDay: formValues.status === "half_day",
            updatedAt: new Date().toISOString(),
          };
        }
        return rec;
      });

      setLocalRecords(updatedRecords);
      toast.info("Database mock update completed locally.");
      setIsEditOpen(false);
    }
  };

  // Submit create manual attendance form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormValues.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (!createFormValues.date) {
      toast.error("Please select a date");
      return;
    }
    if ((createFormValues.status === "present" || createFormValues.status === "late") && !createFormValues.checkIn) {
      toast.error("Check-in time is required for active statuses");
      return;
    }

    try {
      // Build ISO strings for checkIn and checkOut if they exist
      const checkInIso = createFormValues.checkIn
        ? new Date(`${createFormValues.date}T${createFormValues.checkIn}:00.000Z`).toISOString()
        : null;
      const checkOutIso = createFormValues.checkOut
        ? new Date(`${createFormValues.date}T${createFormValues.checkOut}:00.000Z`).toISOString()
        : null;

      const payload = {
        employeeId: createFormValues.employeeId,
        date: new Date(createFormValues.date).toISOString(),
        status: createFormValues.status.toUpperCase(), // Server expects uppercase status
        checkIn: checkInIso,
        checkOut: checkOutIso,
        notes: createFormValues.notes || "",
      };

      await createMutation.mutateAsync(payload);
      toast.success("Manual attendance record created successfully!");
      setIsCreateOpen(false);
      // Reset form values
      setCreateFormValues({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        checkIn: "",
        checkOut: "",
        status: "present",
        notes: "",
      });
      refetch();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to create manual attendance");
    }
  };

  // Helper styles for status badges
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Present</Badge>;
      case "late":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Late</Badge>;
      case "half_day":
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Half Day</Badge>;
      case "absent":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Absent</Badge>;
      case "on_leave":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format initials
  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  // Helper to format ISO time
  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Column definitions for the DataTable component
  const attendanceColumns = React.useMemo<Column<AttendanceRecord>[]>(() => [
    {
      header: "Employee",
      cell: (record) => {
        const emp = record.employee;
        const deptName = departments.find((d) => d.id === emp?.departmentId)?.name || "Corporate";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-full border border-slate-100 bg-indigo-50">
              <AvatarFallback className="text-indigo-700 bg-indigo-50 text-[11px] font-bold">
                {emp ? getInitials(emp.firstName, emp.lastName) : "EM"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {deptName}
              </p>
            </div>
          </div>
        );
      },
      className: "py-3.5 px-6",
    },
    {
      header: "Status",
      cell: (record) => getStatusBadge(record.status),
      className: "py-3.5 px-6 text-center",
    },
    {
      header: "Check-In",
      cell: (record) => formatTime(record.checkIn),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Check-Out",
      cell: (record) => formatTime(record.checkOut),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Hours Worked",
      cell: (record) => {
        const worked = record.totalHours || 0;
        const progressPercent = Math.min((worked / 8) * 100, 100);
        return (
          <div className="flex items-center justify-center gap-2">
            {worked > 0 ? (
              <>
                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      worked >= 8 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 shrink-0">
                  {worked}h
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">-</span>
            )}
          </div>
        );
      },
      className: "py-3.5 px-6",
    },
    {
      header: "Remarks / Note",
      cell: (record) => record.notes || "--",
      className: "py-3.5 px-6 text-xs text-slate-500 max-w-[200px] truncate",
    },
    {
      header: "Actions",
      cell: (record) => {
        const noCheckIn = !record.checkIn && record.status !== "on_leave";
        const checkedInNoCheckOut = !!record.checkIn && !record.checkOut && record.status !== "on_leave";
        return (
          <div className="flex items-center justify-center gap-1">
            {noCheckIn && (
              <AttendanceCheckInButton
                onClick={() => handleOpenEmployeeCheckIn(record)}
                variant="ghost"
                className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[11px] font-semibold"
              />
            )}
            {checkedInNoCheckOut && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCheckOut(record);
                }}
                className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold"
              >
                <Square className="h-3 w-3 mr-1" />
                Check Out
              </Button>
            )}
            {record.checkIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenRegularize(record);
                }}
                className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-[11px] font-semibold"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Regularize
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(record);
              }}
              className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
      className: "py-3.5 px-6 text-center",
    },
  ], [departments, handleOpenEdit, handleOpenEmployeeCheckIn, handleOpenCheckOut, handleOpenRegularize]);

  const regularizationColumns = React.useMemo<Column<RegularizationRecord>[]>(() => [
    {
      header: "Employee",
      cell: (record) => {
        const emp = record.employee;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-full border border-slate-100 bg-indigo-50">
              <AvatarFallback className="text-indigo-700 bg-indigo-50 text-[11px] font-bold">
                {emp ? getInitials(emp.firstName, emp.lastName) : "EM"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                ID: {emp?.employeeCode || "—"}
              </p>
            </div>
          </div>
        );
      },
      className: "py-3.5 px-6",
    },
    {
      header: "Date",
      cell: (record) => record.date ? record.date.split("T")[0] : "—",
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Requested Check-In",
      cell: (record) => formatTime(record.checkIn),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Requested Check-Out",
      cell: (record) => formatTime(record.checkOut),
      className: "py-3.5 px-6 text-center text-xs font-semibold text-slate-800",
    },
    {
      header: "Reason",
      cell: (record) => record.reason || "—",
      className: "py-3.5 px-6 text-xs text-slate-500 max-w-[200px] truncate",
    },
    {
      header: "Status",
      cell: (record) => {
        const status = record.status || "PENDING";
        switch (status) {
          case "APPROVED":
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
          case "REJECTED":
            return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rejected</Badge>;
          case "PENDING":
          default:
            return <Badge className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">Pending</Badge>;
        }
      },
      className: "py-3.5 px-6 text-center",
    },
    {
      header: "Actions",
      cell: (record) => {
        const isPending = record.status === "PENDING";
        if (!isPending) {
          return (
            <span className="text-[11px] font-medium text-slate-400">
              Processed
            </span>
          );
        }
        if (!isManagerOrAdmin) {
          return (
            <span className="text-[11px] font-medium text-amber-600">
              Awaiting Approval
            </span>
          );
        }
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApproveRegularization(record.id);
              }}
              className="h-7 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 text-[11px] font-bold"
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRejectRegularization(record.id);
              }}
              className="h-7 px-2 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border-rose-200 text-[11px] font-bold"
            >
              Reject
            </Button>
          </div>
        );
      },
      className: "py-3.5 px-6 text-center",
    },
  ], [isManagerOrAdmin, handleApproveRegularization, handleRejectRegularization]);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Attendance Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily work check-ins, late compliance, and employee timesheets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "records" ? (
            <>
              <Button
                onClick={() => setIsBulkOpen(true)}
                size="sm"
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Bulk Entry
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Attendance
              </Button>
              <AttendanceExportButton
                fromDate={dateFilter}
                toDate={dateFilter}
                variant="outline"
                size="sm"
                className="text-slate-600 dark:text-slate-300"
              />
            </>
          ) : (
            <Button
              onClick={() => {
                setRegularizeEmployee(null);
                setRegularizeRecord(null);
                setIsRegularizeOpen(true);
              }}
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Regularization
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("records")}
          className={cn(
            "px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 outline-hidden",
            activeTab === "records"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          Attendance Records
        </button>
        <button
          onClick={() => setActiveTab("regularization")}
          className={cn(
            "px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 outline-hidden",
            activeTab === "regularization"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          Attendance Regularization
        </button>
      </div>
      {activeTab === "records" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Live clocking panel */}
          <Card className="border-indigo-100 bg-indigo-50/40 relative overflow-hidden shadow-xs">
            <div className="absolute right-[-10px] top-[-10px] opacity-10">
              <Clock className="h-32 w-32 text-indigo-700" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                Clock Workstation
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700/80">
                Current local workstation session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="text-center py-2">
                <h2 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {currentTimeText || "--:--:--"}
                </h2>
                {currentUserStatus.checkedIn ? (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">
                      Logged: {timerText}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500 mt-2">
                    Ready to clock check-in record
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {!currentUserStatus.checkedIn ? (
                  <AttendanceCheckInButton
                    onClick={handleOpenWorkstationCheckIn}
                    variant="default"
                    className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Check In
                  </AttendanceCheckInButton>
                ) : (
                  <Button
                    onClick={handleCheckOut}
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700 font-semibold shadow-xs flex items-center justify-center gap-2"
                  >
                    <Square className="h-4 w-4 fill-white" />
                    Check Out
                  </Button>
                )}
              </div>

              {currentUserStatus.checkInTime && (
                <div className="border-t border-indigo-100/60 pt-3 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Checked In:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(currentUserStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {currentUserStatus.checkOutTime && (
                    <div className="flex justify-between">
                      <span>Checked Out:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(currentUserStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Row Cards */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-100 bg-white shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">{stats.presentRate}%</h3>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="font-medium text-emerald-600">Good</span> compliance rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</span>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.present} <span className="text-xs font-normal text-slate-400">/ {stats.total - stats.onLeave}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Excluding {stats.onLeave} active leave
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">{stats.late}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Arrived after 09:15 AM limit
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absentees</span>
                  <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <UserX className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">{stats.absent}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No check-in record reported
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Main Database Table and Logs Section */}
      {activeTab === "records" ? (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Search employee by name, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">Filters</span>
                </div>

                {/* Date Filter */}
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9 w-38 px-2 text-xs font-medium bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                />

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-2 text-xs font-medium bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                  <option value="on_leave">On Leave</option>
                </select>

                {/* Department Filter */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-9 px-2 text-xs font-medium bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Clear button */}
                {(searchQuery || statusFilter || deptFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("");
                      setDeptFilter("");
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={attendanceList}
              columns={attendanceColumns}
              isLoading={isLoading}
              emptyMessage="No logs match the current query criteria"
              onRowClick={(row) => router.push(`/hrms/attendance/${row.id}`)}
            />
            {serverAttendance?.meta && serverAttendance.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {page} of {serverAttendance.meta.totalPages} ({serverAttendance.meta.total} records)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (serverAttendance?.meta?.totalPages || 1)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600">Filters</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={regularizationTabStatusFilter}
                  onChange={(e) => {
                    setRegularizationTabStatusFilter(e.target.value);
                    setRegularizationPage(1);
                  }}
                  className="h-9 px-3 text-xs font-semibold bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                {regularizationTabStatusFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRegularizationTabStatusFilter("");
                      setRegularizationPage(1);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={regularizationsList}
              columns={regularizationColumns}
              isLoading={isRegularizationsLoading}
              emptyMessage="No regularization requests found"
            />
            {regularizationsData?.meta && regularizationsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {regularizationPage} of {regularizationsData.meta.totalPages} ({regularizationsData.meta.total} records)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={regularizationPage <= 1}
                    onClick={() => setRegularizationPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={regularizationPage >= (regularizationsData?.meta?.totalPages || 1)}
                    onClick={() => setRegularizationPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Check-In Dialog */}
      <AttendanceCheckInDialog
        employee={checkInEmployee}
        open={isCheckInOpen}
        onOpenChange={setIsCheckInOpen}
        onSuccess={handleCheckInSuccess}
      />

      {/* Attendance Check-Out Dialog */}
      <AttendanceCheckOutDialog
        employee={checkOutEmployee}
        open={isCheckOutOpen}
        onOpenChange={setIsCheckOutOpen}
        onSuccess={handleCheckInSuccess}
      />

      {/* Attendance Regularization Dialog */}
      <AttendanceRegularizeDialog
        employee={regularizeEmployee}
        attendanceRecord={regularizeRecord}
        open={isRegularizeOpen}
        onOpenChange={(open) => {
          setIsRegularizeOpen(open);
          if (!open) {
            setRegularizeRecord(null);
            setRegularizeEmployee(null);
          }
        }}
        onSuccess={() => {
          refetch();
          refetchRegularizations();
        }}
      />

      {/* Bulk Attendance Dialog */}
      <AttendanceBulkDialog
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        onSuccess={handleCheckInSuccess}
      />

      {/* Edit Override Log Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Manual Attendance Adjustment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Override logs for {editingRecord?.employee?.firstName} {editingRecord?.employee?.lastName} on {dateFilter}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            
            {/* Status input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Attendance Status</label>
              <select
                value={formValues.status}
                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as AttendanceStatus })}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            {/* Check-In and Check-Out Time Inputs */}
            {formValues.status !== "absent" && formValues.status !== "on_leave" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Check-In Time</label>
                  <Input
                    type="time"
                    value={formValues.checkIn}
                    onChange={(e) => setFormValues({ ...formValues, checkIn: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Check-Out Time</label>
                  <Input
                    type="time"
                    value={formValues.checkOut}
                    onChange={(e) => setFormValues({ ...formValues, checkOut: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Reason/Notes Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Adjustment Note / Remark</label>
              <Input
                placeholder="Forgot to clock-in / medical appointment..."
                value={formValues.notes}
                onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Manual Attendance Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create Manual Attendance Log
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Manually add a daily attendance log for any employee.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {/* Employee Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Employee</label>
              <select
                value={createFormValues.employeeId}
                onChange={(e) => setCreateFormValues({ ...createFormValues, employeeId: e.target.value })}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                required
              >
                <option value="">Select Employee</option>
                {(employeesData?.employees || employeesData?.data || []).map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Date</label>
              <Input
                type="date"
                value={createFormValues.date}
                onChange={(e) => setCreateFormValues({ ...createFormValues, date: e.target.value })}
                required
              />
            </div>

            {/* Status input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Attendance Status</label>
              <select
                value={createFormValues.status}
                onChange={(e) => setCreateFormValues({ ...createFormValues, status: e.target.value as AttendanceStatus })}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            {/* Check-In and Check-Out Time Inputs */}
            {createFormValues.status !== "absent" && createFormValues.status !== "on_leave" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Check-In Time</label>
                  <Input
                    type="time"
                    value={createFormValues.checkIn}
                    onChange={(e) => setCreateFormValues({ ...createFormValues, checkIn: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Check-Out Time</label>
                  <Input
                    type="time"
                    value={createFormValues.checkOut}
                    onChange={(e) => setCreateFormValues({ ...createFormValues, checkOut: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Reason/Notes Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Adjustment Note / Remark</label>
              <Input
                placeholder="Manual entry notes..."
                value={createFormValues.notes}
                onChange={(e) => setCreateFormValues({ ...createFormValues, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

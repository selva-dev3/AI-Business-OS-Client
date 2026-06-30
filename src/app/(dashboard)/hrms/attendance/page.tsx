"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader } from "@/components/ui/card";
import { Filter } from "lucide-react";

// Import hooks and types
import {
  useAttendanceList,
  useCheckOut,
  useUpdateAttendance,
  useCreateAttendance,
  useRegularizationsList,
  useApproveRejectRegularization,
} from "@/hooks/queries/hrms/attendance/attendance.hooks";
import {
  AttendanceRecord,
  AttendanceStatus,
  RegularizationRecord,
} from "@/hooks/queries/hrms/attendance/attendance.types";
import { useEmployees } from "@/hooks/queries/hrms/employees/employees.hooks";
import { useDepartments } from "@/hooks/queries/hrms/departments/departments.hooks";

// Import sub-components
import {
  AttendanceCheckInDialog,
  AttendanceCheckOutDialog,
  AttendanceRegularizeDialog,
  AttendanceBulkDialog,
  ApproveRejectConfirmDialog,
  AttendancePageHeader,
  CreateAttendanceDialog,
  AttendanceRecordsTable,
  AttendanceStatsCards,
  ClockWorkstationPanel,
  EditAttendanceDialog,
  RegularizationTable,
  TabNavigation,
  AttendanceFilters,
} from "@/components/hrms/attendance";
import { Button } from "@/components/ui/button";

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

  // Approve/Reject Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<"approve" | "reject" | null>(null);
  const [confirmRequestId, setConfirmRequestId] = React.useState<string | null>(null);
  const [confirmComments, setConfirmComments] = React.useState("");

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

  // Fetch attendance list from backend API
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
    if (!isManagerOrAdmin && currentEmployee?.id) {
      params.employeeId = currentEmployee.id;
    }
    return params;
  }, [isManagerOrAdmin, currentEmployee, regularizationTabStatusFilter, regularizationPage]);

  // Fetch regularizations
  const { data: regularizationsData, isLoading: isRegularizationsLoading, refetch: refetchRegularizations } = useRegularizationsList(
    regularizationParams,
    { enabled: activeTab === "regularization" }
  );
  
  const regularizationsList = React.useMemo(() => {
    return (regularizationsData?.data || []).map(normalizeRegularization);
  }, [regularizationsData?.data]);

  const approveRejectRegularizationMutation = useApproveRejectRegularization();

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

  const [localRecords, setLocalRecords] = React.useState<AttendanceRecord[]>([]);

  React.useEffect(() => {
    setLocalRecords(fallbackRecords);
  }, [fallbackRecords, dateFilter]);

  const attendanceList = React.useMemo(() => {
    const apiData = (serverAttendance?.data || []).map(normalizeAttendance);
    const sourceData = apiData;

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

  const stats = React.useMemo(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter((r) => r.status === "present").length;
    const late = attendanceList.filter((r) => r.status === "late").length;
    const absent = attendanceList.filter((r) => r.status === "absent").length;
    const halfDay = attendanceList.filter((r) => r.status === "half_day").length;
    const onLeave = attendanceList.filter((r) => r.status === "on_leave").length;

    const presentRate = total > 0 ? ((present + late + halfDay) / Math.max(total - onLeave, 1)) * 100 : 0;
    
    const activeWorkers = attendanceList.filter((r) => r.totalHours && r.totalHours > 0);
    const avgHours = activeWorkers.length > 0 
      ? activeWorkers.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) / activeWorkers.length 
      : 0;

    return {
      total,
      present: present + late,
      late,
      absent,
      halfDay,
      onLeave,
      presentRate: Math.round(presentRate * 10) / 10,
      avgHours: Math.round(avgHours * 10) / 10,
    };
  }, [attendanceList]);

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

  const handleApproveRegularization = React.useCallback((id: string) => {
    setConfirmType("approve");
    setConfirmRequestId(id);
    setConfirmComments("");
    setIsConfirmOpen(true);
  }, []);

  const handleRejectRegularization = React.useCallback((id: string) => {
    setConfirmType("reject");
    setConfirmRequestId(id);
    setConfirmComments("");
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmSubmit = React.useCallback(async () => {
    if (!confirmRequestId || !confirmType) return;
    if (confirmType === "reject" && !confirmComments.trim()) {
      toast.error("Rejection comments are required.");
      return;
    }

    try {
      await approveRejectRegularizationMutation.mutateAsync({
        id: confirmRequestId,
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
      refetchRegularizations();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || `Failed to ${confirmType} regularization request`);
    }
  }, [confirmRequestId, confirmType, confirmComments, approveRejectRegularizationMutation, refetch, refetchRegularizations]);

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

  const handleOpenEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if ((formValues.status === "present" || formValues.status === "late") && !formValues.checkIn) {
      toast.error("Check-in time is required for active statuses");
      return;
    }

    try {
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
      const checkInIso = createFormValues.checkIn
        ? new Date(`${createFormValues.date}T${createFormValues.checkIn}:00.000Z`).toISOString()
        : null;
      const checkOutIso = createFormValues.checkOut
        ? new Date(`${createFormValues.date}T${createFormValues.checkOut}:00.000Z`).toISOString()
        : null;

      const payload = {
        employeeId: createFormValues.employeeId,
        date: new Date(createFormValues.date).toISOString(),
        status: createFormValues.status.toUpperCase(),
        checkIn: checkInIso,
        checkOut: checkOutIso,
        notes: createFormValues.notes || "",
      };

      await createMutation.mutateAsync(payload);
      toast.success("Manual attendance record created successfully!");
      setIsCreateOpen(false);
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

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Page Header */}
      <AttendancePageHeader
        activeTab={activeTab}
        onBulkEntry={() => setIsBulkOpen(true)}
        onCreateAttendance={() => setIsCreateOpen(true)}
        onCreateRegularization={() => {
          setRegularizeEmployee(null);
          setRegularizeRecord(null);
          setIsRegularizeOpen(true);
        }}
        dateFilter={dateFilter}
      />

      {/* Tabs Menu */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "records" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Live clocking panel */}
          <ClockWorkstationPanel
            currentTime={currentTimeText}
            timerText={timerText}
            checkedIn={currentUserStatus.checkedIn}
            checkInTime={currentUserStatus.checkInTime}
            checkOutTime={currentUserStatus.checkOutTime}
            onCheckIn={handleOpenWorkstationCheckIn}
            onCheckOut={handleCheckOut}
          />

          {/* Stats Row Cards */}
          <div className="lg:col-span-3">
            <AttendanceStatsCards stats={stats} />
          </div>
        </div>
      )}

      {/* Main Database Table and Logs Section */}
      {activeTab === "records" ? (
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-xs p-4">
            <AttendanceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              deptFilter={deptFilter}
              onDeptChange={setDeptFilter}
              departments={departments}
              onClearFilters={() => {
                setSearchQuery("");
                setStatusFilter("");
                setDeptFilter("");
              }}
            />
          </Card>
          <AttendanceRecordsTable
            records={attendanceList}
            isLoading={isLoading}
            departments={departments}
            currentPage={page}
            totalPages={serverAttendance?.meta?.totalPages || 1}
            totalRecords={serverAttendance?.meta?.total || 0}
            onPageChange={setPage}
            onCheckIn={handleOpenEmployeeCheckIn}
            onCheckOut={handleOpenCheckOut}
            onRegularize={handleOpenRegularize}
            onEdit={handleOpenEdit}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-xs p-4">
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
          </Card>
          <RegularizationTable
            records={regularizationsList}
            isLoading={isRegularizationsLoading}
            currentPage={regularizationPage}
            totalPages={regularizationsData?.meta?.totalPages || 1}
            totalRecords={regularizationsData?.meta?.total || 0}
            onPageChange={setRegularizationPage}
            onApprove={handleApproveRegularization}
            onReject={handleRejectRegularization}
          />
        </div>
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
      <EditAttendanceDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        record={editingRecord}
        dateFilter={dateFilter}
        onSubmit={handleEditSubmit}
        formValues={formValues}
        onFormChange={setFormValues}
      />

      {/* Create Manual Attendance Modal */}
      <CreateAttendanceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        formValues={createFormValues}
        onFormChange={setCreateFormValues}
        employees={employeesList}
      />

      {/* Approve/Reject Confirmation Dialog */}
      <ApproveRejectConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        type={confirmType}
        comments={confirmComments}
        onCommentsChange={setConfirmComments}
        onConfirm={handleConfirmSubmit}
        isLoading={approveRejectRegularizationMutation.isPending}
      />
    </div>
  );
}

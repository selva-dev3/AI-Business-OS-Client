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
  Edit2,
  Play,
  Square,
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

import { useAttendanceDetails, useUpdateAttendance, useCheckOut } from "@/hooks/queries/hrms/attendance/attendance.hooks";
import { useDepartments } from "@/hooks/queries/hrms/departments/departments.hooks";
import { useEmployees } from "@/hooks/queries/hrms/employees/employees.hooks";
import { AttendanceCheckInDialog } from "@/components/hrms/attendance/AttendanceCheckInDialog";
import { AttendanceRecord, AttendanceStatus } from "@/hooks/queries/hrms/attendance/attendance.types";

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

export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params?.id as string;

  const { data: serverRecord, isLoading, isError, refetch } = useAttendanceDetails(id);
  const { data: dbDepartments } = useDepartments();
  const departments = dbDepartments || [];

  const record = React.useMemo<AttendanceRecord | null>(() => {
    if (!serverRecord) return null;
    // Server wraps data inside record or the root response is the record itself
    const raw = (serverRecord as any).data || serverRecord;
    return normalizeAttendance(raw);
  }, [serverRecord]);

  const updateMutation = useUpdateAttendance(id);
  const { data: employeesData } = useEmployees();
  const checkOutMutation = useCheckOut();

  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [checkInEmployee, setCheckInEmployee] = React.useState<{
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  } | null>(null);

  // Current user's own clock-in status (local simulation)
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

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hrms_user_attendance", JSON.stringify(currentUserStatus));
    }
  }, [currentUserStatus]);

  const [timerText, setTimerText] = React.useState("00:00:00");
  const [currentTimeText, setCurrentTimeText] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeText(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (currentUserStatus.checkedIn && currentUserStatus.checkInTime) {
        const diffMs = now.getTime() - new Date(currentUserStatus.checkInTime).getTime();
        const sec = Math.floor((diffMs / 1000) % 60);
        const min = Math.floor((diffMs / 60000) % 60);
        const hrs = Math.floor((diffMs / 3600000) % 24);
        setTimerText(
          `${String(hrs).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
        );
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentUserStatus]);

  const isRecordCheckedIn = React.useMemo(() => {
    return !!record?.checkIn && !record?.checkOut;
  }, [record]);

  const [recordTimerText, setRecordTimerText] = React.useState("00:00:00");

  React.useEffect(() => {
    const updateRecordTimer = () => {
      if (isRecordCheckedIn && record?.checkIn) {
        const diffMs = new Date().getTime() - new Date(record.checkIn).getTime();
        if (diffMs > 0) {
          const sec = Math.floor((diffMs / 1000) % 60);
          const min = Math.floor((diffMs / 60000) % 60);
          const hrs = Math.floor(diffMs / 3600000);
          setRecordTimerText(
            `${String(hrs).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
          );
        } else {
          setRecordTimerText("00:00:00");
        }
      }
    };

    updateRecordTimer();
    const interval = setInterval(updateRecordTimer, 1000);
    return () => clearInterval(interval);
  }, [isRecordCheckedIn, record?.checkIn]);

  const handleOpenWorkstationCheckIn = React.useCallback(() => {
    // Default to the current page's employee if available, else first employee in list
    const currentEmp = record?.employee;
    const firstEmp: any = currentEmp || employeesData?.employees?.[0] || employeesData?.data?.[0];
    if (firstEmp) {
      setCheckInEmployee({
        id: firstEmp.id || firstEmp._id,
        firstName: firstEmp.firstName,
        lastName: firstEmp.lastName,
        employeeCode: firstEmp.employeeCode || firstEmp.employeeId,
      });
    }
    setIsCheckInOpen(true);
  }, [employeesData, record]);

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

  const handleRecordCheckIn = async () => {
    if (!record) return;
    try {
      const nowStr = new Date().toISOString();
      await updateMutation.mutateAsync({
        checkIn: nowStr,
        status: "PRESENT",
        notes: record.notes || "Workstation Check-In",
      });
      toast.success("Checked in successfully!");
      refetch();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to check in");
    }
  };

  const handleRecordCheckOut = async () => {
    if (!record) return;
    try {
      const nowStr = new Date().toISOString();
      await updateMutation.mutateAsync({
        checkIn: record.checkIn,
        checkOut: nowStr,
        status: record.status.toUpperCase() as AttendanceStatus,
        notes: record.notes || "Workstation Check-Out",
      });
      toast.success("Checked out successfully!");
      refetch();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to check out");
    }
  };

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

  // Modal & form state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    checkIn: "",
    checkOut: "",
    status: "present" as AttendanceStatus,
    notes: "",
  });


  // Set form default values when opening the modal
  const handleOpenEdit = () => {
    if (!record) return;
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
    if (!record) return;

    if ((formValues.status === "present" || formValues.status === "late") && !formValues.checkIn) {
      toast.error("Check-in time is required for active statuses");
      return;
    }

    try {
      const dateStr = record.date;
      const requestData = {
        checkIn: formValues.checkIn ? new Date(`${dateStr}T${formValues.checkIn}:00.000Z`).toISOString() : undefined,
        checkOut: formValues.checkOut ? new Date(`${dateStr}T${formValues.checkOut}:00.000Z`).toISOString() : undefined,
        status: formValues.status.toUpperCase() as AttendanceStatus,
        notes: formValues.notes,
      };

      await updateMutation.mutateAsync(requestData);
      toast.success("Attendance log adjusted successfully!");
      setIsEditOpen(false);
      refetch();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Failed to update attendance log");
    }
  };

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

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
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
        <p className="text-sm font-semibold text-slate-500 mt-3 animate-pulse">Loading attendance record details...</p>
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
            <h3 className="text-lg font-bold text-slate-900">Attendance Log Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t retrieve the attendance details for ID &quot;{id}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const emp = record.employee;
  const deptName = departments.find((d: any) => d.id === emp?.departmentId || d._id === emp?.departmentId)?.name || "Corporate";
  const initials = emp ? `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase() : "EM";

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header breadcrumb & Actions */}
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
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Log Details</span>
              {getStatusBadge(record.status)}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {formatDateLong(record.date)}
            </h1>
          </div>
        </div>

        <Button onClick={handleOpenEdit} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4">
          <Edit2 className="h-4 w-4" /> Adjust Log
        </Button>
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
                  {record.employeeId.substring(0, 8)}
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

        {/* Live workstation clocking panel */}
        <Card className="border-indigo-100 bg-indigo-50/40 relative overflow-hidden shadow-xs rounded-xl mt-4">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <Clock className="h-32 w-32 text-indigo-700" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              Clock Workstation
            </CardTitle>
            <CardDescription className="text-xs text-indigo-700/80">
              Update session status for this record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="text-center py-2">
              <h2 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {currentTimeText || "--:--:--"}
              </h2>
              {isRecordCheckedIn ? (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">
                    Active Duration: {recordTimerText}
                  </span>
                </div>
              ) : record?.checkOut ? (
                <p className="text-xs font-semibold text-indigo-600 mt-2">
                  Session Completed
                </p>
              ) : (
                <p className="text-xs font-medium text-slate-500 mt-2">
                  Ready to clock check-in record
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {!record?.checkIn ? (
                <Button
                  onClick={handleRecordCheckIn}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  Check In
                </Button>
              ) : isRecordCheckedIn ? (
                <Button
                  onClick={handleRecordCheckOut}
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700 font-semibold shadow-xs flex items-center justify-center gap-2"
                >
                  <Square className="h-4 w-4 fill-white" />
                  Check Out
                </Button>
              ) : (
                <Button
                  disabled
                  className="flex-1 bg-slate-200 text-slate-400 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </Button>
              )}
            </div>

            {record?.checkIn && (
              <div className="border-t border-indigo-100/60 pt-3 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Checked In:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {record?.checkOut && (
                  <div className="flex justify-between">
                    <span>Checked Out:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Time log & Status Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Shift & Time log cards */}
          <Card className="border border-slate-200/80 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Shift Punch Card Details</CardTitle>
              <CardDescription>Exact check-in and check-out timestamps recorded by system.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Check In Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">First Check-In</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {formatTime(record.checkIn)}
                    </p>
                  </div>
                </div>

                {/* Check Out Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Last Check-Out</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {formatTime(record.checkOut)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours Stats */}
              <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800">Working Hours Summary</span>
                    <p className="text-xs text-slate-400 mt-0.5">Calculated active working session duration.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">{record.totalHours || 0} Hours</span>
                    <p className="text-xs text-indigo-600 font-bold">Standard 8h Shift</p>
                  </div>
                </div>

                {/* Hours Worked progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (record.totalHours || 0) >= 8 ? "bg-emerald-500" : "bg-amber-500"
                      )}
                      style={{ width: `${Math.min(((record.totalHours || 0) / 8) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>0h Checked-in</span>
                    <span>8h Target</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remarks & System logs info */}
          <Card className="border border-slate-200/80 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" /> Log Comments & Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-slate-50 border border-slate-100/50 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks Note</h4>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{record.notes || "No attendance remarks or custom logs comments were recorded for this session."}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">Created On System</span>
                  <span className="text-slate-700 font-semibold">
                    {record.createdAt ? new Date(record.createdAt).toLocaleString() : "--"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">Last Adjusted On</span>
                  <span className="text-slate-700 font-semibold">
                    {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "--"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Adjust Attendance Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Adjust Attendance Log
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Override and update check-in, check-out times, and attendance status flags.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Check-In Time</label>
                <Input
                  type="time"
                  value={formValues.checkIn}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, checkIn: e.target.value }))}
                  className="rounded-lg border-slate-200 text-slate-800 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Check-Out Time</label>
                <Input
                  type="time"
                  value={formValues.checkOut}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, checkOut: e.target.value }))}
                  className="rounded-lg border-slate-200 text-slate-800 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={formValues.status}
                onChange={(e) => setFormValues((prev) => ({ ...prev, status: e.target.value as AttendanceStatus }))}
                className="w-full text-sm rounded-lg border border-slate-200 bg-white p-2 text-slate-800 focus:ring-indigo-500"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Log Notes / Remarks</label>
              <textarea
                value={formValues.notes}
                onChange={(e) => setFormValues((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Why is this log being modified?"
                className="w-full text-sm rounded-lg border border-slate-200 p-2 text-slate-800 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
              >
                {updateMutation.isPending ? "Applying Changes..." : "Apply Adjustments"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendance Check-In Dialog */}
      <AttendanceCheckInDialog
        employee={checkInEmployee}
        open={isCheckInOpen}
        onOpenChange={setIsCheckInOpen}
        onSuccess={handleCheckInSuccess}
      />
    </div>
  );
}

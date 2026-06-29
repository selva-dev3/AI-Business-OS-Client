import { ListParams, PaginationMeta } from "@/hooks/queries/client";

export type AttendanceStatus = "present" | "late" | "absent" | "half_day" | "on_leave";

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    designation?: string;
    departmentId?: string;
  };
  date: string; // YYYY-MM-DD
  checkIn?: string; // ISO string or time string HH:MM
  checkOut?: string; // ISO string or time string HH:MM
  status: AttendanceStatus;
  totalHours?: number;
  isLate: boolean;
  isHalfDay: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceSummary = {
  totalCount: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  halfDayCount: number;
  onLeaveCount: number;
  presentRate: number; // percentage
  avgWorkHours: number;
};

export type AttendanceListResponse = {
  data: AttendanceRecord[];
  meta: PaginationMeta;
};

export type AttendanceSearchParams = ListParams & {
  date?: string;
  employeeId?: string;
  status?: string;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
};

export type CheckInRequest = {
  notes?: string;
  location?: string;
};

export type CheckOutRequest = {
  employeeId?: string;
  date?: string;
  checkOut?: string;
  notes?: string;
};

export type UpdateAttendanceRequest = {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus | string;
  notes?: string;
};

export type CheckInFormData = {
  employeeId: string;
  attendanceDate: string;
  checkIn: string;
  attendanceType: "PRESENT" | "LATE" | "HALF_DAY";
  shift?: string;
  workLocation?: string;
  remarks?: string;
};

// ─── CHECK OUT ─────────────────────────────────────────────────────────────────

export type CheckOutFormData = {
  employeeId: string;
  date: string;
  checkOut: string;
  remarks?: string;
};

// ─── BULK ATTENDANCE ───────────────────────────────────────────────────────────

export type BulkAttendanceEntry = {
  employeeId: string;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
};

export type BulkAttendanceRequest = {
  date: string;
  entries: BulkAttendanceEntry[];
};

export type BulkAttendanceResult = {
  created: number;
  skipped: number;
  errors: Array<{ employeeId: string; message: string }>;
};

// ─── REGULARIZATION ────────────────────────────────────────────────────────────

export type RegularizationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RegularizationRecord = {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode?: string;
  };
  date: string;
  checkIn?: string;
  checkOut?: string;
  reason: string;
  status: RegularizationStatus;
  approvedBy?: { id: string; firstName: string; lastName: string };
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRegularizationPayload = {
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  reason: string;
};

export type ApproveRejectRegularizationPayload = {
  status: "APPROVED" | "REJECTED";
  comments?: string;
};

// ─── ATTENDANCE REPORTS ────────────────────────────────────────────────────────

export type AttendanceReportItem = {
  department: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalOnLeave: number;
};

export type AttendanceReportParams = {
  fromDate?: string;
  toDate?: string;
  departmentId?: string;
};

// ─── EXPORT ────────────────────────────────────────────────────────────────────

export type ExportAttendanceParams = {
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
};

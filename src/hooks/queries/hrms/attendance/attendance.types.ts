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
};

export type CheckInRequest = {
  notes?: string;
  location?: string;
};

export type CheckOutRequest = {
  notes?: string;
};

export type UpdateAttendanceRequest = {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus | string;
  notes?: string;
};

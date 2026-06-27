import { ListParams, PaginationMeta } from "@/hooks/queries/client";

export type LeaveType = "annual" | "sick" | "casual" | "unpaid" | "maternity" | "paternity";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequest = {
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
    department?: { id: string; name: string };
  };
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedByUser?: { firstName: string; lastName: string };
  managerNotes?: string;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeaveBalance = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  totalAllocated: number;
  used: number;
  pending: number;
  available: number;
};

export type LeaveCalendarEvent = {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
};

export type LeaveListResponse = {
  data: LeaveRequest[];
  meta: PaginationMeta;
};

export type LeaveSearchParams = ListParams & {
  status?: string;
  leaveType?: string;
  departmentId?: string;
  employeeId?: string;
};

export type LeaveTypeOption = {
  _id: string;
  name: string;
  daysPerYear?: number;
  isActive?: boolean;
};

export type CreateLeaveRequestData = {
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  emergencyContact?: string;
};

export type ApproveRejectRequestData = {
  managerNotes?: string;
};

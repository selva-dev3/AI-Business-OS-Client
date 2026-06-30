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
  leaveTypeId?: string;
  departmentId?: string;
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
};

export type LeaveTypeOption = {
  _id: string;
  name: string;
  code: string;
  daysPerYear?: number;
  maxDays?: number;
  description?: string;
  requiresApproval?: boolean;
  isActive?: boolean;
};

export type CreateLeaveRequestData = {
  employeeId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  emergencyContact?: string;
};

export type CreateLeaveTypeData = {
  name: string;
  code: string;
  maxDays: number;
  description?: string;
  requiresApproval: boolean;
  isActive: boolean;
};

export type LeaveTypeDetail = {
  _id: string;
  name: string;
  code: string;
  maxDays: number;
  description?: string;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateLeaveTypeData = {
  name?: string;
  code?: string;
  maxDays?: number;
  description?: string;
  requiresApproval?: boolean;
  isActive?: boolean;
};

export type UpdateLeaveRequestData = {
  leaveTypeId?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  emergencyContact?: string;
};

export type ApproveRejectRequestData = {
  managerNotes?: string;
};

// ─── HOLIDAYS ────────────────────────────────────────────────────────────────

export type HolidayType = "PUBLIC" | "RESTRICTED" | "OPTIONAL";

export type Holiday = {
  _id: string;
  id?: string;
  name: string;
  date: string;
  type: HolidayType;
  isOptional: boolean;
  branchId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateHolidayData = {
  name: string;
  date: string;
  type: HolidayType;
  isOptional?: boolean;
  branchId?: string;
};

export type UpdateHolidayData = {
  name?: string;
  date?: string;
  type?: HolidayType;
  isOptional?: boolean;
  branchId?: string;
};

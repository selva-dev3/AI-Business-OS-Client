import { ListParams, PaginationMeta } from "@/hooks/queries/client";

export type Employee = {
  id: string;
  employeeId: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  departmentId?: string;
  department?: { id: string; name: string };
  managerId?: string;
  manager?: { id: string; firstName: string; lastName: string };
  dateOfJoining?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status: "active" | "inactive" | "terminated" | "on_leave" | "suspended";
  employmentType?: "full_time" | "part_time" | "contract" | "intern";
  userId?: string;
  companyId: string;
  alternatePhone?: string;
  personalEmail?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountType?: string;
  };
  panNumber?: string;
  aadharNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export interface RawSummary {
  totalHeadcount: number;
  activeStaff: number;
  onLeave: number;
  inactive: number;
  suspended: number;
}

export interface ProcessedSummary extends RawSummary {
  activePercentage: number;
  onLeavePercentage: number;
  inactivePercentage: number;
  suspendedPercentage: number;

  previousPeriod?: RawSummary;
  changeFromPrevious?: {
    activeChange: number;
    activeChangePercent: number;
    onLeaveChange: number;
    inactiveChange: number;
  };

  lastUpdated: Date;
  isStale: boolean;
  dataQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

export interface EmployeeApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    employees: Employee[];
    pagination: PaginationMeta;
    summary: RawSummary;
  };
}

export interface SummaryState {
  raw: RawSummary | null;
  processed: ProcessedSummary | null;
  loading: boolean;
  error: Error | null;
  lastFetchTime: Date | null;
  cacheKey: string;
}

export type SummaryAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: EmployeeApiResponse }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'INVALIDATE_CACHE' }
  | { type: 'SET_STALE' };

export interface CardMetricData {
  label: string;
  value: number;
  percentage: number;
  icon: string;
  color: string;
  trend: any;
  status?: string;
}

export type EmployeeListResponse = {
  // Backward compatibility
  data: Employee[];
  meta: PaginationMeta;

  // Unified response contract
  employees: Employee[];
  pagination: PaginationMeta;
  summary: RawSummary;
};

export type CreateEmployeeData = {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation?: string;
  departmentId?: string;
  managerId?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  employmentType?: "full_time" | "part_time" | "contract" | "intern";
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountType?: string;
  };
  panNumber?: string;
  aadharNumber?: string;
};

export type UpdateEmployeeData = Partial<CreateEmployeeData> & {
  status?: "active" | "inactive" | "terminated" | "on_leave" | "suspended";
};

export type SuspendEmployeeData = {
  reason: string;
  expectedReinstatement?: string;
  notes?: string;
};

export type ReinstateEmployeeData = {
  notes?: string;
};

export type TerminateEmployeeData = {
  lastWorkingDate: string;
  reason: "RESIGNATION" | "TERMINATION" | "RETIREMENT" | "CONTRACT_END" | "OTHER" | "resignation" | "termination" | "retirement" | "contract_end" | "other";
  reasonDetails?: string;
  exitChecklist?: {
    laptopReturned?: boolean;
    accessRevoked?: boolean;
    fnfSettled?: boolean;
    relievingLetterIssued?: boolean;
    exitInterviewDone?: boolean;
  };
  noticePeriodServed?: boolean;
  finalSalaryProcessed?: boolean;
};

export type EmployeeSearchParams = ListParams & {
  status?: string;
  departmentId?: string;
  employmentType?: string;
};

export type BulkImportResponse = {
  imported: number;
  failed: number;
  errors?: Array<{ row: number; message: string }>;
};

// ─── TAB-SPECIFIC TYPES ──────────────────────────────────────────────────────

export interface AttendanceLog {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "late" | "half-day" | "holiday" | string;
  lateMinutes: number;
  notes?: string;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
}

export interface AttendanceResponse {
  records: AttendanceLog[];
  summary: AttendanceSummary;
  meta: PaginationMeta;
}

export interface LeaveRequestItem {
  id: string;
  leaveType: string;
  leaveTypeId?: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | string;
  reason: string;
  approvedBy?: { firstName: string; lastName: string } | string;
  rejectedBy?: { firstName: string; lastName: string } | string;
  rejectionReason?: string;
  comments?: string;
}

export type LeaveBalanceMap = Record<string, { total: number; used: number; remaining: number }>;

export interface LeaveResponse {
  requests: LeaveRequestItem[];
  leaveBalance: LeaveBalanceMap;
  meta: PaginationMeta;
}

export interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  basicSalary?: number;
  allowances?: { name: string; amount: number }[];
  deductions?: { name: string; amount: number }[];
  bonus?: number;
  grossSalary?: number;
  netSalary?: number;
  status: "draft" | "generated" | "paid" | string;
  paidAt?: string;
  payslipUrl?: string;
}

export interface PayrollResponse {
  records: PayrollRecord[];
  meta: PaginationMeta;
}

export interface EmployeeDocumentItem {
  id: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  isConfidential: boolean;
  expiryDate?: string;
  uploadedBy?: { firstName: string; lastName: string } | string;
  createdAt: string;
}

export interface EmployeeNoteItem {
  id: string;
  content: string;
  category: string;
  isPinned: boolean;
  visibility: string;
  createdBy?: { firstName: string; lastName: string } | string;
  updatedBy?: { firstName: string; lastName: string } | string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface RoleHistoryItem {
  designation?: string;
  departmentId?: string;
  employmentType?: string;
  reportingManagerId?: string;
  changedAt?: string;
  changedBy?: string;
  reason?: string;
}

export interface AssignRoleData {
  designation?: string;
  departmentId?: string;
  employmentType?: string;
  reportingManagerId?: string;
  effectiveDate: string;
  reason: string;
  notes?: string;
}

export interface ResetPasswordData {
  action: "reset_password" | "resend_invite";
  notifyEmployee?: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  sentTo: string;
  expiresAt?: string;
}

export interface CreateDocumentData {
  fileUrl?: string;
  documentUrl?: string;
  documentType: string;
  documentName: string;
  fileSize?: number;
  mimeType?: string;
  expiryDate?: string;
  isConfidential?: boolean;
}

export interface CreateNoteData {
  content: string;
  category: string;
  isPinned?: boolean;
  visibility?: string;
}

export interface UpdateNoteData {
  content?: string;
  category?: string;
  isPinned?: boolean;
  visibility?: string;
}

export interface InitiateLeaveData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
}

export interface EmployeeHistoryItem {
  id: string;
  employeeId: string;
  companyId: string;
  changeType: string;
  oldValue?: string;
  newValue?: string;
  oldDepartmentId?: { _id?: string; name?: string };
  newDepartmentId?: { _id?: string; name?: string };
  oldDesignationId?: { _id?: string; name?: string };
  newDesignationId?: { _id?: string; name?: string };
  effectiveDate?: string;
  changedBy?: { firstName: string; lastName: string; email: string };
  reason?: string;
  createdAt: string;
}

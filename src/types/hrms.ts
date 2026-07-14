import { PaginationMeta } from "@/hooks/queries/client";

// ─── EMPLOYEE ────────────────────────────────────────────────────────────────

export interface RoleHistoryItem {
  designation?: string;
  departmentId?: string;
  employmentType?: string;
  reportingManagerId?: string;
  changedAt?: string;
  changedBy?: string;
  reason?: string;
}

export interface TerminationDetails {
  lastWorkingDate?: string;
  reason?: string;
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
  terminatedBy?: string;
  terminatedAt?: string;
}

export interface SuspensionDetails {
  reason: string;
  suspendedBy?: string;
  suspendedAt?: string;
  expectedReinstatement?: string;
  notes?: string;
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  personalEmail?: string;
  designation?: string;
  departmentId?: string;
  department?: { id: string; name: string; color?: string };
  managerId?: string;
  manager?: { id: string; firstName: string; lastName: string; employeeId?: string };
  employeeType?: "Full-Time" | "Part-Time" | "Contract" | "Intern" | string;
  status: "Active" | "Inactive" | "On Leave" | "Suspended" | "Terminated" | string;
  employmentType?: "full_time" | "part_time" | "contract" | "intern" | string;
  dateOfJoining?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  avatar?: string;
  emergencyContact?: { name?: string; relation?: string; phone?: string };
  bankDetails?: { bankName?: string; accountNumber?: string; ifscCode?: string; accountType?: string };
  panNumber?: string;
  aadharNumber?: string;
  roleHistory?: RoleHistoryItem[];
  terminationDetails?: TerminationDetails | null;
  suspensionDetails?: SuspensionDetails | null;
  suspensionHistory?: any[];
  exitDate?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  userId?: string;
}

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

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

// ─── LEAVE ───────────────────────────────────────────────────────────────────

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

// ─── PAYROLL ─────────────────────────────────────────────────────────────────

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
  status: "draft" | "processed" | "paid" | string;
  paidAt?: string;
  payslipUrl?: string;
}

export interface PayrollResponse {
  records: PayrollRecord[];
  meta: PaginationMeta;
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

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

// ─── NOTES ───────────────────────────────────────────────────────────────────

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

// ─── TAB CONFIG ──────────────────────────────────────────────────────────────

export type EmployeeTabKey =
  | "overview"
  | "attendance"
  | "leaves"
  | "payroll"
  | "documents"
  | "notes"
  | "history"
  | "assign-role"
  | "access"
  | "exit";

export interface EmployeeTabConfig {
  key: EmployeeTabKey;
  label: string;
  roles: string[];
}

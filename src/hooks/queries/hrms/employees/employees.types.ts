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
  status: "active" | "inactive" | "terminated" | "on_leave";
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
  status?: "active" | "inactive" | "terminated" | "on_leave";
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

import { ListParams, PaginationMeta } from "@/api/client";

export type Employee = {
  id: string;
  employeeId: string;
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
  createdAt: string;
  updatedAt: string;
};

export type EmployeeListResponse = {
  data: Employee[];
  meta: PaginationMeta;
};

export type CreateEmployeeData = {
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

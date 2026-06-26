export type Employee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  department?: { id: string; name: string };
  designationId?: string;
  designation?: string;
  joiningDate: string;
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  status: "active" | "inactive" | "pending";
  salary?: number;
  reportingManagerId?: string;
  reportingManager?: { id: string; name: string };
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
};

export type EmployeeCreateDTO = Omit<Employee, "id" | "department" | "designation" | "reportingManager">;

export type EmployeeListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
  employmentType?: string;
};

export type Department = {
  id: string;
  name: string;
  parentId?: string;
  headId?: string;
  head?: { id: string; name: string };
  employeeCount: number;
  children?: Department[];
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status: "present" | "absent" | "late" | "half_day" | "on_leave" | "holiday" | "weekend";
  notes?: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
};

export type LeaveBalance = {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
};

export type PayrollRun = {
  id: string;
  month: string;
  year: number;
  status: "draft" | "processing" | "processed" | "paid";
  totalAmount: number;
  employeeCount: number;
  processedAt?: string;
};

export type Payslip = {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
};

export type CompanyAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
};

export type CompanyDetailResponse = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logo?: string;
  website?: string;
  address: CompanyAddress;
  timezone: string;
  currency: string;
  language: string;
  plan: string;
  isActive: boolean;
  trialEndsAt?: string | null;
  createdAt: string;
};

export type UpdateCompanyData = {
  name?: string;
  phone?: string;
  website?: string;
  address?: Partial<CompanyAddress>;
  timezone?: string;
  currency?: string;
};

export type AttendanceSettings = {
  workStartTime: string;
  workEndTime: string;
  workingDays: string[];
  lateThresholdMinutes: number;
};

export type LeaveSettings = {
  autoApproveAfterDays: number;
  maxConsecutiveDays: number;
};

export type PayrollSettings = {
  payDay: number;
  pfPercentage: number;
  esiPercentage: number;
};

export type NotificationSettings = {
  emailEnabled: boolean;
  inAppEnabled: boolean;
};

export type CompanySettingsResponse = {
  attendance: AttendanceSettings;
  leave: LeaveSettings;
  payroll: PayrollSettings;
  notifications: NotificationSettings;
};

export type UpdateCompanySettingsData = {
  attendance?: Partial<AttendanceSettings>;
  leave?: Partial<LeaveSettings>;
  payroll?: Partial<PayrollSettings>;
  notifications?: Partial<NotificationSettings>;
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  address: { city: string; state: string };
  phone?: string;
  isHQ: boolean;
  isActive: boolean;
  employeeCount: number;
};

export type CreateBranchData = {
  name: string;
  code: string;
  address?: CompanyAddress;
  phone?: string;
  isHQ?: boolean;
};

export type UpdateBranchData = {
  name?: string;
  phone?: string;
  isActive?: boolean;
};

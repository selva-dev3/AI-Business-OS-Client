export interface HRMSDashboardData {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  newHiresThisMonth: number;
  attritionRate: number;
  pendingLeaveRequests: number;
  headcountTrend: Array<{ month: string; count: number }>;
  departmentWise: Array<{ department: string; count: number }>;
  weeklyAttendance: Record<string, Record<string, number>>;
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CalendarOff,
  DollarSign,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  AlertCircle,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHRMSDashboard } from "@/hooks/queries/hrms/dashboard/dashboard.hooks";
import { useDashboardActivity } from "@/hooks/queries/dashboard/dashboard.hooks";
import { DashboardActivity } from "@/hooks/queries/dashboard/dashboard.api";

const DEPARTMENT_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function StatCard({ title, value, change, trend, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change && trend ? (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" ? "text-emerald-600" : "text-red-600"
                )}
              >
                {change}
              </span>
              <span className="text-sm text-slate-400">vs last month</span>
            </div>
          ) : null}
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-7 bg-slate-200 rounded w-16" />
          <div className="h-3 bg-slate-200 rounded w-28" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Department Distribution Bar                                        */
/* ------------------------------------------------------------------ */
interface DepartmentData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

function DepartmentBar({ name, count, percentage, color }: DepartmentData) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{name}</span>
        <span className="text-sm text-slate-500">{count} employees</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Item                                                      */
/* ------------------------------------------------------------------ */
function ActivityItem({ activity }: { activity: DashboardActivity }) {
  const actorName = activity.user?.name || "System";
  const initials = getInitials(actorName);
  const timeAgo = formatTimeAgo(activity.timestamp);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">
          <span className="font-medium text-slate-900">{actorName}</span>{" "}
          {activity.description || activity.action}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

/* ------------------------------------------------------------------ */
/*  Loading / Error / Empty helpers                                    */
/* ------------------------------------------------------------------ */
function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
      <p className="text-sm text-slate-500 mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
}

function SectionEmpty({ icon: Icon, title, description }: { icon?: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {Icon && <Icon className="h-8 w-8 text-slate-300 mb-2" />}
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("h-3 bg-slate-200 rounded animate-pulse", className)} />;
}

function SkeletonBar() {
  return (
    <div className="space-y-1.5 animate-pulse">
      <div className="flex items-center justify-between">
        <SkeletonLine className="w-24" />
        <SkeletonLine className="w-20" />
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-slate-200 rounded-full" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

function SkeletonActivityItem() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HRMS Dashboard Page                                                */
/* ================================================================== */
export default function HRMSPage() {
  const { data, isLoading, isError, refetch } = useHRMSDashboard();
  const {
    data: activityData,
    isLoading: isActivityLoading,
    isError: isActivityError,
    refetch: refetchActivity,
  } = useDashboardActivity({ limit: 5, module: "HRMS" });

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const attendanceBreakdown = React.useMemo(() => {
    if (!data) return null;
    const todayAttendance = data.weeklyAttendance?.[todayStr] || {};
    const present = data.presentToday;
    const onLeave = data.onLeaveToday;
    const absent = todayAttendance["ABSENT"] || 0;
    const late = todayAttendance["LATE"] || 0;
    const total = present + absent + onLeave;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : "0";
    const lateRate = total > 0 ? ((late / total) * 100).toFixed(1) : "0";
    return { present, onLeave, absent, late, attendanceRate, lateRate };
  }, [data, todayStr]);

  const quickActions = [
    { label: "Add Employee", icon: Plus, href: "/hrms/employees/new" },
    { label: "Mark Attendance", icon: Clock, href: "/hrms/attendance" },
    { label: "Apply Leave", icon: CalendarOff, href: "/hrms/leave" },
    { label: "Run Payroll", icon: DollarSign, href: "/hrms/payroll" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HRMS Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your workforce.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/hrms/employees/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : isError ? (
          <div className="lg:col-span-4">
            <SectionError message="Failed to load dashboard statistics" onRetry={() => refetch()} />
          </div>
        ) : (
          <>
            <StatCard
              title="Total Employees"
              value={(data?.totalEmployees ?? 0).toLocaleString("en-US")}
              icon={Users}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-100"
            />
            <StatCard
              title="Present Today"
              value={(data?.presentToday ?? 0).toLocaleString("en-US")}
              icon={Clock}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
            />
            <StatCard
              title="On Leave"
              value={(data?.onLeaveToday ?? 0).toLocaleString("en-US")}
              icon={CalendarOff}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
            />
            <StatCard
              title="Payroll This Month"
              value="—"
              icon={DollarSign}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group"
            >
              <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-100 transition-colors">
                <action.icon className="h-4 w-4 text-slate-600 group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Department Distribution</h2>
            <Link
              href="/hrms/departments"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonBar />
              <SkeletonBar />
              <SkeletonBar />
              <SkeletonBar />
              <SkeletonBar />
              <SkeletonBar />
            </div>
          ) : isError ? (
            <SectionError message="Failed to load department data" onRetry={() => refetch()} />
          ) : !data?.departmentWise?.length ? (
            <SectionEmpty
              icon={Building2}
              title="No departments found"
              description="Department data will appear here once employees are assigned."
            />
          ) : (
            <div className="space-y-4">
              {(() => {
                const depts = data.departmentWise;
                const maxCount = Math.max(...depts.map((d) => d.count), 1);
                return depts.map((dept, i) => (
                  <DepartmentBar
                    key={dept.department}
                    name={dept.department}
                    count={dept.count}
                    percentage={(dept.count / maxCount) * 100}
                    color={DEPARTMENT_COLORS[i % DEPARTMENT_COLORS.length]}
                  />
                ));
              })()}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Events</h2>
            <Link
              href="/hrms/holidays"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          <SectionEmpty
            icon={Calendar}
            title="No upcoming events"
            description="Events data is not yet available from this endpoint."
          />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            <Link
              href="/hrms/reports"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          {isActivityLoading ? (
            <div className="space-y-0">
              <SkeletonActivityItem />
              <SkeletonActivityItem />
              <SkeletonActivityItem />
              <SkeletonActivityItem />
              <SkeletonActivityItem />
            </div>
          ) : isActivityError ? (
            <SectionError message="Failed to load recent activity" onRetry={() => refetchActivity()} />
          ) : !activityData?.activities?.length ? (
            <SectionEmpty
              icon={AlertCircle}
              title="No recent activity"
              description="HRMS activity will appear here as it happens."
            />
          ) : (
            <div className="space-y-0">
              {activityData.activities.map((act, idx) => (
                <ActivityItem key={act.timestamp + idx} activity={act} />
              ))}
            </div>
          )}
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Attendance</h2>
            <Link
              href="/hrms/attendance"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Details
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="text-center p-4 bg-slate-100 rounded-lg">
                    <div className="h-7 bg-slate-200 rounded w-12 mx-auto mb-1" />
                    <div className="h-3 bg-slate-200 rounded w-14 mx-auto" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ) : isError ? (
            <SectionError message="Failed to load attendance data" onRetry={() => refetch()} />
          ) : attendanceBreakdown ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {attendanceBreakdown.present.toLocaleString("en-US")}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Present</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {attendanceBreakdown.onLeave.toLocaleString("en-US")}
                  </p>
                  <p className="text-xs text-amber-600 font-medium mt-1">On Leave</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceBreakdown.absent.toLocaleString("en-US")}
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-1">Absent</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Attendance Rate</span>
                  <span className="font-semibold text-slate-900">{attendanceBreakdown.attendanceRate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${attendanceBreakdown.attendanceRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Late Arrivals</span>
                  <span className="font-semibold text-slate-900">
                    {attendanceBreakdown.late.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${attendanceBreakdown.lateRate}%` }}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}



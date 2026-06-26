"use client";

import * as React from "react";
import {
  Users,
  Clock,
  CalendarOff,
  DollarSign,
  Building2,
  Laptop,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
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
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recent Activity Item                                               */
/* ------------------------------------------------------------------ */
interface ActivityItem {
  name: string;
  action: string;
  time: string;
  avatar: string;
}

function ActivityItem({ name, action, time, avatar }: ActivityItem) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold shrink-0">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">
          <span className="font-medium text-slate-900">{name}</span> {action}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Upcoming Event Item                                                */
/* ------------------------------------------------------------------ */
interface EventItem {
  title: string;
  date: string;
  type: "holiday" | "meeting" | "deadline";
}

function EventItem({ title, date, type }: EventItem) {
  const typeColors = {
    holiday: "bg-emerald-100 text-emerald-700",
    meeting: "bg-blue-100 text-blue-700",
    deadline: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={cn("px-2 py-1 rounded text-xs font-medium", typeColors[type])}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{title}</p>
        <p className="text-xs text-slate-400">{date}</p>
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

/* ================================================================== */
/*  HRMS Dashboard Page                                                */
/* ================================================================== */
export default function HRMSPage() {
  const stats: StatCardProps[] = [
    {
      title: "Total Employees",
      value: "1,248",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
    },
    {
      title: "Present Today",
      value: "1,089",
      change: "+3.2%",
      trend: "up",
      icon: Clock,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      title: "On Leave",
      value: "87",
      change: "-8.1%",
      trend: "down",
      icon: CalendarOff,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "Payroll This Month",
      value: "$2.4M",
      change: "+5.7%",
      trend: "up",
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  ];

  const departments: DepartmentData[] = [
    { name: "Engineering", count: 324, percentage: 85, color: "bg-indigo-500" },
    { name: "Marketing", count: 186, percentage: 65, color: "bg-emerald-500" },
    { name: "Sales", count: 156, percentage: 55, color: "bg-blue-500" },
    { name: "Human Resources", count: 89, percentage: 35, color: "bg-amber-500" },
    { name: "Finance", count: 78, percentage: 30, color: "bg-purple-500" },
    { name: "Operations", count: 67, percentage: 25, color: "bg-rose-500" },
  ];

  const recentActivities: ActivityItem[] = [
    { name: "John Smith", action: "checked in at 9:02 AM", time: "2 minutes ago", avatar: "JS" },
    { name: "Sarah Wilson", action: "submitted a leave request", time: "15 minutes ago", avatar: "SW" },
    { name: "Mike Johnson", action: "updated their profile", time: "1 hour ago", avatar: "MJ" },
    { name: "Emily Davis", action: "completed onboarding", time: "2 hours ago", avatar: "ED" },
    { name: "Alex Brown", action: "requested overtime approval", time: "3 hours ago", avatar: "AB" },
  ];

  const upcomingEvents: EventItem[] = [
    { title: "Company Holiday - Independence Day", date: "Jul 4, 2026", type: "holiday" },
    { title: "Team Standup Meeting", date: "Today, 10:00 AM", type: "meeting" },
    { title: "Q2 Performance Reviews Due", date: "Jun 30, 2026", type: "deadline" },
    { title: "Monthly Town Hall", date: "Jul 1, 2026", type: "meeting" },
  ];

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
            Welcome back! Here's what's happening with your workforce.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group"
            >
              <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-100 transition-colors">
                <action.icon className="h-4 w-4 text-slate-600 group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Department Distribution</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {departments.map((dept) => (
              <DepartmentBar key={dept.name} {...dept} />
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Events</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-0">
            {upcomingEvents.map((event, index) => (
              <EventItem key={index} {...event} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-0">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Today's Attendance</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Details
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">1,089</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Present</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">87</p>
              <p className="text-xs text-amber-600 font-medium mt-1">On Leave</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">72</p>
              <p className="text-xs text-red-600 font-medium mt-1">Absent</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Attendance Rate</span>
              <span className="font-semibold text-slate-900">87.3%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "87.3%" }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Late Arrivals</span>
              <span className="font-semibold text-slate-900">42</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "3.8%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

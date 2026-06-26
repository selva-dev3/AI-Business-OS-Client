"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardActivity } from "@/hooks/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Boxes,
  Brain,
  ArrowRight,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  FolderKanban,
  Headphones,
  BarChart3,
  CheckCircle2,
  Circle,
  MoreHorizontal,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Quick-access module cards                                          */
/* ------------------------------------------------------------------ */
const quickModules = [
  { label: "HRMS", href: "/hrms", icon: Briefcase, color: "bg-orange-50 text-orange-600" },
  { label: "CRM", href: "/crm", icon: Users, color: "bg-emerald-50 text-emerald-600" },
  { label: "Finance", href: "/finance", icon: DollarSign, color: "bg-rose-50 text-rose-600" },
  { label: "Inventory", href: "/inventory", icon: Boxes, color: "bg-red-50 text-red-600" },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart, color: "bg-indigo-50 text-indigo-600" },
  { label: "Projects", href: "/projects", icon: FolderKanban, color: "bg-violet-50 text-violet-600" },
  { label: "Support", href: "/support", icon: Headphones, color: "bg-teal-50 text-teal-600" },
  { label: "AI Chat", href: "/ai-chat", icon: Brain, color: "bg-slate-100 text-slate-700" },
];

/* ------------------------------------------------------------------ */
/*  Landing Page import                                               */
/* ------------------------------------------------------------------ */
import LandingPage from "@/components/LandingPage";

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { data: activityData, isLoading } = useDashboardActivity(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  const getModuleDotColor = (mod: string) => {
    switch (mod) {
      case "CRM":
        return "bg-emerald-500";
      case "PROCUREMENT":
        return "bg-indigo-500";
      case "INVENTORY":
        return "bg-rose-500";
      case "HRMS":
        return "bg-orange-500";
      case "FINANCE":
        return "bg-teal-500";
      default:
        return "bg-slate-400";
    }
  };

  // If not logged in, render the Landing Page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ────── Welcome strip ────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user?.firstName || "Operator"} 👋
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Here's what's happening across your business today.
          </p>
        </div>
        <Link href="/ai-chat">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold shadow-sm">
            <Brain className="mr-2 h-4 w-4" />
            Ask AI Assistant
          </Button>
        </Link>
      </div>

      {/* ────── KPI cards ────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">$124,580</p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2% from last month
            </p>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Staff Strength</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">124</p>
            <p className="mt-1 text-[12px] text-slate-400">6 departments active</p>
          </CardContent>
        </Card>

        {/* CRM */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Deals</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">18</p>
            <p className="mt-1 text-[12px] text-cyan-600 font-medium">Pipeline: $245,000</p>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Inventory Alerts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">2</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">Low stock items</p>
          </CardContent>
        </Card>
      </div>

      {/* ────── Main grid ────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Quick access modules */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-slate-900">Quick Access</h2>
            <Link
              href="/settings"
              className="text-[12px] text-indigo-600 font-medium hover:underline flex items-center gap-1"
            >
              Manage modules <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link key={mod.label} href={mod.href}>
                  <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${mod.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900">
                      {mod.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pending tasks */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-bold text-slate-900">Pending Tasks</CardTitle>
                <Link
                  href="/projects/tasks"
                  className="text-[12px] text-indigo-600 font-medium hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { text: "Review Q2 budget allocations", priority: "High", module: "Finance" },
                { text: "Approve vendor onboarding for TechSupply Co.", priority: "Medium", module: "Procurement" },
                { text: "Schedule performance reviews for June", priority: "Medium", module: "HRMS" },
                { text: "Follow up on Apex Corp deal negotiation", priority: "High", module: "CRM" },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <Circle className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 truncate">{task.text}</p>
                    <p className="text-[11px] text-slate-400">{task.module}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === "High"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Activity feed */}
        <div className="space-y-5">
          <h2 className="text-[16px] font-bold text-slate-900">Recent Activity</h2>
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="pt-5 space-y-4">
              {isLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 items-center animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-5/6" />
                        <div className="h-2 bg-slate-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !activityData?.activities?.length ? (
                <p className="text-[12px] text-slate-400 text-center py-6">No recent activity found.</p>
              ) : (
                activityData.activities.map((act, idx) => (
                  <div key={idx} className="flex gap-3 items-start animate-in fade-in duration-200">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${getModuleDotColor(act.module)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-700 leading-snug font-medium">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {act.module}
                        </span>
                        {act.user?.name && (
                          <span className="text-[10px] text-slate-400">
                            by {act.user.name}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* System status */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] font-bold text-slate-900">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "API Gateway", status: "Operational" },
                { label: "Database Cluster", status: "Operational" },
                { label: "AI Processing", status: "Operational" },
                { label: "File Storage", status: "Operational" },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-slate-600">{s.label}</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {s.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

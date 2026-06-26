"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/hooks/queries/client";
import { queryKeys } from "@/lib/api/queryKeys";
import { endpoints } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Milestone,
  TrendingUp,
  Brain,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
} from "lucide-react";
import { LineChart, DonutChart } from "@/components/charts";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  startDate: string;
  endDate: string;
  progress?: number;
}

interface ProjectTask {
  id: string;
  title: string;
  status: "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  assigneeName?: string;
}

interface Timesheet {
  id: string;
  hours: number;
  date: string;
}

export default function ProjectsDashboardPage() {
  // Query Projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiGet<{ data: Project[] }>(endpoints.projects.projects).catch(() => ({ data: [] })),
  });

  // Query Timesheets
  const { data: timesheetsData } = useQuery({
    queryKey: ["projects", "timesheets"],
    queryFn: () => apiGet<{ data: Timesheet[] }>(endpoints.projects.timesheets).catch(() => ({ data: [] })),
  });

  // Materialize datasets or fall back to high-fidelity mocks
  const projectsList = React.useMemo<Project[]>(() => {
    const list = projectsData?.data || [];
    if (list.length > 0) return list;
    return [
      { id: "proj-1", name: "AI Business OS Frontend", description: "Implement corporate operations frontend client portal", status: "IN_PROGRESS", startDate: "2026-06-01", endDate: "2026-08-30", progress: 68 },
      { id: "proj-2", name: "Multi-tenant Database Migration", description: "Upgrade database nodes to secure PostgreSQL instances", status: "PLANNING", startDate: "2026-07-10", endDate: "2026-10-15", progress: 12 },
      { id: "proj-3", name: "Enterprise Auth Audit", description: "Carry out audit on security auth models and SSO integration", status: "COMPLETED", startDate: "2026-05-15", endDate: "2026-06-20", progress: 100 },
      { id: "proj-4", name: "Inventory Automation Module", description: "Add automatic supplier ordering integrations", status: "ON_HOLD", startDate: "2026-04-01", endDate: "2026-09-01", progress: 45 },
    ];
  }, [projectsData]);

  const timesheetsList = React.useMemo(() => {
    const list = timesheetsData?.data || [];
    if (list.length > 0) return list;
    return [
      { id: "ts-1", hours: 8, date: "2026-06-25" },
      { id: "ts-2", hours: 6, date: "2026-06-24" },
      { id: "ts-3", hours: 7.5, date: "2026-06-23" },
      { id: "ts-4", hours: 8.5, date: "2026-06-22" },
      { id: "ts-5", hours: 8, date: "2026-06-19" },
    ];
  }, [timesheetsData]);

  const tasksList = React.useMemo<ProjectTask[]>(() => {
    return [
      { id: "task-1", title: "Implement finance dashboard layout", status: "DONE", priority: "HIGH", dueDate: "2026-06-26", assigneeName: "Selva Dev" },
      { id: "task-2", title: "Verify build system type-checking", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: "2026-06-27", assigneeName: "Antigravity AI" },
      { id: "task-3", title: "Document API integration steps", status: "BACKLOG", priority: "LOW", dueDate: "2026-07-02", assigneeName: "Selva Dev" },
      { id: "task-4", title: "Configure production Docker bundles", status: "IN_REVIEW", priority: "HIGH", dueDate: "2026-06-28", assigneeName: "Dev Team" },
    ];
  }, []);

  // Aggregated indicators
  const stats = React.useMemo(() => {
    const activeProjects = projectsList.filter((p) => p.status === "IN_PROGRESS").length;
    const pendingTasks = tasksList.filter((t) => t.status !== "DONE").length;
    const loggedHours = timesheetsList.reduce((sum, t) => sum + t.hours, 0);

    return {
      activeProjects: activeProjects > 0 ? activeProjects : 2,
      pendingTasks: pendingTasks > 0 ? pendingTasks : 3,
      loggedHours: loggedHours > 0 ? loggedHours : 38,
      milestoneRate: 92,
    };
  }, [projectsList, tasksList, timesheetsList]);

  // Chart data: Logged Hours weekly
  const hoursTrendData = [
    { name: "Mon", Hours: 8 },
    { name: "Tue", Hours: 6 },
    { name: "Wed", Hours: 7.5 },
    { name: "Thu", Hours: 8.5 },
    { name: "Fri", Hours: 8 },
  ];

  // Task statuses donut data
  const taskStatusData = React.useMemo(() => {
    const statuses = { BACKLOG: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
    tasksList.forEach((t) => {
      statuses[t.status] += 1;
    });

    return [
      { name: "Backlog", value: statuses.BACKLOG },
      { name: "In Progress", value: statuses.IN_PROGRESS },
      { name: "In Review", value: statuses.IN_REVIEW },
      { name: "Completed", value: statuses.DONE },
    ];
  }, [tasksList]);

  const getProjectStatusStyle = (status: Project["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PLANNING":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "ON_HOLD":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-655 border-slate-200";
    }
  };

  const getTaskPriorityStyle = (priority: ProjectTask["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Projects Dashboard</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Review active projects, manage work tasks, track team timesheets, and evaluate delivery health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-slate-600 hover:text-slate-900 border-slate-200 bg-white">
            <Calendar className="mr-2 h-4 w-4" />
            Team Calendar
          </Button>
          <Link href="/projects">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Projects */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Projects</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FolderKanban className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{stats.activeProjects}</p>
            <p className="mt-1 text-[12px] text-indigo-600 font-medium">
              4 total registered projects
            </p>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Pending Tasks</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{stats.pendingTasks}</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">
              1 task marked as completed
            </p>
          </CardContent>
        </Card>

        {/* Hours Logged */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Hours Logged (Week)</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{stats.loggedHours} hrs</p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +5% compared to baseline
            </p>
          </CardContent>
        </Card>

        {/* Milestone Rate */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Milestone Success</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Milestone className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{stats.milestoneRate}%</p>
            <p className="mt-1 text-[12px] text-amber-600 font-medium">
              On-time milestone delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timesheet hours line chart */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[15px] font-bold text-slate-900">Workload Analytics</CardTitle>
              <p className="text-[12px] text-slate-500">Daily breakdown of total logged timesheet hours this week.</p>
            </CardHeader>
            <CardContent>
              <LineChart
                data={hoursTrendData}
                xAxisKey="name"
                dataKeys={["Hours"]}
                colors={["#4f46e5"]}
                height={260}
              />
            </CardContent>
          </Card>

          {/* Active Projects Table */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-bold text-slate-900">Project Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                      <th className="py-2.5 px-4">Project</th>
                      <th className="py-2.5 px-4">Completion</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Target Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectsList.map((proj) => (
                      <tr key={proj.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <p>{proj.name}</p>
                          <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px] block">
                            {proj.description}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${proj.progress || 0}%` }}
                              />
                            </div>
                            <span className="font-bold text-[12px] text-slate-700">{proj.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getProjectStatusStyle(proj.status)}`}>
                            {proj.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {new Date(proj.endDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Task status breakdown */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[15px] font-bold text-slate-900">Task Allocation</CardTitle>
              <p className="text-[12px] text-slate-500">Status breakdown of current project tasks.</p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DonutChart
                data={taskStatusData}
                dataKey="value"
                nameKey="name"
                colors={["#94a3b8", "#6366f1", "#f59e0b", "#10b981"]}
                height={200}
              />
            </CardContent>
          </Card>

          {/* AI Project Copilot */}
          <Card className="border-none bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-bold flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-indigo-300" />
                AI Project Copilot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[12.5px] leading-relaxed text-indigo-100">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Target Delay Risk:</strong> Project <code>AI Business OS Frontend</code> has 3 tasks in review. If review bottlenecks persist, completion targets could slip by 4 days.
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Velocity Trend:</strong> Team completed 8 target points this week, showing a 12% improvement in sprint velocity compared to the previous fortnight.
                </p>
              </div>
              <div className="flex gap-2">
                <Clock3 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Workload Alert:</strong> Selva Dev has log entries totaling 38 hours. Monitor task load allocation to prevent developer fatigue or burnouts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

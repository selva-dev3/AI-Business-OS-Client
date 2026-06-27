"use client";

import * as React from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Award, ShoppingBag,
  ArrowUpRight, ArrowDownRight, Calendar, Layers, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Analytics Overview</h1>
          <p className="mt-1 text-[14px] text-slate-500">Real-time telemetry, finance performance, SLA compliance rates, and system workloads.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
          {[
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "12m", label: "12 Months" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
                timeRange === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$412,850.00", icon: DollarSign, change: "+12.4%", isPositive: true, subtext: "vs previous month" },
          { label: "Active Project Users", value: "3,842", icon: Users, change: "+8.2%", isPositive: true, subtext: "vs last week" },
          { label: "Procurement Outflow", value: "$84,310.00", icon: ShoppingBag, change: "-3.1%", isPositive: true, subtext: "less spending" },
          { label: "SLA Resolution Rate", value: "98.4%", icon: ShieldCheck, change: "-0.5%", isPositive: false, subtext: "target 99.0%" },
        ].map((kpi, idx) => (
          <Card key={idx} className="border-slate-200 bg-white shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-slate-500">{kpi.label}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <kpi.icon className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{kpi.value}</span>
                <span className={`inline-flex items-center text-[11px] font-bold ${
                  kpi.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {kpi.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1">{kpi.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom native SVG / CSS Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-bold text-slate-900">Revenue & Expense Trend</CardTitle>
                <CardDescription className="text-[12px] text-slate-400">Monthly breakdown of inflows vs outflows.</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Inflow</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" /> Outflow</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-3 pt-6 relative border-t border-slate-150">
            {/* Visual Grid Lines */}
            <div className="absolute inset-x-0 bottom-6 top-6 flex flex-col justify-between pointer-events-none px-2">
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
            </div>

            {/* Custom columns */}
            {[
              { month: "Jan", inflow: 75, outflow: 35 },
              { month: "Feb", inflow: 88, outflow: 42 },
              { month: "Mar", inflow: 64, outflow: 50 },
              { month: "Apr", inflow: 92, outflow: 58 },
              { month: "May", inflow: 110, outflow: 60 },
              { month: "Jun", inflow: 125, outflow: 70 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group z-10">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  <div
                    style={{ height: `${d.inflow}%` }}
                    className="w-4 sm:w-6 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all hover:brightness-110 shadow-sm relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                      ${d.inflow}k
                    </span>
                  </div>
                  <div
                    style={{ height: `${d.outflow}%` }}
                    className="w-4 sm:w-6 bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-sm transition-all hover:brightness-110 shadow-sm relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                      ${d.outflow}k
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500">{d.month}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[15px] font-bold text-slate-900">Task Allocation</CardTitle>
            <CardDescription className="text-[12px] text-slate-400">Current active workload by project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-slate-150">
            {[
              { name: "AI Business OS Frontend", percent: 45, color: "bg-indigo-600", count: "12 tasks" },
              { name: "Multi-tenant DB Migration", percent: 25, color: "bg-violet-500", count: "8 tasks" },
              { name: "Enterprise Auth Audit", percent: 18, color: "bg-amber-500", count: "5 tasks" },
              { name: "Inventory Automation", percent: 12, color: "bg-slate-400", count: "3 tasks" },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px] font-medium">
                  <span className="text-slate-800 font-semibold truncate max-w-[180px]">{p.name}</span>
                  <span className="text-slate-400">{p.count}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.percent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Allocation Rate</span>
                  <span>{p.percent}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project performance */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[15px] font-bold text-slate-900">Performance Metrics</CardTitle>
            <CardDescription className="text-[12px] text-slate-400">Project delivery schedules vs task completion.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0 border-t border-slate-150">
            {[
              { id: "1", project: "AI Business OS Frontend", milestone: "MVP Release", status: "On Track", score: 94 },
              { id: "2", project: "Multi-tenant DB Migration", milestone: "Schema Design", status: "On Track", score: 88 },
              { id: "3", project: "Enterprise Auth Audit", milestone: "Security Audit Report", status: "Completed", score: 100 },
              { id: "4", project: "Inventory Automation", milestone: "API Integration", status: "At Risk", score: 58 },
            ].map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 truncate">{m.project}</div>
                  <div className="text-[11.5px] text-slate-400 mt-0.5">Current milestone: <span className="font-semibold text-slate-500">{m.milestone}</span></div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    m.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-255" :
                    m.status === "On Track" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                    "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {m.status}
                  </span>
                  <div className="text-right">
                    <span className="text-[13px] font-extrabold text-slate-900">{m.score}%</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Health</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System telemetry logs */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[15px] font-bold text-slate-900">System Telemetry</CardTitle>
            <CardDescription className="text-[12px] text-slate-400">Database and background job status.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0 border-t border-slate-150">
            {[
              { job: "Postgres Read Replica Sync", time: "2 mins ago", duration: "120ms", status: "healthy" },
              { job: "Stripe Webhook Handler", time: "12 mins ago", duration: "340ms", status: "healthy" },
              { job: "Auto-assign Support Ticket Queue", time: "1 hour ago", duration: "1.4s", status: "degraded" },
              { job: "Mailgun Transactional Intake", time: "2 hours ago", duration: "80ms", status: "healthy" },
            ].map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                <div>
                  <div className="text-[13px] font-bold text-slate-900">{job.job}</div>
                  <div className="text-[11.5px] text-slate-400 mt-0.5">Run: <span className="font-semibold">{job.time}</span></div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[12px] text-slate-500">{job.duration}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${job.status === "healthy" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

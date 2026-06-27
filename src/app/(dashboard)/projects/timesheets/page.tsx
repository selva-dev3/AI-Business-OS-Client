"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Clock, Plus, Search, Calendar, User, TrendingUp,
  MoreVertical, Edit2, Trash2, Timer, Briefcase
} from "lucide-react";
import { TimesheetEntry } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockProjects = [
  { id: "proj-1", name: "AI Business OS Frontend" },
  { id: "proj-2", name: "Multi-tenant DB Migration" },
  { id: "proj-3", name: "Enterprise Auth Audit" },
  { id: "proj-4", name: "Inventory Automation Module" },
];

const mockTasks = [
  { id: "task-1", title: "Implement finance dashboard", projectId: "proj-1" },
  { id: "task-2", title: "Verify build type-checking", projectId: "proj-1" },
  { id: "task-3", title: "Document API integration", projectId: "proj-1" },
  { id: "task-4", title: "Configure Docker bundles", projectId: "proj-1" },
  { id: "task-5", title: "Design migration scripts", projectId: "proj-2" },
  { id: "task-6", title: "Audit SSO provider", projectId: "proj-3" },
];

const mockTeam = [
  { id: "u-1", name: "Selva Dev" },
  { id: "u-2", name: "Antigravity AI" },
  { id: "u-3", name: "Priya R." },
  { id: "u-4", name: "Dev Team" },
];

const mockEntries: TimesheetEntry[] = [
  { id: "ts-1", taskId: "task-1", taskName: "Implement finance dashboard", projectId: "proj-1", projectName: "AI Business OS Frontend", userId: "u-1", userName: "Selva Dev", date: "2026-06-27", hours: 8, description: "Completed KPI cards and chart integration." },
  { id: "ts-2", taskId: "task-2", taskName: "Verify build type-checking", projectId: "proj-1", projectName: "AI Business OS Frontend", userId: "u-2", userName: "Antigravity AI", date: "2026-06-27", hours: 6, description: "Fixed tsc errors across inventory and procurement modules." },
  { id: "ts-3", taskId: "task-1", taskName: "Implement finance dashboard", projectId: "proj-1", projectName: "AI Business OS Frontend", userId: "u-1", userName: "Selva Dev", date: "2026-06-26", hours: 7.5, description: "Built invoice management page with CRUD." },
  { id: "ts-4", taskId: "task-4", taskName: "Configure Docker bundles", projectId: "proj-1", projectName: "AI Business OS Frontend", userId: "u-4", userName: "Dev Team", date: "2026-06-26", hours: 4, description: "Multi-stage Dockerfile setup." },
  { id: "ts-5", taskId: "task-5", taskName: "Design migration scripts", projectId: "proj-2", projectName: "Multi-tenant DB Migration", userId: "u-1", userName: "Selva Dev", date: "2026-06-25", hours: 8.5, description: "Drafted RLS policy templates." },
  { id: "ts-6", taskId: "task-6", taskName: "Audit SSO provider", projectId: "proj-3", projectName: "Enterprise Auth Audit", userId: "u-3", userName: "Priya R.", date: "2026-06-25", hours: 5, description: "Reviewed OIDC token refresh flow." },
  { id: "ts-7", taskId: "task-3", taskName: "Document API integration", projectId: "proj-1", projectName: "AI Business OS Frontend", userId: "u-1", userName: "Selva Dev", date: "2026-06-24", hours: 3, description: "Started endpoint documentation." },
  { id: "ts-8", taskId: "task-2", taskName: "Verify build type-checking", projectId: "proj-1", projectName: "AI Business OS Frontend", userId: "u-2", userName: "Antigravity AI", date: "2026-06-24", hours: 8, description: "Type cleanup for CRM and HRMS modules." },
];

export default function TimesheetsPage() {
  const [entries, setEntries] = React.useState<TimesheetEntry[]>(mockEntries);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [userFilter, setUserFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    taskId: "", userId: "", date: new Date().toISOString().split("T")[0],
    hours: 0, description: "",
  });

  // Filtered tasks based on selected project (for form)
  const filteredFormTasks = React.useMemo(() => {
    if (!form.taskId) return mockTasks;
    const task = mockTasks.find((t) => t.id === form.taskId);
    return task ? mockTasks.filter((t) => t.projectId === task.projectId) : mockTasks;
  }, [form.taskId]);

  const filtered = React.useMemo(() => {
    return entries.filter((e) => {
      const ms = (e.taskName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const mpr = projectFilter === "all" ? true : e.projectId === projectFilter;
      const mu = userFilter === "all" ? true : e.userId === userFilter;
      return ms && mpr && mu;
    });
  }, [entries, searchTerm, projectFilter, userFilter]);

  const metrics = React.useMemo(() => {
    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    const today = new Date().toISOString().split("T")[0];
    const todayHours = entries.filter((e) => e.date === today).reduce((s, e) => s + e.hours, 0);
    const uniqueUsers = new Set(entries.map((e) => e.userId)).size;
    const avgPerDay = entries.length > 0 ? (totalHours / new Set(entries.map((e) => e.date)).size) : 0;
    return { totalHours, todayHours, uniqueUsers, avgPerDay: Math.round(avgPerDay * 10) / 10, totalEntries: entries.length };
  }, [entries]);

  // Group by date for display
  const groupedByDate = React.useMemo(() => {
    const groups: Record<string, TimesheetEntry[]> = {};
    filtered.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ taskId: "", userId: "", date: new Date().toISOString().split("T")[0], hours: 0, description: "" });
    setIsFormOpen(true);
  };

  const openEdit = (entry: TimesheetEntry) => {
    setEditingId(entry.id);
    setForm({
      taskId: entry.taskId, userId: entry.userId,
      date: entry.date, hours: entry.hours,
      description: entry.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.taskId || !form.userId || !form.hours) {
      toast.error("Task, team member, and hours are required."); return;
    }
    const task = mockTasks.find((t) => t.id === form.taskId);
    const proj = task ? mockProjects.find((p) => p.id === task.projectId) : null;
    const user = mockTeam.find((u) => u.id === form.userId);

    if (editingId) {
      setEntries((p) => p.map((en) => en.id === editingId ? {
        ...en, taskId: form.taskId, taskName: task?.title,
        projectId: task?.projectId || "", projectName: proj?.name,
        userId: form.userId, userName: user?.name,
        date: form.date, hours: form.hours,
        description: form.description || undefined,
      } : en));
      toast.success("Timesheet entry updated.");
    } else {
      const newEntry: TimesheetEntry = {
        id: `ts-${Date.now()}`, taskId: form.taskId, taskName: task?.title,
        projectId: task?.projectId || "", projectName: proj?.name,
        userId: form.userId, userName: user?.name,
        date: form.date, hours: form.hours,
        description: form.description || undefined,
      };
      setEntries((p) => [newEntry, ...p]);
      toast.success("Time entry logged.");
    }
    setIsFormOpen(false);
  };

  const deleteEntry = (id: string) => {
    setEntries((p) => p.filter((e) => e.id !== id));
    toast.success("Entry removed.");
  };

  const formatDate = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    if (dt.getTime() === today.getTime()) return "Today";
    if (dt.getTime() === yest.getTime()) return "Yesterday";
    return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Timesheets</h1>
          <p className="mt-1 text-[14px] text-slate-500">Track time spent on project tasks and monitor team productivity.</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />Log Time
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Hours", value: `${metrics.totalHours}h`, icon: Clock, bg: "indigo" },
          { label: "Today", value: `${metrics.todayHours}h`, icon: Timer, bg: "emerald" },
          { label: "Avg / Day", value: `${metrics.avgPerDay}h`, icon: TrendingUp, bg: "amber" },
          { label: "Active Members", value: metrics.uniqueUsers, icon: User, bg: "violet" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-slate-500">{kpi.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg bg-${kpi.bg}-50 flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 text-${kpi.bg}-600`} />
              </div>
            </CardHeader>
            <CardContent><p className="text-2xl font-extrabold text-slate-900">{kpi.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search entries..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-44 bg-white border-slate-200"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Projects</SelectItem>
              {mockProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-36 bg-white border-slate-200"><SelectValue placeholder="Member" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Members</SelectItem>
              {mockTeam.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grouped by Date */}
      <div className="space-y-4">
        {groupedByDate.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 font-medium">No timesheet entries found.</div>
        ) : groupedByDate.map(([date, dateEntries]) => {
          const dayTotal = dateEntries.reduce((s, e) => s + e.hours, 0);
          return (
            <div key={date} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50/80 px-4 py-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[13px] font-bold text-slate-700">{formatDate(date)}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{date}</span>
                </div>
                <span className="text-[12px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {dayTotal}h total
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {dateEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {(entry.userName || "?").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-slate-900 truncate">{entry.taskName}</span>
                          <span className="text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium shrink-0">{entry.projectName}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11.5px] text-slate-400">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{entry.userName}</span>
                          {entry.description && <span className="truncate max-w-[200px]">{entry.description}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[14px] font-extrabold text-slate-900 tabular-nums">{entry.hours}h</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-200">
                          <DropdownMenuItem onClick={() => openEdit(entry)}><Edit2 className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteEntry(entry.id)} className="text-rose-600"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Time Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{editingId ? "Edit Time Entry" : "Log Time"}</DialogTitle>
            <DialogDescription>Record hours worked on a project task.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Task *</Label>
              <Select value={form.taskId} onValueChange={(val: string) => setForm({ ...form, taskId: val })}>
                <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select task" /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {mockTasks.map((t) => {
                    const proj = mockProjects.find((p) => p.id === t.projectId);
                    return <SelectItem key={t.id} value={t.id}>{t.title} ({proj?.name})</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Team Member *</Label>
                <Select value={form.userId} onValueChange={(val: string) => setForm({ ...form, userId: val })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {mockTeam.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Hours *</Label>
                <Input type="number" step={0.5} min={0.5} max={24} value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: parseFloat(e.target.value) || 0 })} placeholder="8" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What did you work on?" />
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="border-slate-200">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">{editingId ? "Save" : "Log Time"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

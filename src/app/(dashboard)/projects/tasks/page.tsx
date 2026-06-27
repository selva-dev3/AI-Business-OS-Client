"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckSquare, Plus, Search, Clock, AlertCircle, User, Calendar,
  MoreVertical, Edit2, Trash2, Eye, ArrowUp, ArrowRight, ArrowDown, Flame,
  CircleDot, PlayCircle, RotateCcw, CheckCircle2
} from "lucide-react";
import { Task } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const mockTasks: Task[] = [
  { id: "task-1", title: "Implement finance dashboard layout", description: "Build KPI cards, charts, and data tables for the finance overview page.", projectId: "proj-1", projectName: "AI Business OS Frontend", status: "done", priority: "high", assigneeName: "Selva Dev", dueDate: "2026-06-26", estimatedHours: 8, loggedHours: 7.5, createdAt: "2026-06-20" },
  { id: "task-2", title: "Verify build system type-checking", description: "Run full tsc --noEmit and resolve all type errors across the codebase.", projectId: "proj-1", projectName: "AI Business OS Frontend", status: "in_progress", priority: "medium", assigneeName: "Antigravity AI", dueDate: "2026-06-27", estimatedHours: 4, loggedHours: 2, createdAt: "2026-06-25" },
  { id: "task-3", title: "Document API integration steps", description: "Write developer guide for connecting frontend hooks to backend endpoints.", projectId: "proj-1", projectName: "AI Business OS Frontend", status: "todo", priority: "low", assigneeName: "Selva Dev", dueDate: "2026-07-02", estimatedHours: 6, loggedHours: 0, createdAt: "2026-06-22" },
  { id: "task-4", title: "Configure production Docker bundles", description: "Set up multi-stage Docker builds for Next.js deployment.", projectId: "proj-1", projectName: "AI Business OS Frontend", status: "review", priority: "high", assigneeName: "Dev Team", dueDate: "2026-06-28", estimatedHours: 5, loggedHours: 4, createdAt: "2026-06-23" },
  { id: "task-5", title: "Design database migration scripts", description: "Create SQL migration files for PostgreSQL schema changes.", projectId: "proj-2", projectName: "Multi-tenant DB Migration", status: "todo", priority: "critical", assigneeName: "Selva Dev", dueDate: "2026-07-15", estimatedHours: 12, loggedHours: 0, createdAt: "2026-06-25" },
  { id: "task-6", title: "Audit SSO provider integration", description: "Review OAuth2/OIDC flows and token lifecycle management.", projectId: "proj-3", projectName: "Enterprise Auth Audit", status: "done", priority: "high", assigneeName: "Security Team", dueDate: "2026-06-18", estimatedHours: 10, loggedHours: 9.5, createdAt: "2026-06-10" },
];

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [detailTask, setDetailTask] = React.useState<Task | null>(null);

  const [form, setForm] = React.useState({
    title: "", description: "", projectId: "", priority: "medium" as Task["priority"],
    assigneeName: "", dueDate: "", estimatedHours: 0,
  });

  const filtered = React.useMemo(() => {
    return tasks.filter((t) => {
      const ms = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assigneeName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const mst = statusFilter === "all" ? true : t.status === statusFilter;
      const mp = priorityFilter === "all" ? true : t.priority === priorityFilter;
      return ms && mst && mp;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const metrics = React.useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
    totalEstimated: tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0),
    totalLogged: tasks.reduce((s, t) => s + (t.loggedHours || 0), 0),
  }), [tasks]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", projectId: "", priority: "medium", assigneeName: "", dueDate: "", estimatedHours: 0 });
    setIsFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      title: task.title, description: task.description || "",
      projectId: task.projectId, priority: task.priority,
      assigneeName: task.assigneeName || "", dueDate: task.dueDate || "",
      estimatedHours: task.estimatedHours || 0,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.projectId) { toast.error("Title and project are required."); return; }
    const proj = mockProjects.find((p) => p.id === form.projectId);
    if (editingId) {
      setTasks((p) => p.map((t) => t.id === editingId ? { ...t, ...form, projectName: proj?.name, description: form.description || undefined, assigneeName: form.assigneeName || undefined, dueDate: form.dueDate || undefined, estimatedHours: form.estimatedHours || undefined } : t));
      toast.success("Task updated.");
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`, title: form.title, description: form.description || undefined,
        projectId: form.projectId, projectName: proj?.name,
        status: "todo", priority: form.priority,
        assigneeName: form.assigneeName || undefined, dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours || undefined, loggedHours: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTasks((p) => [newTask, ...p]);
      toast.success("Task created.");
    }
    setIsFormOpen(false);
  };

  const updateStatus = (id: string, ns: Task["status"]) => {
    setTasks((p) => p.map((t) => {
      if (t.id === id) { toast.success(`Task → ${ns.replace("_", " ").toUpperCase()}`); return { ...t, status: ns }; }
      return t;
    }));
  };

  const deleteTask = (id: string) => { setTasks((p) => p.filter((t) => t.id !== id)); toast.success("Task deleted."); };

  const priorityIcon = (p: Task["priority"]) => {
    if (p === "critical") return <Flame className="h-3 w-3 text-rose-500" />;
    if (p === "high") return <ArrowUp className="h-3 w-3 text-orange-500" />;
    if (p === "medium") return <ArrowRight className="h-3 w-3 text-amber-500" />;
    return <ArrowDown className="h-3 w-3 text-slate-400" />;
  };
  const priorityStyle = (p: Task["priority"]) => {
    if (p === "critical") return "bg-rose-50 text-rose-700 border-rose-200";
    if (p === "high") return "bg-orange-50 text-orange-700 border-orange-200";
    if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const statusStyle = (s: Task["status"]) => {
    if (s === "done") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "in_progress") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s === "review") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "cancelled") return "bg-rose-50 text-rose-600 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const statusDot = (s: Task["status"]) => {
    if (s === "done") return "bg-emerald-500";
    if (s === "in_progress") return "bg-indigo-500";
    if (s === "review") return "bg-amber-500";
    if (s === "cancelled") return "bg-rose-500";
    return "bg-slate-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Task Management</h1>
          <p className="mt-1 text-[14px] text-slate-500">Create, assign, and track project tasks across your team.</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />New Task
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "To Do", value: metrics.todo, color: "slate" },
          { label: "In Progress", value: metrics.inProgress, color: "indigo" },
          { label: "In Review", value: metrics.review, color: "amber" },
          { label: "Done", value: metrics.done, color: "emerald" },
          { label: "Hours Logged", value: `${metrics.totalLogged}h`, color: "violet" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-[12px] font-medium text-slate-500">{kpi.label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search tasks, projects, or assignees..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 font-medium">No tasks match your filters.</td></tr>
              ) : filtered.map((task) => (
                <tr key={task.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{task.title}</div>
                    {task.description && <div className="text-[11px] text-slate-400 truncate mt-0.5">{task.description}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[12px]">{task.projectName}</td>
                  <td className="py-3.5 px-4">
                    {task.assigneeName ? (
                      <div className="flex items-center gap-1.5 text-slate-700 text-[12.5px]">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold">{task.assigneeName.charAt(0)}</div>
                        {task.assigneeName}
                      </div>
                    ) : <span className="text-slate-400 text-[12px]">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle(task.priority)}`}>
                      {priorityIcon(task.priority)} {task.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[12px]">
                    {task.dueDate ? <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" />{task.dueDate}</span> : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-[12px]">
                    <span className="font-bold text-slate-700">{task.loggedHours || 0}</span>
                    <span className="text-slate-400">/{task.estimatedHours || 0}h</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(task.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(task.status)}`} />
                      {task.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem onClick={() => setDetailTask(task)}><Eye className="mr-2 h-3.5 w-3.5" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(task)}><Edit2 className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                        {task.status === "todo" && <DropdownMenuItem onClick={() => updateStatus(task.id, "in_progress")}><PlayCircle className="mr-2 h-3.5 w-3.5" />Start</DropdownMenuItem>}
                        {task.status === "in_progress" && <DropdownMenuItem onClick={() => updateStatus(task.id, "review")}><RotateCcw className="mr-2 h-3.5 w-3.5" />Send to Review</DropdownMenuItem>}
                        {task.status === "review" && <DropdownMenuItem onClick={() => updateStatus(task.id, "done")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Complete</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-rose-600"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{editingId ? "Edit Task" : "Create Task"}</DialogTitle>
            <DialogDescription>{editingId ? "Update task details." : "Add a new task to a project."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Implement login page" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task details..." className="min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Project *</Label>
                <Select value={form.projectId} onValueChange={(val: string) => setForm({ ...form, projectId: val })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {mockProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Priority</Label>
                <Select value={form.priority} onValueChange={(val: string) => setForm({ ...form, priority: val as Task["priority"] })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Assignee</Label>
                <Input value={form.assigneeName} onChange={(e) => setForm({ ...form, assigneeName: e.target.value })} placeholder="Team member name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Estimated Hours</Label>
                <Input type="number" min={0} value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="border-slate-200">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">{editingId ? "Save" : "Create Task"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailTask} onOpenChange={(o) => { if (!o) setDetailTask(null); }}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{detailTask?.title}</DialogTitle>
            <DialogDescription>{detailTask?.projectName}</DialogDescription>
          </DialogHeader>
          {detailTask && (
            <div className="space-y-3 text-[13px]">
              {detailTask.description && <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{detailTask.description}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-slate-400 text-[11px] font-semibold block">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(detailTask.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot(detailTask.status)}`} />{detailTask.status.replace("_", " ").toUpperCase()}
                  </span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Priority</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle(detailTask.priority)}`}>
                    {priorityIcon(detailTask.priority)} {detailTask.priority.toUpperCase()}
                  </span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Assignee</span><span className="text-slate-700 font-semibold">{detailTask.assigneeName || "—"}</span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Due</span><span className="text-slate-700">{detailTask.dueDate || "—"}</span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Hours</span><span className="font-bold text-slate-700">{detailTask.loggedHours || 0}/{detailTask.estimatedHours || 0}h</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

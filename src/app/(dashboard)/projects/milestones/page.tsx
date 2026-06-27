"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Flag, Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle,
  MoreVertical, Edit2, Trash2, Eye, Target
} from "lucide-react";
import { Milestone } from "@/types/project";
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

const mockMilestones: (Milestone & { projectName: string })[] = [
  { id: "ms-1", projectId: "proj-1", name: "MVP Release", description: "Deliver core dashboard, HRMS, CRM, and Finance modules.", dueDate: "2026-07-15", status: "in_progress", projectName: "AI Business OS Frontend" },
  { id: "ms-2", projectId: "proj-1", name: "Beta Testing Phase", description: "Internal QA and UAT for all implemented modules.", dueDate: "2026-08-01", status: "pending", projectName: "AI Business OS Frontend" },
  { id: "ms-3", projectId: "proj-2", name: "Schema Design Complete", description: "Finalize multi-tenant PostgreSQL schema with RLS policies.", dueDate: "2026-07-20", status: "pending", projectName: "Multi-tenant DB Migration" },
  { id: "ms-4", projectId: "proj-3", name: "Security Audit Report", description: "Submit final audit findings and remediation plan.", dueDate: "2026-06-18", completedAt: "2026-06-17", status: "completed", projectName: "Enterprise Auth Audit" },
  { id: "ms-5", projectId: "proj-1", name: "Production Deployment", description: "Deploy to production with CI/CD pipeline.", dueDate: "2026-08-30", status: "pending", projectName: "AI Business OS Frontend" },
  { id: "ms-6", projectId: "proj-4", name: "Supplier API Integration", description: "Connect to supplier ordering APIs.", dueDate: "2026-06-15", status: "overdue", projectName: "Inventory Automation Module" },
];

export default function MilestonesPage() {
  const [milestones, setMilestones] = React.useState(mockMilestones);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "", description: "", projectId: "", dueDate: "",
  });

  const filtered = React.useMemo(() => {
    return milestones.filter((m) => {
      const ms = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const mf = statusFilter === "all" ? true : m.status === statusFilter;
      return ms && mf;
    });
  }, [milestones, searchTerm, statusFilter]);

  const metrics = React.useMemo(() => ({
    total: milestones.length,
    completed: milestones.filter((m) => m.status === "completed").length,
    inProgress: milestones.filter((m) => m.status === "in_progress").length,
    overdue: milestones.filter((m) => m.status === "overdue").length,
    pending: milestones.filter((m) => m.status === "pending").length,
  }), [milestones]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", projectId: "", dueDate: "" });
    setIsFormOpen(true);
  };

  const openEdit = (ms: typeof mockMilestones[0]) => {
    setEditingId(ms.id);
    setForm({ name: ms.name, description: ms.description || "", projectId: ms.projectId, dueDate: ms.dueDate });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.projectId || !form.dueDate) { toast.error("Name, project, and due date are required."); return; }
    const proj = mockProjects.find((p) => p.id === form.projectId);
    if (editingId) {
      setMilestones((p) => p.map((m) => m.id === editingId ? { ...m, name: form.name, description: form.description || undefined, projectId: form.projectId, projectName: proj?.name || "", dueDate: form.dueDate } : m));
      toast.success("Milestone updated.");
    } else {
      const newMs = {
        id: `ms-${Date.now()}`, projectId: form.projectId, projectName: proj?.name || "",
        name: form.name, description: form.description || undefined,
        dueDate: form.dueDate, status: "pending" as const,
      };
      setMilestones((p) => [newMs, ...p]);
      toast.success("Milestone created.");
    }
    setIsFormOpen(false);
  };

  const updateStatus = (id: string, ns: Milestone["status"]) => {
    setMilestones((p) => p.map((m) => {
      if (m.id === id) {
        toast.success(`Milestone → ${ns.toUpperCase()}`);
        return { ...m, status: ns, completedAt: ns === "completed" ? new Date().toISOString().split("T")[0] : m.completedAt };
      }
      return m;
    }));
  };

  const deleteMilestone = (id: string) => { setMilestones((p) => p.filter((m) => m.id !== id)); toast.success("Milestone deleted."); };

  const sStyle = (s: Milestone["status"]) => {
    if (s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "in_progress") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s === "overdue") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const sDot = (s: Milestone["status"]) => {
    if (s === "completed") return "bg-emerald-500";
    if (s === "in_progress") return "bg-indigo-500";
    if (s === "overdue") return "bg-rose-500";
    return "bg-slate-400";
  };
  const sIcon = (s: Milestone["status"]) => {
    if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (s === "in_progress") return <Clock className="h-4 w-4 text-indigo-500" />;
    if (s === "overdue") return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    return <Target className="h-4 w-4 text-slate-400" />;
  };

  // Calculate days remaining for a milestone
  const daysRemaining = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return "Due today";
    return `${diff}d remaining`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Milestones</h1>
          <p className="mt-1 text-[14px] text-slate-500">Define and track key project delivery checkpoints.</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />Add Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Completed", value: metrics.completed, icon: CheckCircle2, bg: "emerald" },
          { label: "In Progress", value: metrics.inProgress, icon: Clock, bg: "indigo" },
          { label: "Pending", value: metrics.pending, icon: Target, bg: "slate" },
          { label: "Overdue", value: metrics.overdue, icon: AlertTriangle, bg: "rose" },
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
          <Input placeholder="Search milestones or projects..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Milestone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">No milestones match your filters.</div>
        ) : filtered.map((ms) => (
          <Card key={ms.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ms.status === "completed" ? "bg-emerald-100" :
                    ms.status === "in_progress" ? "bg-indigo-100" :
                    ms.status === "overdue" ? "bg-rose-100" : "bg-slate-100"
                  }`}>
                    {sIcon(ms.status)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">{ms.name}</h3>
                    <p className="text-[12px] text-indigo-600 font-medium mt-0.5">{ms.projectName}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-slate-200">
                    <DropdownMenuItem onClick={() => openEdit(ms)}><Edit2 className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                    {ms.status === "pending" && <DropdownMenuItem onClick={() => updateStatus(ms.id, "in_progress")}><Clock className="mr-2 h-3.5 w-3.5" />Start</DropdownMenuItem>}
                    {(ms.status === "in_progress" || ms.status === "overdue") && <DropdownMenuItem onClick={() => updateStatus(ms.id, "completed")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Complete</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => deleteMilestone(ms.id)} className="text-rose-600"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {ms.description && <p className="text-[12.5px] text-slate-500 leading-relaxed">{ms.description}</p>}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-4 text-[12px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Calendar className="h-3 w-3 text-slate-400" />Due: <span className="font-semibold">{ms.dueDate}</span>
                  </span>
                  <span className={`font-semibold ${ms.status === "overdue" ? "text-rose-600" : ms.status === "completed" ? "text-emerald-600" : "text-slate-500"}`}>
                    {ms.status === "completed" ? `Completed ${ms.completedAt}` : daysRemaining(ms.dueDate)}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sStyle(ms.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sDot(ms.status)}`} />{ms.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{editingId ? "Edit Milestone" : "Create Milestone"}</DialogTitle>
            <DialogDescription>Define a key delivery checkpoint for a project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MVP Release" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this milestone deliver?" className="min-h-[60px]" />
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
                <Label className="text-[12px] font-semibold text-slate-600">Due Date *</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="border-slate-200">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">{editingId ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

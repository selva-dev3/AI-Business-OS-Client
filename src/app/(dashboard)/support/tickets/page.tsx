"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  LifeBuoy, Plus, Search, Calendar, User, MoreVertical, Edit2, Trash2, Eye,
  AlertCircle, CheckCircle2, Clock, Mail, Laptop, MessageSquare, PhoneCall,
  UserCheck, CornerDownLeft, ShieldAlert
} from "lucide-react";
import { SupportTicket, TicketCategory } from "@/types/support";
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

const mockCategories: TicketCategory[] = [
  { id: "cat-1", name: "Technical Support", description: "Hardware, software, deployment, and database issues." },
  { id: "cat-2", name: "Billing & Invoices", description: "Subscription payments, credit cards, and invoice queries." },
  { id: "cat-3", name: "Account Access", description: "Password resets, multi-tenant workspace issues, and MFA." },
  { id: "cat-4", name: "Feature Requests", description: "User feedback, suggestions, and feature enhancement requests." },
];

const mockTickets: SupportTicket[] = [
  {
    id: "t-1", ticketNumber: "TIC-8472", subject: "PostgreSQL Database connection timeouts",
    description: "Database times out during peak read-heavy operations. Need help analyzing connection pools.",
    categoryId: "cat-1", categoryName: "Technical Support",
    requesterId: "req-1", requesterName: "Dev Team Lead", requesterEmail: "lead@client.com",
    assigneeId: "agent-1", assigneeName: "Antigravity AI",
    priority: "critical", status: "in_progress", source: "web",
    slaDueDate: "2026-06-27T16:00:00Z", createdAt: "2026-06-27", updatedAt: "2026-06-27",
  },
  {
    id: "t-2", ticketNumber: "TIC-8473", subject: "Failed invoice transaction charging twice",
    description: "Client was billed twice for June 2026 invoice. Please refund the duplicate transaction.",
    categoryId: "cat-2", categoryName: "Billing & Invoices",
    requesterId: "req-2", requesterName: "Sarah Jenkins", requesterEmail: "sjenkins@apexsemi.com",
    priority: "high", status: "open", source: "email",
    slaDueDate: "2026-06-28T09:00:00Z", createdAt: "2026-06-27", updatedAt: "2026-06-27",
  },
  {
    id: "t-3", ticketNumber: "TIC-8470", subject: "SSO login redirection error",
    description: "Azure AD SSO users get redirected to a 500 error page after successful authentication.",
    categoryId: "cat-3", categoryName: "Account Access",
    requesterId: "req-3", requesterName: "MFA Administrator", requesterEmail: "admin@globaltech.com",
    assigneeId: "agent-2", assigneeName: "Selva Dev",
    priority: "high", status: "resolved", source: "chat",
    slaDueDate: "2026-06-26T12:00:00Z", createdAt: "2026-06-26", updatedAt: "2026-06-26",
    resolvedAt: "2026-06-26",
  },
  {
    id: "t-4", ticketNumber: "TIC-8468", subject: "Export report format option CSV request",
    description: "Users want to export tabular lists as native CSV rather than just Excel sheet format.",
    categoryId: "cat-4", categoryName: "Feature Requests",
    requesterId: "req-4", requesterName: "Elena Rostova", requesterEmail: "e.rostova@vectorpower.eu",
    priority: "low", status: "closed", source: "web",
    createdAt: "2026-06-25", updatedAt: "2026-06-26",
  },
];

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [detailTicket, setDetailTicket] = React.useState<SupportTicket | null>(null);

  // Form state
  const [form, setForm] = React.useState({
    subject: "", description: "", categoryId: "", priority: "medium" as SupportTicket["priority"],
    requesterName: "", requesterEmail: "", assigneeName: "", source: "web" as SupportTicket["source"],
  });

  const filtered = React.useMemo(() => {
    return tickets.filter((t) => {
      const ms = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assigneeName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const mst = statusFilter === "all" ? true : t.status === statusFilter;
      const mp = priorityFilter === "all" ? true : t.priority === priorityFilter;
      return ms && mst && mp;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const metrics = React.useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    critical: tickets.filter((t) => t.priority === "critical" && t.status !== "resolved" && t.status !== "closed").length,
  }), [tickets]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      subject: "", description: "", categoryId: "", priority: "medium",
      requesterName: "", requesterEmail: "", assigneeName: "", source: "web",
    });
    setIsFormOpen(true);
  };

  const openEdit = (t: SupportTicket) => {
    setEditingId(t.id);
    setForm({
      subject: t.subject, description: t.description, categoryId: t.categoryId || "",
      priority: t.priority, requesterName: t.requesterName, requesterEmail: t.requesterEmail,
      assigneeName: t.assigneeName || "", source: t.source,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.requesterName || !form.requesterEmail) {
      toast.error("Subject, requester name, and email are required."); return;
    }
    const cat = mockCategories.find((c) => c.id === form.categoryId);
    if (editingId) {
      setTickets((prev) => prev.map((t) => t.id === editingId ? {
        ...t, ...form, categoryName: cat?.name,
        assigneeId: form.assigneeName ? "agent-logged" : undefined,
        updatedAt: new Date().toISOString().split("T")[0],
      } : t));
      toast.success("Ticket updated successfully.");
    } else {
      const newTicket: SupportTicket = {
        id: `t-${Date.now()}`,
        ticketNumber: `TIC-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: form.subject, description: form.description,
        categoryId: form.categoryId || undefined, categoryName: cat?.name,
        requesterId: `req-${Date.now()}`, requesterName: form.requesterName, requesterEmail: form.requesterEmail,
        assigneeId: form.assigneeName ? "agent-logged" : undefined, assigneeName: form.assigneeName || undefined,
        priority: form.priority, status: "open", source: form.source,
        slaDueDate: form.priority === "critical" ? new Date(Date.now() + 4 * 3600000).toISOString() : undefined,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setTickets((prev) => [newTicket, ...prev]);
      toast.success(`Ticket ${newTicket.ticketNumber} opened.`);
    }
    setIsFormOpen(false);
  };

  const updateStatus = (id: string, ns: SupportTicket["status"]) => {
    setTickets((prev) => prev.map((t) => {
      if (t.id === id) {
        toast.success(`Ticket status updated → ${ns.toUpperCase()}`);
        return {
          ...t, status: ns,
          resolvedAt: ns === "resolved" ? new Date().toISOString().split("T")[0] : t.resolvedAt,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return t;
    }));
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    toast.success("Ticket removed.");
  };

  const sourceIcon = (s: SupportTicket["source"]) => {
    if (s === "email") return <Mail className="h-3.5 w-3.5" />;
    if (s === "web") return <Laptop className="h-3.5 w-3.5" />;
    if (s === "chat") return <MessageSquare className="h-3.5 w-3.5" />;
    return <PhoneCall className="h-3.5 w-3.5" />;
  };

  const priorityStyle = (p: SupportTicket["priority"]) => {
    if (p === "critical") return "bg-rose-50 text-rose-700 border-rose-200";
    if (p === "high") return "bg-orange-50 text-orange-700 border-orange-200";
    if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const statusStyle = (s: SupportTicket["status"]) => {
    if (s === "resolved" || s === "closed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "in_progress") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const statusDot = (s: SupportTicket["status"]) => {
    if (s === "resolved" || s === "closed") return "bg-emerald-500";
    if (s === "in_progress") return "bg-indigo-500";
    if (s === "pending") return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Support Tickets</h1>
          <p className="mt-1 text-[14px] text-slate-500">Manage client service queries, assign issues to support agents, and monitor SLA fulfillment.</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />New Ticket
        </Button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total Queries", value: metrics.total, icon: LifeBuoy, bg: "indigo" },
          { label: "Open Tickets", value: metrics.open, icon: Clock, bg: "slate" },
          { label: "In Progress", value: metrics.inProgress, icon: UserCheck, bg: "indigo" },
          { label: "Resolved", value: metrics.resolved, icon: CheckCircle2, bg: "emerald" },
          { label: "Unresolved Critical", value: metrics.critical, icon: ShieldAlert, bg: "rose" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1 px-4 pt-4">
              <CardTitle className="text-[12px] font-medium text-slate-500">{kpi.label}</CardTitle>
              <kpi.icon className={`h-4 w-4 text-${kpi.bg}-600`} />
            </CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-2xl font-extrabold text-slate-900">{kpi.value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search ticket #, subject, client, or agent..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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

      {/* List table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400 font-medium">No tickets match your filter settings.</td></tr>
              ) : filtered.map((ticket) => (
                <tr key={ticket.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono text-[12px]">{ticket.ticketNumber}</td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{ticket.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{ticket.description}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[12.5px] text-slate-600">{ticket.categoryName || "Unassigned"}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{ticket.requesterName}</div>
                    <div className="text-[11px] text-slate-400">{ticket.requesterEmail}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[12.5px] text-slate-700">
                    {ticket.assigneeName ? (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />{ticket.assigneeName}
                      </span>
                    ) : <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-500 capitalize">
                      {sourceIcon(ticket.source)} {ticket.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(ticket.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(ticket.status)}`} />
                      {ticket.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem onClick={() => setDetailTicket(ticket)}><Eye className="mr-2 h-3.5 w-3.5" />View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(ticket)}><Edit2 className="mr-2 h-3.5 w-3.5" />Edit Ticket</DropdownMenuItem>
                        {ticket.status !== "in_progress" && ticket.status !== "resolved" && <DropdownMenuItem onClick={() => updateStatus(ticket.id, "in_progress")}><Clock className="mr-2 h-3.5 w-3.5" />Start Working</DropdownMenuItem>}
                        {ticket.status !== "resolved" && <DropdownMenuItem onClick={() => updateStatus(ticket.id, "resolved")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Mark Resolved</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => deleteTicket(ticket.id)} className="text-rose-600"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record creation modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{editingId ? "Edit Support Ticket" : "Open Support Ticket"}</DialogTitle>
            <DialogDescription>Submit detailed client service issue record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Subject *</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary of issue" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Detailed Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Please provide steps to reproduce, client configurations..." className="min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Category</Label>
                <Select value={form.categoryId} onValueChange={(val: string) => setForm({ ...form, categoryId: val })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {mockCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Priority</Label>
                <Select value={form.priority} onValueChange={(val: string) => setForm({ ...form, priority: val as SupportTicket["priority"] })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select Priority" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Requester Name *</Label>
                <Input value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} placeholder="e.g. John Doe" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Requester Email *</Label>
                <Input type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} placeholder="johndoe@email.com" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Assignee</Label>
                <Input value={form.assigneeName} onChange={(e) => setForm({ ...form, assigneeName: e.target.value })} placeholder="Agent Name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Source Channel</Label>
                <Select value={form.source} onValueChange={(val: string) => setForm({ ...form, source: val as SupportTicket["source"] })}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Source" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="web">Web Portal</SelectItem>
                    <SelectItem value="email">Email Intake</SelectItem>
                    <SelectItem value="chat">Live Chat</SelectItem>
                    <SelectItem value="phone">Phone Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="border-slate-200">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">{editingId ? "Save Changes" : "Create Ticket"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Drawer / Dialog */}
      <Dialog open={!!detailTicket} onOpenChange={(o) => { if (!o) setDetailTicket(null); }}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <div className="flex items-center justify-between mr-6">
              <DialogTitle className="text-lg font-bold text-slate-900">{detailTicket?.ticketNumber} — {detailTicket?.subject}</DialogTitle>
            </div>
            <DialogDescription>{detailTicket?.categoryName || "General Query"}</DialogDescription>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[11px] font-semibold block uppercase">Issue details</span>
                <p className="text-[13px] text-slate-700 mt-1 leading-relaxed">{detailTicket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px] border-t border-slate-100 pt-3">
                <div><span className="text-slate-400 text-[11px] font-semibold block">Requester</span>
                  <span className="text-slate-700 font-semibold">{detailTicket.requesterName}</span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Email</span>
                  <span className="text-indigo-600 font-mono text-[11.5px]">{detailTicket.requesterEmail}</span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Priority</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle(detailTicket.priority)}`}>
                    {detailTicket.priority.toUpperCase()}
                  </span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(detailTicket.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot(detailTicket.status)}`} />
                    {detailTicket.status.toUpperCase()}
                  </span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Source Intake</span>
                  <span className="text-slate-700 flex items-center gap-1 text-[12px] capitalize">
                    {sourceIcon(detailTicket.source)} {detailTicket.source}
                  </span></div>
                <div><span className="text-slate-400 text-[11px] font-semibold block">Assigned Agent</span>
                  <span className="text-slate-750 font-medium">{detailTicket.assigneeName || "None"}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Folder, Plus, Search, Tag, Users, MoreVertical, Edit2, Trash2, BookOpen, AlertCircle
} from "lucide-react";
import { TicketCategory } from "@/types/support";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockCategories: (TicketCategory & { ticketCount: number })[] = [
  { id: "cat-1", name: "Technical Support", description: "Hardware failure, SaaS deployment pipelines, system logs, database replication, and query timeouts.", defaultAssigneeId: "agent-1", ticketCount: 14 },
  { id: "cat-2", name: "Billing & Invoices", description: "Credit cards, Stripe invoices, subscription packages, and duplicate transaction refunds.", defaultAssigneeId: "agent-2", ticketCount: 8 },
  { id: "cat-3", name: "Account Access", description: "MFA resets, Azure AD SSO login configuration, active directory sync, and user invitations.", defaultAssigneeId: "agent-3", ticketCount: 5 },
  { id: "cat-4", name: "Feature Requests", description: "Client feature suggestions, feedback dashboards, custom CSV export demands, and usability enhancements.", defaultAssigneeId: "agent-4", ticketCount: 12 },
  { id: "cat-5", name: "General Inquiries", description: "Informational tickets regarding company products, developer API documents, and business hours.", ticketCount: 3 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState(mockCategories);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "", description: "", defaultAssigneeId: "",
  });

  const filtered = React.useMemo(() => {
    return categories.filter((c) => {
      return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [categories, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", defaultAssigneeId: "" });
    setIsFormOpen(true);
  };

  const openEdit = (c: typeof mockCategories[0]) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || "", defaultAssigneeId: c.defaultAssigneeId || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Category name is required."); return; }
    if (editingId) {
      setCategories((prev) => prev.map((c) => c.id === editingId ? {
        ...c, name: form.name, description: form.description || undefined,
        defaultAssigneeId: form.defaultAssigneeId || undefined
      } : c));
      toast.success("Category updated.");
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: form.name, description: form.description || undefined,
        defaultAssigneeId: form.defaultAssigneeId || undefined,
        ticketCount: 0,
      };
      setCategories((prev) => [newCat, ...prev]);
      toast.success("Category created successfully.");
    }
    setIsFormOpen(false);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ticket Categories</h1>
          <p className="mt-1 text-[14px] text-slate-500">Organize and route support tickets by functional areas.</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />Add Category
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search categories..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">No ticket categories found.</div>
        ) : filtered.map((cat) => (
          <Card key={cat.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Tag className="h-5 w-5 text-indigo-600" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-slate-200">
                    <DropdownMenuItem onClick={() => openEdit(cat)}><Edit2 className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteCategory(cat.id)} className="text-rose-600"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-[15px] font-bold text-slate-900 pt-2">{cat.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-[12.5px] text-slate-500 leading-relaxed min-h-[50px]">{cat.description || "No description provided."}</p>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[12px] font-medium text-slate-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Tickets: <span className="font-extrabold text-indigo-600">{cat.ticketCount}</span>
                </span>
                {cat.defaultAssigneeId && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Users className="h-3 w-3" /> Auto-routed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{editingId ? "Edit Category" : "Add Ticket Category"}</DialogTitle>
            <DialogDescription>Define a functional group for customer queries routing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Category Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sales Inquiries" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Specify issues mapped to this category..." className="min-h-[60px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Default SLA Route Target / Agent</Label>
              <Input value={form.defaultAssigneeId} onChange={(e) => setForm({ ...form, defaultAssigneeId: e.target.value })} placeholder="Agent ID or Queue Name" />
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

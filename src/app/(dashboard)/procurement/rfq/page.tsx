"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Layers, Plus, Search, Send, Clock, CheckCircle2, FileText,
  Trash2, MoreVertical, Calendar, Users, Eye, XCircle
} from "lucide-react";
import { RFQ, RFQItem } from "@/types/procurement";
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

const mockVendors = [
  { id: "v-1", name: "Global Tech Solutions" },
  { id: "v-2", name: "Apex Supply Corp" },
  { id: "v-3", name: "Logistics Direct Inc" },
  { id: "v-4", name: "CloudScale Hosting" },
];

const mockRFQs: RFQ[] = [
  {
    id: "rfq-1", rfqNumber: "RFQ-2026-001", title: "Enterprise Database Server Upgrades",
    status: "sent", vendorIds: ["v-1", "v-2"],
    items: [
      { id: "ri-1", description: "Database Server Node (128GB)", quantity: 4, unitPrice: 8500 },
      { id: "ri-2", description: "NVMe SSD 2TB", quantity: 8 },
    ],
    createdAt: "2026-06-15", dueDate: "2026-07-05",
  },
  {
    id: "rfq-2", rfqNumber: "RFQ-2026-002", title: "Office Desktop Hardware Refresh",
    status: "draft", vendorIds: ["v-2"],
    items: [
      { id: "ri-3", description: "Desktop Workstation i7", quantity: 20 },
      { id: "ri-4", description: "27\" 4K Monitor", quantity: 20 },
    ],
    createdAt: "2026-06-22", dueDate: "2026-07-12",
  },
  {
    id: "rfq-3", rfqNumber: "RFQ-2026-003", title: "Fiber Optic Line Leases",
    status: "closed", vendorIds: ["v-3"],
    items: [{ id: "ri-5", description: "10Gbps Fiber Lease (12-mo)", quantity: 2, unitPrice: 4200 }],
    createdAt: "2026-06-01", dueDate: "2026-06-20",
  },
  {
    id: "rfq-4", rfqNumber: "RFQ-2026-004", title: "Cloud Infrastructure Migration",
    status: "sent", vendorIds: ["v-4", "v-1"],
    items: [
      { id: "ri-6", description: "Cloud Compute Credits (annual)", quantity: 1, unitPrice: 36000 },
      { id: "ri-7", description: "Managed Kubernetes Cluster", quantity: 3 },
    ],
    createdAt: "2026-06-25", dueDate: "2026-07-15",
  },
];

export default function RFQPage() {
  const [rfqs, setRfqs] = React.useState<RFQ[]>(mockRFQs);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [detailRfq, setDetailRfq] = React.useState<RFQ | null>(null);

  // Form state
  const [formTitle, setFormTitle] = React.useState("");
  const [formDueDate, setFormDueDate] = React.useState("");
  const [formVendorIds, setFormVendorIds] = React.useState<string[]>([]);
  const [formItems, setFormItems] = React.useState<Array<{ description: string; quantity: number }>>([
    { description: "", quantity: 1 },
  ]);

  const filtered = React.useMemo(() => {
    return rfqs.filter((r) => {
      const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rfqs, searchTerm, statusFilter]);

  const metrics = React.useMemo(() => ({
    total: rfqs.length,
    draft: rfqs.filter((r) => r.status === "draft").length,
    sent: rfqs.filter((r) => r.status === "sent").length,
    closed: rfqs.filter((r) => r.status === "closed").length,
  }), [rfqs]);

  const addItem = () => setFormItems((p) => [...p, { description: "", quantity: 1 }]);
  const removeItem = (i: number) => {
    if (formItems.length <= 1) return;
    setFormItems((p) => p.filter((_, idx) => idx !== i));
  };
  const updateItem = (i: number, field: string, val: any) => {
    setFormItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const toggleVendor = (vid: string) => {
    setFormVendorIds((p) => p.includes(vid) ? p.filter((v) => v !== vid) : [...p, vid]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDueDate || formVendorIds.length === 0) {
      toast.error("Please fill title, due date, and select at least one vendor.");
      return;
    }
    const validItems = formItems.filter((it) => it.description.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Add at least one line item.");
      return;
    }
    const newRfq: RFQ = {
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-2026-${String(rfqs.length + 1).padStart(3, "0")}`,
      title: formTitle,
      status: "draft",
      vendorIds: formVendorIds,
      items: validItems.map((it, idx) => ({
        id: `ri-${Date.now()}-${idx}`,
        description: it.description,
        quantity: it.quantity,
      })),
      createdAt: new Date().toISOString().split("T")[0],
      dueDate: formDueDate,
    };
    setRfqs((p) => [newRfq, ...p]);
    toast.success("RFQ created as draft.");
    resetForm();
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setFormTitle("");
    setFormDueDate("");
    setFormVendorIds([]);
    setFormItems([{ description: "", quantity: 1 }]);
  };

  const updateStatus = (id: string, newStatus: RFQ["status"]) => {
    setRfqs((p) => p.map((r) => {
      if (r.id === id) {
        toast.success(`${r.rfqNumber} status → ${newStatus.toUpperCase()}`);
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  const deleteRfq = (id: string) => {
    setRfqs((p) => p.filter((r) => r.id !== id));
    toast.success("RFQ deleted.");
  };

  const statusStyle = (s: RFQ["status"]) => {
    if (s === "sent") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "closed") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const statusDot = (s: RFQ["status"]) => {
    if (s === "sent") return "bg-emerald-500";
    if (s === "closed") return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Request for Quotation</h1>
          <p className="mt-1 text-[14px] text-slate-500">Create RFQs, invite vendors to bid, and compare supplier quotes.</p>
        </div>
        <Button onClick={() => { setFormDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]); setIsFormOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />Create RFQ
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total RFQs", value: metrics.total, icon: Layers, color: "indigo" },
          { label: "Drafts", value: metrics.draft, icon: FileText, color: "slate" },
          { label: "Sent (Active)", value: metrics.sent, icon: Send, color: "emerald" },
          { label: "Closed / Awarded", value: metrics.closed, icon: CheckCircle2, color: "amber" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-slate-500">{kpi.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg bg-${kpi.color}-50 flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 text-${kpi.color}-600`} />
              </div>
            </CardHeader>
            <CardContent><p className="text-2xl font-extrabold text-slate-900">{kpi.value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by title or RFQ number..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
                <th className="py-3 px-4">RFQ Number</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Vendors Invited</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 font-medium">No RFQs found.</td></tr>
              ) : filtered.map((rfq) => (
                <tr key={rfq.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{rfq.rfqNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Created: {rfq.createdAt}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">{rfq.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 font-semibold">{rfq.items.length}</span>
                    <span className="text-slate-400 text-[11px] ml-1">line items</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{rfq.vendorIds.length}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400" />{rfq.dueDate || "—"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(rfq.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(rfq.status)}`} />
                      {rfq.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem onClick={() => setDetailRfq(rfq)}>
                          <Eye className="mr-2 h-3.5 w-3.5" />View Details
                        </DropdownMenuItem>
                        {rfq.status === "draft" && (
                          <DropdownMenuItem onClick={() => updateStatus(rfq.id, "sent")}>
                            <Send className="mr-2 h-3.5 w-3.5" />Send to Vendors
                          </DropdownMenuItem>
                        )}
                        {rfq.status === "sent" && (
                          <DropdownMenuItem onClick={() => updateStatus(rfq.id, "closed")}>
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />Close / Award
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteRfq(rfq.id)} className="text-rose-600">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create RFQ Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) resetForm(); else setIsFormOpen(true); }}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create Request for Quotation</DialogTitle>
            <DialogDescription>Specify requirements and invite vendors to submit competitive bids.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Title *</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Enterprise Database Upgrades" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Due Date *</Label>
                <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} required />
              </div>
            </div>

            {/* Vendor selection */}
            <div className="space-y-2">
              <Label className="text-[12px] font-bold text-slate-700">Invite Vendors</Label>
              <div className="flex flex-wrap gap-2">
                {mockVendors.map((v) => (
                  <button key={v.id} type="button" onClick={() => toggleVendor(v.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                      formVendorIds.includes(v.id)
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}>
                    {formVendorIds.includes(v.id) && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center">
                <Label className="text-[12px] font-bold text-slate-700">Requirement Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}
                  className="h-7 border-slate-200 hover:bg-slate-50 text-[11.5px]">
                  <Plus className="mr-1 h-3.5 w-3.5" />Add Item
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-end bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Description</Label>
                      <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Item description" className="h-8 text-[12px] bg-white border-slate-200" />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Qty</Label>
                      <Input type="number" min={1} value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="h-8 text-[12px] bg-white border-slate-200" />
                    </div>
                    {formItems.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 self-end mb-0.5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={resetForm} className="border-slate-200 hover:bg-slate-50">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Create RFQ Draft</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailRfq} onOpenChange={(o) => { if (!o) setDetailRfq(null); }}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{detailRfq?.rfqNumber}</DialogTitle>
            <DialogDescription>{detailRfq?.title}</DialogDescription>
          </DialogHeader>
          {detailRfq && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-slate-400 font-semibold text-[11px] block">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(detailRfq.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot(detailRfq.status)}`} />{detailRfq.status.toUpperCase()}
                  </span>
                </div>
                <div><span className="text-slate-400 font-semibold text-[11px] block">Due Date</span>
                  <span className="text-slate-800 font-semibold">{detailRfq.dueDate || "—"}</span>
                </div>
                <div className="col-span-2"><span className="text-slate-400 font-semibold text-[11px] block">Vendors Invited</span>
                  <span className="text-slate-700">{detailRfq.vendorIds.map((vid) => mockVendors.find((v) => v.id === vid)?.name || vid).join(", ")}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <Label className="text-[12px] font-bold text-slate-700">Line Items</Label>
                {detailRfq.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[12.5px]">
                    <span className="font-medium text-slate-700">{item.description}</span>
                    <span className="text-slate-500 font-bold">×{item.quantity}{item.unitPrice ? ` — $${item.unitPrice.toLocaleString()}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

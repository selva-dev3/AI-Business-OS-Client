"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText, Plus, Search, Truck, DollarSign, Calendar,
  Building, User, Trash2, MoreVertical, Send, CheckCircle2, XCircle, Eye
} from "lucide-react";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/procurement";
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

const vendors = [
  { id: "v-1", name: "Global Tech Solutions" },
  { id: "v-2", name: "Apex Supply Corp" },
  { id: "v-3", name: "Logistics Direct Inc" },
  { id: "v-4", name: "CloudScale Hosting" },
];

const mockPOs: PurchaseOrder[] = [
  {
    id: "po-1", poNumber: "PO-2026-001", vendorId: "v-1", vendorName: "Global Tech Solutions",
    status: "received", subtotal: 48500, taxAmount: 3880, totalAmount: 52380,
    createdAt: "2026-06-12", expectedDelivery: "2026-06-22",
    items: [
      { id: "pi-1", description: "Database Server Node (128GB)", quantity: 4, unitPrice: 8500, taxPercent: 8, total: 36720 },
      { id: "pi-2", description: "NVMe SSD 2TB", quantity: 8, unitPrice: 1500, taxPercent: 8, total: 12960 },
    ],
  },
  {
    id: "po-2", poNumber: "PO-2026-002", vendorId: "v-2", vendorName: "Apex Supply Corp",
    status: "sent", subtotal: 12400, taxAmount: 992, totalAmount: 13392,
    createdAt: "2026-06-18", expectedDelivery: "2026-07-02",
    items: [
      { id: "pi-3", description: "Desktop Workstation i7", quantity: 10, unitPrice: 1240, taxPercent: 8, total: 13392 },
    ],
  },
  {
    id: "po-3", poNumber: "PO-2026-003", vendorId: "v-3", vendorName: "Logistics Direct Inc",
    status: "draft", subtotal: 3800, taxAmount: 304, totalAmount: 4104,
    createdAt: "2026-06-25", expectedDelivery: "2026-07-10",
    items: [
      { id: "pi-4", description: "Packaging Materials (Bulk)", quantity: 200, unitPrice: 19, taxPercent: 8, total: 4104 },
    ],
  },
  {
    id: "po-4", poNumber: "PO-2026-004", vendorId: "v-1", vendorName: "Global Tech Solutions",
    status: "cancelled", subtotal: 9200, taxAmount: 736, totalAmount: 9936,
    createdAt: "2026-06-05",
    items: [
      { id: "pi-5", description: "Enterprise Switch 48-Port", quantity: 4, unitPrice: 2300, taxPercent: 8, total: 9936 },
    ],
  },
];

export default function ProcurementPurchaseOrdersPage() {
  const [pos, setPos] = React.useState<PurchaseOrder[]>(mockPOs);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [detailPo, setDetailPo] = React.useState<PurchaseOrder | null>(null);

  const [formVendor, setFormVendor] = React.useState("");
  const [formDelivery, setFormDelivery] = React.useState("");
  const [formItems, setFormItems] = React.useState<Array<{ description: string; quantity: number; unitPrice: number }>>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const filtered = React.useMemo(() => {
    return pos.filter((po) => {
      const ms = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      const mf = statusFilter === "all" ? true : po.status === statusFilter;
      return ms && mf;
    });
  }, [pos, searchTerm, statusFilter]);

  const metrics = React.useMemo(() => {
    const pending = pos.filter((p) => p.status === "sent" || p.status === "partially_received")
      .reduce((s, p) => s + p.totalAmount, 0);
    const fulfilled = pos.filter((p) => p.status === "received")
      .reduce((s, p) => s + p.totalAmount, 0);
    return { total: pos.length, pending, fulfilled };
  }, [pos]);

  const addItem = () => setFormItems((p) => [...p, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => { if (formItems.length > 1) setFormItems((p) => p.filter((_, idx) => idx !== i)); };
  const updateItem = (i: number, f: string, v: any) => setFormItems((p) => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendor) { toast.error("Select a vendor."); return; }
    const valid = formItems.filter((it) => it.description.trim() && it.quantity > 0);
    if (valid.length === 0) { toast.error("Add at least one item."); return; }
    const vendorObj = vendors.find((v) => v.id === formVendor);
    let subtotal = 0;
    const items: PurchaseOrderItem[] = valid.map((it, idx) => {
      const lineTotal = it.quantity * it.unitPrice;
      subtotal += lineTotal;
      return { id: `pi-${Date.now()}-${idx}`, description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, taxPercent: 8, total: lineTotal * 1.08 };
    });
    const tax = subtotal * 0.08;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`, poNumber: `PO-2026-${String(pos.length + 1).padStart(3, "0")}`,
      vendorId: formVendor, vendorName: vendorObj?.name || "Unknown",
      status: "draft", subtotal, taxAmount: tax, totalAmount: subtotal + tax,
      createdAt: new Date().toISOString().split("T")[0],
      expectedDelivery: formDelivery || undefined, items,
    };
    setPos((p) => [newPO, ...p]);
    toast.success("Purchase Order created.");
    resetForm();
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setFormVendor(""); setFormDelivery("");
    setFormItems([{ description: "", quantity: 1, unitPrice: 0 }]);
  };

  const updateStatus = (id: string, ns: PurchaseOrder["status"]) => {
    setPos((p) => p.map((po) => {
      if (po.id === id) { toast.success(`${po.poNumber} → ${ns.toUpperCase()}`); return { ...po, status: ns }; }
      return po;
    }));
  };

  const sStyle = (s: PurchaseOrder["status"]) => {
    if (s === "received") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "sent" || s === "partially_received") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };
  const sDot = (s: PurchaseOrder["status"]) => {
    if (s === "received") return "bg-emerald-500";
    if (s === "sent" || s === "partially_received") return "bg-amber-500";
    if (s === "cancelled") return "bg-rose-500";
    return "bg-slate-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Purchase Orders</h1>
          <p className="mt-1 text-[14px] text-slate-500">Create, approve, and track purchase orders across vendors.</p>
        </div>
        <Button onClick={() => { setFormDelivery(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]); setIsFormOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />New Purchase Order
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Pipeline</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center"><Truck className="h-4 w-4 text-amber-600" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-extrabold text-slate-900">${metrics.pending.toLocaleString()}</p>
            <p className="mt-1 text-[12px] text-slate-400">Pending delivery / receipt</p></CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Fulfilled Spend</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center"><DollarSign className="h-4 w-4 text-emerald-600" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-extrabold text-slate-900">${metrics.fulfilled.toLocaleString()}</p>
            <p className="mt-1 text-[12px] text-slate-400">Completed orders</p></CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total POs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center"><FileText className="h-4 w-4 text-indigo-600" /></div>
          </CardHeader>
          <CardContent><p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-[12px] text-slate-400">All statuses</p></CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search PO number or vendor..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">ETA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 font-medium">No purchase orders found.</td></tr>
              ) : filtered.map((po) => (
                <tr key={po.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{po.poNumber}</div>
                    <div className="text-[11px] text-slate-400">{po.createdAt}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{po.vendorName}</td>
                  <td className="py-3.5 px-4">
                    {po.items.map((it) => (
                      <div key={it.id} className="text-[12px] text-slate-600">{it.description} ×{it.quantity}</div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">${po.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-[12px]">{po.expectedDelivery || "—"}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sStyle(po.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sDot(po.status)}`} />{po.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem onClick={() => setDetailPo(po)}><Eye className="mr-2 h-3.5 w-3.5" />View Details</DropdownMenuItem>
                        {po.status === "draft" && <DropdownMenuItem onClick={() => updateStatus(po.id, "sent")}><Send className="mr-2 h-3.5 w-3.5" />Submit to Vendor</DropdownMenuItem>}
                        {po.status === "sent" && <DropdownMenuItem onClick={() => updateStatus(po.id, "received")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Mark Received</DropdownMenuItem>}
                        {po.status !== "received" && po.status !== "cancelled" && (
                          <DropdownMenuItem onClick={() => updateStatus(po.id, "cancelled")} className="text-rose-600"><XCircle className="mr-2 h-3.5 w-3.5" />Cancel</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) resetForm(); else setIsFormOpen(true); }}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create Purchase Order</DialogTitle>
            <DialogDescription>Submit a purchase order to an approved vendor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Vendor *</Label>
                <Select value={formVendor} onValueChange={setFormVendor}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Expected Delivery</Label>
                <Input type="date" value={formDelivery} onChange={(e) => setFormDelivery(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center">
                <Label className="text-[12px] font-bold text-slate-700">Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}
                  className="h-7 border-slate-200 hover:bg-slate-50 text-[11.5px]"><Plus className="mr-1 h-3.5 w-3.5" />Add</Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2.5 items-end bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Description</Label>
                      <Input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Item" className="h-8 text-[12px] bg-white border-slate-200" />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Qty</Label>
                      <Input type="number" min={1} value={it.quantity}
                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="h-8 text-[12px] bg-white border-slate-200" />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Unit $</Label>
                      <Input type="number" min={0} value={it.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="h-8 text-[12px] bg-white border-slate-200" />
                    </div>
                    {formItems.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={resetForm} className="border-slate-200 hover:bg-slate-50">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Create PO</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailPo} onOpenChange={(o) => { if (!o) setDetailPo(null); }}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{detailPo?.poNumber}</DialogTitle>
            <DialogDescription>Vendor: {detailPo?.vendorName}</DialogDescription>
          </DialogHeader>
          {detailPo && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-[13px]">
                <div><span className="text-slate-400 font-semibold text-[11px] block">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sStyle(detailPo.status)}`}>
                    {detailPo.status.replace("_", " ").toUpperCase()}
                  </span></div>
                <div><span className="text-slate-400 font-semibold text-[11px] block">Total</span>
                  <span className="font-bold text-slate-900">${detailPo.totalAmount.toLocaleString()}</span></div>
                <div><span className="text-slate-400 font-semibold text-[11px] block">ETA</span>
                  <span className="text-slate-700">{detailPo.expectedDelivery || "—"}</span></div>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <Label className="text-[12px] font-bold text-slate-700">Items</Label>
                {detailPo.items.map((it) => (
                  <div key={it.id} className="flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[12.5px]">
                    <span className="font-medium text-slate-700">{it.description} ×{it.quantity}</span>
                    <span className="font-bold text-slate-600">${it.total.toLocaleString()}</span>
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

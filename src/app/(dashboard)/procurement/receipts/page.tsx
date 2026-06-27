"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  PackageCheck, Plus, Search, ClipboardCheck, Calendar, Truck,
  Eye, MoreVertical, CheckCircle2, AlertTriangle, FileText
} from "lucide-react";
import { GoodsReceipt, PurchaseOrder } from "@/types/procurement";
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

// Mock POs to reference
const referencePOs: Array<PurchaseOrder & { received?: boolean }> = [
  {
    id: "po-1", poNumber: "PO-2026-001", vendorId: "v-1", vendorName: "Global Tech Solutions",
    status: "received", subtotal: 48500, taxAmount: 3880, totalAmount: 52380,
    createdAt: "2026-06-12", expectedDelivery: "2026-06-22",
    items: [
      { id: "pi-1", description: "Database Server Node (128GB)", quantity: 4, unitPrice: 8500, taxPercent: 8, total: 36720 },
      { id: "pi-2", description: "NVMe SSD 2TB", quantity: 8, unitPrice: 1500, taxPercent: 8, total: 12960 },
    ],
    received: true,
  },
  {
    id: "po-2", poNumber: "PO-2026-002", vendorId: "v-2", vendorName: "Apex Supply Corp",
    status: "sent", subtotal: 12400, taxAmount: 992, totalAmount: 13392,
    createdAt: "2026-06-18", expectedDelivery: "2026-07-02",
    items: [
      { id: "pi-3", description: "Desktop Workstation i7", quantity: 10, unitPrice: 1240, taxPercent: 8, total: 13392 },
    ],
    received: false,
  },
];

interface LocalReceipt extends GoodsReceipt {
  poNumber: string;
  vendorName: string;
  status: "complete" | "partial" | "inspection";
}

const mockReceipts: LocalReceipt[] = [
  {
    id: "gr-1", poId: "po-1", poNumber: "PO-2026-001", vendorName: "Global Tech Solutions",
    receivedAt: "2026-06-22", status: "complete",
    items: [
      { poItemId: "pi-1", quantityReceived: 4, notes: "All units passed QA." },
      { poItemId: "pi-2", quantityReceived: 8, notes: "Serial numbers recorded." },
    ],
  },
  {
    id: "gr-2", poId: "po-2", poNumber: "PO-2026-002", vendorName: "Apex Supply Corp",
    receivedAt: "2026-07-01", status: "partial",
    items: [
      { poItemId: "pi-3", quantityReceived: 6, notes: "4 units back-ordered, expected next week." },
    ],
  },
];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = React.useState<LocalReceipt[]>(mockReceipts);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [detailReceipt, setDetailReceipt] = React.useState<LocalReceipt | null>(null);

  // Form state
  const [formPoId, setFormPoId] = React.useState("");
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formItemEntries, setFormItemEntries] = React.useState<Array<{ poItemId: string; qtyReceived: number; notes: string }>>([]);

  const filtered = React.useMemo(() => {
    return receipts.filter((r) => {
      const ms = r.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      const mf = statusFilter === "all" ? true : r.status === statusFilter;
      return ms && mf;
    });
  }, [receipts, searchTerm, statusFilter]);

  const metrics = React.useMemo(() => ({
    total: receipts.length,
    complete: receipts.filter((r) => r.status === "complete").length,
    partial: receipts.filter((r) => r.status === "partial").length,
    inspection: receipts.filter((r) => r.status === "inspection").length,
  }), [receipts]);

  // When PO selected, populate items
  React.useEffect(() => {
    if (formPoId) {
      const po = referencePOs.find((p) => p.id === formPoId);
      if (po) {
        setFormItemEntries(po.items.map((it) => ({
          poItemId: it.id, qtyReceived: it.quantity, notes: "",
        })));
      }
    } else {
      setFormItemEntries([]);
    }
  }, [formPoId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPoId) { toast.error("Select a purchase order."); return; }
    const po = referencePOs.find((p) => p.id === formPoId);
    if (!po) return;

    // Check if all quantities match
    const allFull = formItemEntries.every((entry) => {
      const poItem = po.items.find((it) => it.id === entry.poItemId);
      return poItem && entry.qtyReceived === poItem.quantity;
    });

    const newReceipt: LocalReceipt = {
      id: `gr-${Date.now()}`,
      poId: formPoId,
      poNumber: po.poNumber,
      vendorName: po.vendorName,
      receivedAt: formDate,
      status: allFull ? "complete" : "partial",
      items: formItemEntries.map((entry) => ({
        poItemId: entry.poItemId,
        quantityReceived: entry.qtyReceived,
        notes: entry.notes || undefined,
      })),
    };

    setReceipts((p) => [newReceipt, ...p]);
    toast.success(`Goods receipt recorded (${allFull ? "Complete" : "Partial"}).`);
    resetForm();
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setFormPoId("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormItemEntries([]);
  };

  const updateReceiptStatus = (id: string, ns: LocalReceipt["status"]) => {
    setReceipts((p) => p.map((r) => {
      if (r.id === id) { toast.success(`Receipt updated → ${ns.toUpperCase()}`); return { ...r, status: ns }; }
      return r;
    }));
  };

  const sStyle = (s: LocalReceipt["status"]) => {
    if (s === "complete") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "partial") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  };
  const sDot = (s: LocalReceipt["status"]) => {
    if (s === "complete") return "bg-emerald-500";
    if (s === "partial") return "bg-amber-500";
    return "bg-indigo-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Goods Receipts</h1>
          <p className="mt-1 text-[14px] text-slate-500">Record incoming deliveries, verify quantities, and inspect received goods.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />Record Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Receipts", value: metrics.total, icon: ClipboardCheck, bg: "indigo" },
          { label: "Complete", value: metrics.complete, icon: CheckCircle2, bg: "emerald" },
          { label: "Partial", value: metrics.partial, icon: AlertTriangle, bg: "amber" },
          { label: "Under Inspection", value: metrics.inspection, icon: FileText, bg: "slate" },
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
          <Input placeholder="Search by PO number or vendor..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Items Received</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 font-medium">No receipts found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono text-[12px]">{r.id.toUpperCase()}</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-600">{r.poNumber}</td>
                  <td className="py-3.5 px-4 text-slate-700">{r.vendorName}</td>
                  <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />{r.receivedAt}
                  </td>
                  <td className="py-3.5 px-4">
                    {r.items.map((it, idx) => {
                      const poRef = referencePOs.find((p) => p.id === r.poId);
                      const poItem = poRef?.items.find((pi) => pi.id === it.poItemId);
                      return (
                        <div key={idx} className="text-[12px] text-slate-600">
                          {poItem?.description || it.poItemId}: <span className="font-bold">{it.quantityReceived}</span>
                          {poItem && it.quantityReceived < poItem.quantity && (
                            <span className="text-amber-600 ml-1">/{poItem.quantity}</span>
                          )}
                        </div>
                      );
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sStyle(r.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sDot(r.status)}`} />{r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem onClick={() => setDetailReceipt(r)}><Eye className="mr-2 h-3.5 w-3.5" />View Details</DropdownMenuItem>
                        {r.status === "partial" && <DropdownMenuItem onClick={() => updateReceiptStatus(r.id, "complete")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Mark Complete</DropdownMenuItem>}
                        {r.status !== "inspection" && <DropdownMenuItem onClick={() => updateReceiptStatus(r.id, "inspection")}><FileText className="mr-2 h-3.5 w-3.5" />Send to Inspection</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Receipt Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) resetForm(); else setIsFormOpen(true); }}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Record Goods Receipt</DialogTitle>
            <DialogDescription>Log incoming goods against a purchase order.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Purchase Order *</Label>
                <Select value={formPoId} onValueChange={setFormPoId}>
                  <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select PO" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {referencePOs.map((po) => (
                      <SelectItem key={po.id} value={po.id}>{po.poNumber} — {po.vendorName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Received Date</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
            </div>

            {formItemEntries.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <Label className="text-[12px] font-bold text-slate-700">Verify Items Received</Label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formItemEntries.map((entry, idx) => {
                    const po = referencePOs.find((p) => p.id === formPoId);
                    const poItem = po?.items.find((it) => it.id === entry.poItemId);
                    return (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[12.5px] font-semibold text-slate-700">{poItem?.description || entry.poItemId}</span>
                          <span className="text-[11px] text-slate-400">Ordered: <span className="font-bold text-slate-600">{poItem?.quantity}</span></span>
                        </div>
                        <div className="flex gap-3 items-end">
                          <div className="w-28 space-y-1">
                            <Label className="text-[11px] text-slate-500 font-semibold">Qty Received</Label>
                            <Input type="number" min={0} max={poItem?.quantity || 999}
                              value={entry.qtyReceived}
                              onChange={(e) => setFormItemEntries((p) => p.map((en, i) =>
                                i === idx ? { ...en, qtyReceived: parseInt(e.target.value) || 0 } : en
                              ))}
                              className="h-8 text-[12px] bg-white border-slate-200" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-[11px] text-slate-500 font-semibold">Notes</Label>
                            <Input value={entry.notes}
                              onChange={(e) => setFormItemEntries((p) => p.map((en, i) =>
                                i === idx ? { ...en, notes: e.target.value } : en
                              ))}
                              placeholder="QA notes, serial numbers..."
                              className="h-8 text-[12px] bg-white border-slate-200" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button type="button" variant="outline" onClick={resetForm} className="border-slate-200 hover:bg-slate-50">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">Record Receipt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailReceipt} onOpenChange={(o) => { if (!o) setDetailReceipt(null); }}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Receipt: {detailReceipt?.id.toUpperCase()}</DialogTitle>
            <DialogDescription>PO: {detailReceipt?.poNumber} — {detailReceipt?.vendorName}</DialogDescription>
          </DialogHeader>
          {detailReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-slate-400 font-semibold text-[11px] block">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sStyle(detailReceipt.status)}`}>
                    {detailReceipt.status.toUpperCase()}
                  </span></div>
                <div><span className="text-slate-400 font-semibold text-[11px] block">Received</span>
                  <span className="text-slate-700 font-semibold">{detailReceipt.receivedAt}</span></div>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <Label className="text-[12px] font-bold text-slate-700">Received Items</Label>
                {detailReceipt.items.map((it, idx) => {
                  const po = referencePOs.find((p) => p.id === detailReceipt.poId);
                  const poItem = po?.items.find((pi) => pi.id === it.poItemId);
                  return (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[12.5px] space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">{poItem?.description || it.poItemId}</span>
                        <span className="font-bold text-slate-600">{it.quantityReceived}{poItem && `/${poItem.quantity}`}</span>
                      </div>
                      {it.notes && <p className="text-[11px] text-slate-400 italic">{it.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

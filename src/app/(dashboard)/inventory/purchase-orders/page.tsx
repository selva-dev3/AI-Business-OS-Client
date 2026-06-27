"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Truck,
  DollarSign,
  Calendar,
  AlertCircle,
  Building,
  User,
  Trash2,
  CheckCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { useProductsList, useWarehousesList } from "@/hooks/queries/inventory";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/procurement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Extend PurchaseOrder locally to include warehouse destination field
export interface InventoryPurchaseOrder extends PurchaseOrder {
  warehouseId: string;
  warehouseName: string;
}

const mockPurchaseOrders: InventoryPurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2026-001",
    vendorId: "sup-1",
    vendorName: "Apex Semiconductor Group",
    warehouseId: "wh-1",
    warehouseName: "North America Hub",
    status: "received",
    subtotal: 12500,
    taxAmount: 1000,
    totalAmount: 13500,
    createdAt: "2026-06-10",
    expectedDelivery: "2026-06-15",
    items: [
      { id: "poi-1", productId: "prod-1", description: "Enterprise Server CPU 64-Core", quantity: 5, unitPrice: 2500, taxPercent: 8, total: 13500 }
    ]
  },
  {
    id: "po-2",
    poNumber: "PO-2026-002",
    vendorId: "sup-3",
    vendorName: "CoreTech Manufacturing",
    warehouseId: "wh-2",
    warehouseName: "EU Logistics Depot",
    status: "sent",
    subtotal: 4500,
    taxAmount: 360,
    totalAmount: 4860,
    createdAt: "2026-06-25",
    expectedDelivery: "2026-07-02",
    items: [
      { id: "poi-2", productId: "prod-3", description: "Mechanical Keyboards (Tactile)", quantity: 50, unitPrice: 90, taxPercent: 8, total: 4860 }
    ]
  },
  {
    id: "po-3",
    poNumber: "PO-2026-003",
    vendorId: "sup-2",
    vendorName: "Summit Optics Ltd.",
    warehouseId: "wh-1",
    warehouseName: "North America Hub",
    status: "draft",
    subtotal: 1800,
    taxAmount: 144,
    totalAmount: 1944,
    createdAt: "2026-06-27",
    expectedDelivery: "2026-07-05",
    items: [
      { id: "poi-3", productId: "prod-2", description: "Curved Display Panels 34\"", quantity: 6, unitPrice: 300, taxPercent: 8, total: 1944 }
    ]
  }
];

export default function PurchaseOrdersPage() {
  const { data: serverProducts } = useProductsList();
  const { data: serverWarehouses } = useWarehousesList();

  const [purchaseOrders, setPurchaseOrders] = React.useState<InventoryPurchaseOrder[]>(mockPurchaseOrders);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState("");
  const [selectedWarehouse, setSelectedWarehouse] = React.useState("");
  const [expectedDate, setExpectedDate] = React.useState("");

  // Items lines state
  const [items, setItems] = React.useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([
    { productId: "", quantity: 1, unitPrice: 0 }
  ]);

  const suppliers = [
    { id: "sup-1", name: "Apex Semiconductor Group" },
    { id: "sup-2", name: "Summit Optics Ltd." },
    { id: "sup-3", name: "CoreTech Manufacturing" }
  ];

  const filteredOrders = React.useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    const totalCount = purchaseOrders.length;
    const pendingValue = purchaseOrders
      .filter(po => po.status === "sent")
      .reduce((sum, po) => sum + po.totalAmount, 0);
    const totalSpent = purchaseOrders
      .filter(po => po.status === "received")
      .reduce((sum, po) => sum + po.totalAmount, 0);
    return { totalCount, pendingValue, totalSpent };
  }, [purchaseOrders]);

  const addLineItem = () => {
    setItems(prev => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          // If productId changed, try auto-filling price from products lookup
          if (field === "productId" && serverProducts && Array.isArray(serverProducts)) {
            const prod = serverProducts.find(p => p.id === value);
            if (prod) {
              updated.unitPrice = prod.costPrice || prod.unitPrice || 0;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedWarehouse || !expectedDate) {
      toast.error("Please fill in all general details.");
      return;
    }

    const validItems = items.filter(item => item.productId !== "" && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid product line item.");
      return;
    }

    const supplierObj = suppliers.find(s => s.id === selectedSupplier);
    const warehouseObj = (serverWarehouses || []).find((w: any) => w.id === selectedWarehouse) || { name: "Default Warehouse" };

    let subtotal = 0;
    const poItems: PurchaseOrderItem[] = validItems.map((item, index) => {
      const prodName = (serverProducts || []).find((p: any) => p.id === item.productId)?.name || "Inventory Product";
      const totalCost = item.quantity * item.unitPrice;
      subtotal += totalCost;
      return {
        id: `poi-${Date.now()}-${index}`,
        productId: item.productId,
        description: prodName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxPercent: 8,
        total: totalCost * 1.08
      };
    });

    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;

    const newPO: InventoryPurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-00${purchaseOrders.length + 1}`,
      vendorId: selectedSupplier,
      vendorName: supplierObj?.name || "Unknown Vendor",
      warehouseId: selectedWarehouse,
      warehouseName: warehouseObj.name,
      status: "draft",
      subtotal,
      taxAmount,
      totalAmount,
      createdAt: new Date().toISOString().split("T")[0],
      expectedDelivery: expectedDate,
      items: poItems
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    toast.success("Purchase order draft created.");
    setIsFormOpen(false);
    // Reset states
    setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    setSelectedSupplier("");
    setSelectedWarehouse("");
  };

  const updateStatus = (poId: string, newStatus: InventoryPurchaseOrder["status"]) => {
    setPurchaseOrders(prev =>
      prev.map(po => {
        if (po.id === poId) {
          toast.success(`Purchase Order ${po.poNumber} status updated to: ${newStatus.toUpperCase()}`);
          return { ...po, status: newStatus };
        }
        return po;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Purchase Orders</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Reorder warehouse stock, manage supplier procurements, and track inbound receiving schedules.
          </p>
        </div>
        <div>
          <Button
            onClick={() => {
              setExpectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
              setIsFormOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Procurement Pipeline</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Truck className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              ${metrics.pendingValue.toLocaleString()}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">Total value in transit / ordered</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Fulfilled Spent</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              ${metrics.totalSpent.toLocaleString()}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">Total received capital stock cost</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Procurement Orders Count</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalCount} Orders</p>
            <p className="mt-1 text-[12px] text-slate-400">Drafts, pending, and completed receipts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search POs by supplier name, number or warehouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">Filter Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
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

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">PO Number / Date</th>
                <th className="py-3 px-4">Supplier & Warehouse</th>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No purchase orders matched filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-bold text-slate-900">{po.poNumber}</div>
                      <div className="text-[11.5px] text-slate-450 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Created: {po.createdAt}
                      </div>
                      {po.expectedDelivery && (
                        <div className="text-[11px] text-indigo-600 font-semibold">
                          ETA: {po.expectedDelivery}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {po.vendorName}
                      </div>
                      <div className="text-[12px] text-slate-500 flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-400" />
                        {po.warehouseName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs space-y-1">
                      {po.items.map((item) => (
                        <div key={item.id} className="text-[12px] text-slate-700 flex justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="font-medium truncate">{item.description}</span>
                          <span className="font-bold text-slate-500 text-right ml-2">x{item.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">${po.totalAmount.toLocaleString()}</div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">Subtotal: ${po.subtotal.toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        po.status === "received"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : po.status === "sent"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : po.status === "cancelled"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          po.status === "received"
                            ? "bg-emerald-500"
                            : po.status === "sent"
                            ? "bg-amber-500"
                            : po.status === "cancelled"
                            ? "bg-rose-500"
                            : "bg-slate-400"
                        }`} />
                        {po.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {po.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(po.id, "sent")}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11.5px] px-2.5 h-7.5"
                          >
                            Ship / Sent
                          </Button>
                        )}
                        {po.status === "sent" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(po.id, "received")}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11.5px] px-2.5 h-7.5"
                          >
                            Receive Stock
                          </Button>
                        )}
                        {po.status !== "received" && po.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(po.id, "cancelled")}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create Purchase Order</DialogTitle>
            <DialogDescription>
              Procure stock refill items from recognized supplier networks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePO} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Select Supplier</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">Fulfillment Dest</Label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {(serverWarehouses || []).map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expectedDate" className="text-[12px] font-semibold text-slate-600">Expected Delivery</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line Items Row */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center">
                <Label className="text-[12px] font-bold text-slate-700">Procurement Items List</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="h-7 border-slate-200 hover:bg-slate-50 text-[11.5px]"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-end bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Select Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(val: string) => updateLineItem(idx, "productId", val)}
                      >
                        <SelectTrigger className="bg-white border-slate-200 h-8 text-[12px]">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          {(serverProducts || []).map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", parseInt(e.target.value) || 0)}
                        className="h-8 text-[12px] bg-white border-slate-200"
                      />
                    </div>

                    <div className="w-28 space-y-1">
                      <Label className="text-[11px] text-slate-500 font-semibold">Unit Cost Price</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="h-8 text-[12px] bg-white border-slate-200"
                      />
                    </div>

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(idx)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 self-end mb-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
                Create PO Draft
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

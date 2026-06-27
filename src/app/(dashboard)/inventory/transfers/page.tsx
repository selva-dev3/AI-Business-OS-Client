"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MoreVertical,
  Calendar,
  Layers,
  Trash2,
  ClipboardCheck,
  Search
} from "lucide-react";
import {
  useTransfersList,
  useCreateTransfer,
  useUpdateTransferStatus,
  useProductsList,
  useWarehousesList
} from "@/hooks/queries/inventory";
import { StockTransfer, Product, Warehouse } from "@/types/inventory";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select as UISelect,
  SelectContent as UISelectContent,
  SelectItem as UISelectItem,
  SelectTrigger as UISelectTrigger,
  SelectValue as UISelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Select = UISelect as any;
const SelectContent = UISelectContent as any;
const SelectItem = UISelectItem as any;
const SelectTrigger = UISelectTrigger as any;
const SelectValue = UISelectValue as any;

const localTransfers: StockTransfer[] = [
  {
    id: "trn-1",
    fromWarehouseId: "wh-1",
    fromWarehouseName: "North America Hub",
    toWarehouseId: "wh-2",
    toWarehouseName: "EMEA Distribution Center",
    status: "completed",
    items: [
      { productId: "prod-2", productName: "UltraWide 34\" Monitor", quantity: 5 }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "trn-2",
    fromWarehouseId: "wh-2",
    fromWarehouseName: "EMEA Distribution Center",
    toWarehouseId: "wh-3",
    toWarehouseName: "APAC Logistics Center",
    status: "in_transit",
    items: [
      { productId: "prod-3", productName: "Ergonomic Mechanical Keyboard", quantity: 10 }
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: "trn-3",
    fromWarehouseId: "wh-1",
    fromWarehouseName: "North America Hub",
    toWarehouseId: "wh-3",
    toWarehouseName: "APAC Logistics Center",
    status: "pending",
    items: [
      { productId: "prod-1", productName: "Enterprise Database Server", quantity: 2 },
      { productId: "prod-4", productName: "Precision Laser Mouse", quantity: 15 }
    ],
    createdAt: new Date().toISOString()
  }
];

export default function TransfersPage() {
  const { data: serverTransfers } = useTransfersList();
  const { data: serverProducts } = useProductsList();
  const { data: serverWarehouses } = useWarehousesList();
  const createTransferMutation = useCreateTransfer();
  const updateTransferMutation = useUpdateTransferStatus();

  const [sandboxTransfers, setSandboxTransfers] = React.useState<StockTransfer[]>(localTransfers);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);

  // Form states
  const [fromWarehouseId, setFromWarehouseId] = React.useState("");
  const [toWarehouseId, setToWarehouseId] = React.useState("");
  
  // Selected line items to build transfer list
  const [lineItems, setLineItems] = React.useState<Array<{ productId: string; quantity: number }>>([]);
  const [currentProductId, setCurrentProductId] = React.useState("");
  const [currentQuantity, setCurrentQuantity] = React.useState("");

  const products = React.useMemo(() => {
    return serverProducts && Array.isArray(serverProducts) ? serverProducts : [
      { id: "prod-1", name: "Enterprise Database Server" },
      { id: "prod-2", name: "UltraWide 34\" Monitor" },
      { id: "prod-3", name: "Ergonomic Mechanical Keyboard" },
      { id: "prod-4", name: "Precision Laser Mouse" }
    ];
  }, [serverProducts]);

  const warehouses = React.useMemo(() => {
    return serverWarehouses && Array.isArray(serverWarehouses) ? serverWarehouses : [
      { id: "wh-1", name: "North America Hub" },
      { id: "wh-2", name: "EMEA Distribution Center" },
      { id: "wh-3", name: "APAC Logistics Center" }
    ];
  }, [serverWarehouses]);

  const activeTransfers = React.useMemo(() => {
    let list = sandboxTransfers;
    if (serverTransfers && Array.isArray(serverTransfers) && serverTransfers.length > 0) {
      list = serverTransfers;
    }
    return list.filter((trn) => {
      const matchStatus = statusFilter === "ALL" || trn.status === statusFilter;
      return matchStatus;
    });
  }, [serverTransfers, sandboxTransfers, statusFilter]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxTransfers;
    if (serverTransfers && Array.isArray(serverTransfers) && serverTransfers.length > 0) {
      list = serverTransfers;
    }
    const total = list.length;
    const pending = list.filter(t => t.status === "pending").length;
    const transit = list.filter(t => t.status === "in_transit").length;
    const completed = list.filter(t => t.status === "completed").length;
    return { total, pending, transit, completed };
  }, [serverTransfers, sandboxTransfers]);

  const openCreateDialog = () => {
    setFromWarehouseId(warehouses[0]?.id || "");
    setToWarehouseId(warehouses[1]?.id || "");
    setLineItems([]);
    setCurrentProductId(products[0]?.id || "");
    setCurrentQuantity("");
    setIsFormOpen(true);
  };

  const addLineItem = () => {
    if (!currentProductId || !currentQuantity) {
      toast.error("Select a product and enter a quantity first.");
      return;
    }
    const qtyVal = Number(currentQuantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }

    setLineItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === currentProductId);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qtyVal;
        return next;
      }
      return [...prev, { productId: currentProductId, quantity: qtyVal }];
    });
    setCurrentQuantity("");
  };

  const removeLineItem = (prodId: string) => {
    setLineItems(prev => prev.filter(item => item.productId !== prodId));
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWarehouseId || !toWarehouseId) {
      toast.error("Source and destination warehouses are required.");
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      toast.error("Source and destination warehouses cannot be the same.");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Add at least one product item to the transfer list.");
      return;
    }

    const payload = {
      fromWarehouseId,
      toWarehouseId,
      items: lineItems
    };

    try {
      await createTransferMutation.mutateAsync(payload);
      toast.success("Transfer order created on server.");
    } catch (err) {
      const fromWhName = warehouses.find(w => w.id === fromWarehouseId)?.name || "Unknown Hub";
      const toWhName = warehouses.find(w => w.id === toWarehouseId)?.name || "Unknown Hub";
      const populatedItems = lineItems.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod?.name || "Unknown Product",
          quantity: item.quantity
        };
      });

      const newTransfer: StockTransfer = {
        id: `trn-${Date.now()}`,
        fromWarehouseId,
        fromWarehouseName: fromWhName,
        toWarehouseId,
        toWarehouseName: toWhName,
        status: "pending",
        items: populatedItems,
        createdAt: new Date().toISOString()
      };

      setSandboxTransfers(prev => [newTransfer, ...prev]);
      toast.success("Transfer order created (Sandbox Mock).");
    }
    setIsFormOpen(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateTransferMutation.mutateAsync({ id, status: newStatus });
      toast.success(`Transfer status updated to ${newStatus} on server.`);
    } catch (err) {
      setSandboxTransfers(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus as any } : t))
      );
      toast.success(`Transfer status updated to ${newStatus} (Sandbox Mock).`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Stock Transfers</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Relocate materials and stock coordinates across branch hubs, inspect transit states, and execute receipts.
          </p>
        </div>
        <div>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Transfer Order
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Transits</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-[12px] text-slate-400">Total orders triggered</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Pending Approvals</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-amber-600">{metrics.pending}</p>
            <p className="mt-1 text-[12px] text-slate-400">Awaiting release authorization</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">In Transit</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Truck className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-sky-600">{metrics.transit}</p>
            <p className="mt-1 text-[12px] text-slate-400">Dispatched, active transit route</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Completed Receipts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{metrics.completed}</p>
            <p className="mt-1 text-[12px] text-slate-400">Received at destination depot</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "pending", "in_transit", "completed", "cancelled"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className={`h-7 px-3 text-[11px] font-bold capitalize ${statusFilter === st ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-200 hover:bg-slate-50"}`}
              >
                {st.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Transfers Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Transfer Reference</th>
                <th className="py-3.5 px-4">Source Depot</th>
                <th className="py-3.5 px-4">Destination Depot</th>
                <th className="py-3.5 px-4">Items Transferred</th>
                <th className="py-3.5 px-4">Dispatched Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No stock transfers found matching filters.
                  </td>
                </tr>
              ) : (
                activeTransfers.map((trn) => (
                  <tr key={trn.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{trn.id}</td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{trn.fromWarehouseName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-450" />
                        <span>{trn.toWarehouseName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-[200px]">
                      <div className="space-y-1">
                        {trn.items.map((item, idx) => (
                          <div key={idx} className="text-xs font-semibold flex items-center justify-between">
                            <span className="truncate pr-2">{item.productName}</span>
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(trn.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize inline-flex items-center gap-1 ${
                        trn.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        trn.status === "in_transit" ? "bg-sky-50 text-sky-700 border border-sky-100" :
                        trn.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          trn.status === "completed" ? "bg-emerald-600" :
                          trn.status === "in_transit" ? "bg-sky-600 animate-pulse" :
                          trn.status === "pending" ? "bg-amber-600" :
                          "bg-rose-600"
                        }`} />
                        {trn.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200">
                          {trn.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(trn.id, "in_transit")} className="cursor-pointer">
                                <Truck className="mr-2 h-3.5 w-3.5 text-sky-600" />
                                Ship Route (Transit)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(trn.id, "cancelled")} className="text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600">
                                <XCircle className="mr-2 h-3.5 w-3.5" />
                                Cancel Transfer
                              </DropdownMenuItem>
                            </>
                          )}
                          {trn.status === "in_transit" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(trn.id, "completed")} className="cursor-pointer">
                              <ClipboardCheck className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                              Approve Receipt
                            </DropdownMenuItem>
                          )}
                          {trn.status === "completed" && (
                            <span className="text-[11px] text-slate-400 block px-3 py-1 bg-slate-50 italic">Completed Order</span>
                          )}
                          {trn.status === "cancelled" && (
                            <span className="text-[11px] text-slate-400 block px-3 py-1 bg-slate-50 italic text-rose-500 font-bold">Cancelled Order</span>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Stock Transfer Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create Stock Transfer Order</DialogTitle>
            <DialogDescription>
              Schedule bulk coordinate re-routings and product warehouse transfers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTransfer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fromWh" className="text-[12px] font-semibold text-slate-600">Origin Depot</Label>
                <Select value={fromWarehouseId} onValueChange={setFromWarehouseId}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="From Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="toWh" className="text-[12px] font-semibold text-slate-600">Destination Depot</Label>
                <Select value={toWarehouseId} onValueChange={setToWarehouseId}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="To Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line items builder panel */}
            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-3">
              <Label className="text-xs font-bold text-slate-700 block">Dispatch Line Items</Label>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">Product SKU</span>
                  <Select value={currentProductId} onValueChange={setCurrentProductId}>
                    <SelectTrigger className="border-slate-200 bg-white h-9 text-xs">
                      <SelectValue placeholder="Choose SKU" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">Qty</span>
                  <Input
                    type="number"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                    placeholder="e.g. 5"
                    className="h-9 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addLineItem}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 text-xs shadow-sm px-3.5"
                >
                  Add SKU
                </Button>
              </div>

              {/* Display current line items list */}
              {lineItems.length > 0 && (
                <div className="mt-2 bg-white rounded-md border border-slate-150 overflow-hidden text-xs max-h-36 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <tr key={index} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-900">{prod?.name || "Unknown SKU"}</td>
                            <td className="py-2 px-3 text-center font-bold text-slate-600">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(item.productId)}
                                className="h-6 w-6 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                Release Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

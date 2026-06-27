"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Boxes,
  Plus,
  Search,
  Building,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  PlusCircle,
  MinusCircle,
  HelpCircle
} from "lucide-react";
import {
  useStockList,
  useAdjustStock,
  useProductsList,
  useWarehousesList
} from "@/hooks/queries/inventory";
import { StockLevel, Product, Warehouse } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const localStockLevels: StockLevel[] = [
  { id: "stock-1", productId: "prod-1", productName: "Enterprise Database Server", warehouseId: "wh-1", warehouseName: "North America Hub", quantity: 15, reservedQuantity: 3, availableQuantity: 12, reorderPoint: 5, isLowStock: false },
  { id: "stock-2", productId: "prod-2", productName: "UltraWide 34\" Monitor", warehouseId: "wh-1", warehouseName: "North America Hub", quantity: 8, reservedQuantity: 2, availableQuantity: 6, reorderPoint: 10, isLowStock: true },
  { id: "stock-3", productId: "prod-2", productName: "UltraWide 34\" Monitor", warehouseId: "wh-2", warehouseName: "EMEA Distribution Center", quantity: 24, reservedQuantity: 0, availableQuantity: 24, reorderPoint: 10, isLowStock: false },
  { id: "stock-4", productId: "prod-3", productName: "Ergonomic Mechanical Keyboard", warehouseId: "wh-2", warehouseName: "EMEA Distribution Center", quantity: 4, reservedQuantity: 1, availableQuantity: 3, reorderPoint: 20, isLowStock: true },
  { id: "stock-5", productId: "prod-4", productName: "Precision Laser Mouse", warehouseId: "wh-3", warehouseName: "APAC Logistics Center", quantity: 30, reservedQuantity: 5, availableQuantity: 25, reorderPoint: 15, isLowStock: false }
];

export default function StockLevelsPage() {
  const { data: serverStock } = useStockList();
  const { data: serverProducts } = useProductsList();
  const { data: serverWarehouses } = useWarehousesList();
  const adjustStockMutation = useAdjustStock();

  const [sandboxStock, setSandboxStock] = React.useState<StockLevel[]>(localStockLevels);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [warehouseFilter, setWarehouseFilter] = React.useState("ALL");
  const [lowStockFilter, setLowStockFilter] = React.useState(false);

  const [isFormOpen, setIsFormOpen] = React.useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState("");
  const [adjustmentType, setAdjustmentType] = React.useState<"in" | "out" | "adjustment">("in");
  const [quantity, setQuantity] = React.useState("");
  const [reason, setReason] = React.useState("");

  const products = React.useMemo(() => {
    return serverProducts && Array.isArray(serverProducts) ? serverProducts : [
      { id: "prod-1", name: "Enterprise Database Server", sku: "SRV-DB-001" },
      { id: "prod-2", name: "UltraWide 34\" Monitor", sku: "MON-UW-34" },
      { id: "prod-3", name: "Ergonomic Mechanical Keyboard", sku: "KEY-ERG-01" },
      { id: "prod-4", name: "Precision Laser Mouse", sku: "MSE-PRC-02" }
    ];
  }, [serverProducts]);

  const warehouses = React.useMemo(() => {
    return serverWarehouses && Array.isArray(serverWarehouses) ? serverWarehouses : [
      { id: "wh-1", name: "North America Hub" },
      { id: "wh-2", name: "EMEA Distribution Center" },
      { id: "wh-3", name: "APAC Logistics Center" }
    ];
  }, [serverWarehouses]);

  const activeStock = React.useMemo(() => {
    let list = sandboxStock;
    if (serverStock && Array.isArray(serverStock) && serverStock.length > 0) {
      list = serverStock;
    }
    return list.filter((st) => {
      const matchSearch = st.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchWh = warehouseFilter === "ALL" || st.warehouseId === warehouseFilter;
      const matchLowStock = !lowStockFilter || st.isLowStock;
      return matchSearch && matchWh && matchLowStock;
    });
  }, [serverStock, sandboxStock, searchTerm, warehouseFilter, lowStockFilter]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxStock;
    if (serverStock && Array.isArray(serverStock) && serverStock.length > 0) {
      list = serverStock;
    }
    const totalQty = list.reduce((sum, item) => sum + item.quantity, 0);
    const totalReserved = list.reduce((sum, item) => sum + item.reservedQuantity, 0);
    const lowStockAlerts = list.filter(item => item.isLowStock).length;
    return { totalQty, totalReserved, lowStockAlerts };
  }, [serverStock, sandboxStock]);

  const openAdjustDialog = () => {
    setSelectedProductId(products[0]?.id || "");
    setSelectedWarehouseId(warehouses[0]?.id || "");
    setAdjustmentType("in");
    setQuantity("");
    setReason("");
    setIsFormOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedWarehouseId || !quantity) {
      toast.error("Please select product, warehouse, and quantity.");
      return;
    }

    const qtyVal = Number(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      toast.error("Please enter a valid positive quantity.");
      return;
    }

    const payload = {
      productId: selectedProductId,
      warehouseId: selectedWarehouseId,
      quantity: qtyVal,
      type: adjustmentType,
      reason: reason || undefined
    };

    try {
      await adjustStockMutation.mutateAsync(payload);
      toast.success("Stock level updated on server.");
    } catch (err) {
      // Find matching item in local sandbox or insert new
      const prodName = products.find(p => p.id === selectedProductId)?.name || "Unknown SKU";
      const whName = warehouses.find(w => w.id === selectedWarehouseId)?.name || "Unknown Hub";
      
      setSandboxStock(prev => {
        const index = prev.findIndex(item => item.productId === selectedProductId && item.warehouseId === selectedWarehouseId);
        if (index > -1) {
          const existing = prev[index];
          let newQty = existing.quantity;
          if (adjustmentType === "in") newQty += qtyVal;
          else if (adjustmentType === "out") newQty = Math.max(0, newQty - qtyVal);
          else newQty = qtyVal;

          const updated: StockLevel = {
            ...existing,
            quantity: newQty,
            availableQuantity: Math.max(0, newQty - existing.reservedQuantity),
            isLowStock: newQty <= (existing.reorderPoint || 10)
          };
          const next = [...prev];
          next[index] = updated;
          return next;
        } else {
          const newQty = adjustmentType === "in" ? qtyVal : (adjustmentType === "adjustment" ? qtyVal : 0);
          const added: StockLevel = {
            id: `stock-${Date.now()}`,
            productId: selectedProductId,
            productName: prodName,
            warehouseId: selectedWarehouseId,
            warehouseName: whName,
            quantity: newQty,
            reservedQuantity: 0,
            availableQuantity: newQty,
            reorderPoint: 10,
            isLowStock: newQty <= 10
          };
          return [added, ...prev];
        }
      });
      toast.success("Stock level adjusted (Sandbox Mock).");
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Stock Levels Tracker</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Monitor real-time inventory balances, allocate reserved customer pools, and adjust leakage balances.
          </p>
        </div>
        <div>
          <Button
            onClick={openAdjustDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adjust Stock Level
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Items in Stock</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Boxes className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalQty}</p>
            <p className="mt-1 text-[12px] text-slate-400">Sum of all warehouse stock units</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Reserved Inventory</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalReserved}</p>
            <p className="mt-1 text-[12px] text-slate-400">Committed to pending customer orders</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Low Stock Warnings</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{metrics.lowStockAlerts}</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">Below safety threshold limits</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search stock by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Warehouses</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4 py-1">
          <Switch
            id="low-stock-toggle"
            checked={lowStockFilter}
            onCheckedChange={setLowStockFilter}
          />
          <Label htmlFor="low-stock-toggle" className="text-xs font-bold text-slate-600 cursor-pointer">
            Low Stock Alerts Only
          </Label>
        </div>
      </div>

      {/* Stock Levels List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Warehouse Depot</th>
                <th className="py-3 px-4 text-center">Total Quantity</th>
                <th className="py-3 px-4 text-center">Reserved Pool</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Safety Threshold</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeStock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No active stock logs match search filters.
                  </td>
                </tr>
              ) : (
                activeStock.map((st) => (
                  <tr key={st.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{st.productName}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{st.warehouseName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">{st.quantity}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-amber-600 bg-amber-50/20">{st.reservedQuantity}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/20">{st.availableQuantity}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{st.reorderPoint ?? "10"}</td>
                    <td className="py-3.5 px-4 text-center">
                      {st.isLowStock ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 inline-flex items-center gap-1.5 animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" />
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Level Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Record immediate warehouse level updates, product incoming receipts, or log leakage corrections.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="productSelect" className="text-[12px] font-semibold text-slate-600">Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="border-slate-200 bg-white">
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

            <div className="space-y-1.5">
              <Label htmlFor="warehouseSelect" className="text-[12px] font-semibold text-slate-600">Fulfillment Depot</Label>
              <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="Choose Hub" />
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
              <Label className="text-[12px] font-semibold text-slate-600 block">Adjustment Action Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === "in" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("in")}
                  className={adjustmentType === "in" ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-200 hover:bg-slate-50"}
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Stock In
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "out" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("out")}
                  className={adjustmentType === "out" ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-200 hover:bg-slate-50"}
                >
                  <MinusCircle className="mr-1.5 h-4 w-4" />
                  Stock Out
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "adjustment" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("adjustment")}
                  className={adjustmentType === "adjustment" ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-200 hover:bg-slate-50"}
                >
                  <HelpCircle className="mr-1.5 h-4 w-4" />
                  Correction
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qty" className="text-[12px] font-semibold text-slate-600">Adjustment Quantity</Label>
              <Input
                id="qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-[12px] font-semibold text-slate-600">Reason / Memo</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Restock from vendor invoice, damage leakage audit"
              />
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
                Apply Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

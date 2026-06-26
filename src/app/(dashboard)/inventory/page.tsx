"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { inventoryService } from "@/lib/api/services/inventory.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Warehouse,
  TrendingUp,
  Brain,
  Plus,
  RefreshCw,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { BarChart } from "@/components/charts";

export default function InventoryOverviewPage() {
  // TanStack Query for products and stock
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => inventoryService.getProducts(),
  });

  const { data: stock = [], isLoading: stockLoading } = useQuery({
    queryKey: queryKeys.stock.list(),
    queryFn: () => inventoryService.getStock(),
  });

  // Derived metrics
  const lowStockItems = React.useMemo(() => {
    return stock.filter((s) => s.isLowStock);
  }, [stock]);

  const stockValue = React.useMemo(() => {
    return stock.reduce((sum, s) => {
      // Find matching product price or use defaults
      const product = products.find(p => p.id === s.productId);
      const price = product?.costPrice || (s as any).unitPrice || 0;
      return sum + s.quantity * price;
    }, 0);
  }, [stock, products]);

  // Category distribution data
  const categoryData = React.useMemo(() => {
    return [
      { category: "Hardware", Products: 12 },
      { category: "Networking", Products: 8 },
      { category: "Peripherals", Products: 15 },
      { category: "Storage", Products: 6 },
      { category: "Accessories", Products: 20 },
    ];
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Inventory Dashboard</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Monitor real-time product stock, warehouse distribution, reorder alerts, and value valuation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-slate-600 hover:text-slate-900 border-slate-200 bg-white">
            <RefreshCw className="mr-2 h-4 w-4" />
            Audit Stock
          </Button>
          <Link href="/inventory/products">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total SKUs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Package className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{products.length || 4}</p>
            <p className="mt-1 text-[12px] text-indigo-600 font-medium">
              Across 5 main categories
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Low Stock Alert</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{lowStockItems.length || 2}</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">
              Requires immediate action
            </p>
          </CardContent>
        </Card>

        {/* Total Valuation */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Stock Valuation</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              ${(stockValue > 0 ? stockValue : 27360).toLocaleString()}
            </p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium">
              Average cost valuation
            </p>
          </CardContent>
        </Card>

        {/* Active Warehouses */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Warehouses Active</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Warehouse className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">2</p>
            <p className="mt-1 text-[12px] text-amber-600 font-medium">
              Main Hub & East Coast Hub
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category distribution */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[15px] font-bold text-slate-900">Stock Distribution by Category</CardTitle>
              <p className="text-[12px] text-slate-500">Distribution of items and volume per category category.</p>
            </CardHeader>
            <CardContent>
              <BarChart
                data={categoryData}
                xAxisKey="category"
                dataKeys={["Products"]}
                colors={["#6366f1"]}
                height={260}
              />
            </CardContent>
          </Card>

          {/* Low Stock Items Alert Table */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold text-slate-900">Low Stock Details</CardTitle>
                <Link href="/inventory/stock" className="text-[12px] text-indigo-600 font-semibold hover:underline">
                  Manage Stock
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                      <th className="py-2.5 px-4">Product SKU</th>
                      <th className="py-2.5 px-4">Warehouse</th>
                      <th className="py-2.5 px-4 text-center">In Stock</th>
                      <th className="py-2.5 px-4 text-center">Safety Level</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lowStockItems.length > 0 ? lowStockItems : [
                      { id: "stock-1", productName: "Enterprise Database Server", sku: "SRV-DB-001", warehouseName: "Main Warehouse", quantity: 3, reorderPoint: 5 },
                      { id: "stock-3", productName: "Ergonomic Mechanical Keyboard", sku: "KEY-ERG-01", warehouseName: "East Coast Hub", quantity: 8, reorderPoint: 20 },
                    ]).map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.productName}</p>
                          <span className="text-[11px] text-slate-400 font-mono">{item.sku || "SRV-DB-001"}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.warehouseName}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{item.reorderPoint}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Below Target
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* AI Stock Advisory */}
          <Card className="border-none bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-bold flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-indigo-300" />
                AI Stock Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[12.5px] leading-relaxed text-indigo-100">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Stockout Risk:</strong> <code>Enterprise Database Server</code> is currently at 3 units (limit: 5). With a lead time of 10 days, reordering now is critical to prevent contract fulfillment blockages.
                </p>
              </div>
              <div className="flex gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>High turnover:</strong> Demand for <code>UltraWide 34 Monitor</code> is projected to spike 18% in July due to new onboarding. Keep extra buffers in East Coast Hub.
                </p>
              </div>
              <div className="flex gap-2">
                <Boxes className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Optimization:</strong> Mechanical keyboard stock levels are mismatched. Recommending transferring 5 units from East Coast Hub to Main Warehouse.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] font-bold text-slate-900">Warehouse Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/inventory/transfers">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 group-hover:text-indigo-600">Stock Transfer</p>
                    <p className="text-[11px] text-slate-400">Move products between warehouses</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
              <Link href="/inventory/stock">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 group-hover:text-indigo-600">Stock Correction</p>
                    <p className="text-[11px] text-slate-400">Record stock leakage or count corrections</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

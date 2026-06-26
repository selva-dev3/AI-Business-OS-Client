"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys"; 
import { StatsCard } from "@/components/charts/StatsCard";
import { LowStockAlert } from "@/components/modules/inventory/LowStockAlert";
import { inventoryService } from "@/lib/api/services/inventory.service";
import { Package, AlertTriangle, DollarSign } from "lucide-react";

export default function InventoryOverviewPage() {
  const { data: products = [] } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => inventoryService.getProducts(),
  });
  const { data: stock = [] } = useQuery({
    queryKey: queryKeys.stock.list(),
    queryFn: () => inventoryService.getStock(),
  });

  const lowStockCount = stock.filter((s) => s.isLowStock).length;
  const stockValue = stock.reduce((sum, s) => sum + s.quantity * ((s as any).unitPrice ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Inventory Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Products"
          value={products.length}
          icon={Package}
          description="Active SKUs"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          description="Below reorder point"
        />
        <StatsCard
          title="Stock Value"
          value={`$${stockValue.toLocaleString()}`}
          icon={DollarSign}
          description="Estimated value"
        />
      </div>
      <LowStockAlert stock={stock} />
    </div>
  );
}

import * as React from "react";
import { StockLevel } from "@/types/inventory";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Warehouse } from "lucide-react";

interface LowStockAlertProps {
  stock: StockLevel[];
}

export function LowStockAlert({ stock }: LowStockAlertProps) {
  const lowStockItems = stock.filter((item) => item.isLowStock);

  if (lowStockItems.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">All Stock Levels Healthy</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">No items are currently below their reorder points.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-amber-800 dark:text-amber-300">Low Stock Alerts</CardTitle>
        </div>
        <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
          The following items have fallen below their reorder thresholds and require attention.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-amber-500/10 max-h-[300px] overflow-y-auto pr-2">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium text-amber-900 dark:text-amber-200">{item.productName}</p>
                <div className="flex items-center gap-2 text-xs text-amber-700/80 dark:text-amber-400/80">
                  <Warehouse className="h-3.5 w-3.5" />
                  <span>{item.warehouseName}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {item.quantity} / {item.reorderPoint ?? 0}
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Current vs Reorder</p>
                </div>
                <Badge variant="destructive">Low Stock</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

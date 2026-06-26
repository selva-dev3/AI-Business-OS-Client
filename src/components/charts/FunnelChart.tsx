"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface FunnelChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  className?: string;
  height?: number;
}

export function FunnelChart({ data, dataKey, nameKey, className, height = 280 }: FunnelChartProps) {
  // Sort data descending by the dataKey so it visually represents a funnel
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
  }, [data, dataKey]);

  // Gradient of colors for pipeline steps (Indigo -> Violet -> Blue -> Teal)
  const colors = [
    "#4f46e5", // Indigo-600
    "#6366f1", // Indigo-500
    "#8b5cf6", // Violet-500
    "#06b6d4", // Teal-500
    "#10b981", // Emerald-500
    "#f59e0b", // Amber-500
  ];

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      {sortedData.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          No pipeline data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (dataKey === "totalValue" || dataKey === "value") {
                  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
                  return `$${val}`;
                }
                return val;
              }}
            />
            <YAxis
              type="category"
              dataKey={nameKey}
              stroke="#475569"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                // Capitalize first letter of stages
                if (typeof val === "string") {
                  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                }
                return val;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                color: "#1e293b",
              }}
              formatter={(value: any) => [
                dataKey === "totalValue" || dataKey === "value"
                  ? `$${value.toLocaleString()}`
                  : `${value} deals`,
                dataKey === "totalValue" || dataKey === "value" ? "Total Value" : "Deals Count",
              ]}
            />
            <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} barSize={16}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

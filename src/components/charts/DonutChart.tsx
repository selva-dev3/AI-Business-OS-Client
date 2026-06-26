"use client";

import * as React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DonutChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  className?: string;
  height?: number | string;
}

export function DonutChart({
  data,
  dataKey,
  nameKey,
  colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"], // Purple, Emerald, Amber, Rose, Violet, Cyan
  className,
  height = 300,
}: DonutChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
              color: "#1e293b",
            }}
            formatter={(value: any, name?: any) => [`$${value.toLocaleString()}`, name ?? ""]}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={3}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

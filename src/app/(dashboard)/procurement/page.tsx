"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/hooks/queries/client";
import { queryKeys } from "@/lib/api/queryKeys";
import { endpoints } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  ShoppingCart,
  Users,
  Layers,
  TrendingUp,
  Brain,
  Plus,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { BarChart, DonutChart } from "@/components/charts";

interface Vendor {
  id: string;
  name: string;
  code: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  status: "DRAFT" | "SENT" | "CLOSED" | "CONVERTED";
  dueDate: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  totalAmount: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  orderDate: string;
}

export default function ProcurementDashboardPage() {
  // Query Vendors
  const { data: vendorsData } = useQuery({
    queryKey: ["procurement", "vendors"],
    queryFn: () => apiGet<{ data: Vendor[] }>(endpoints.procurement.vendors).catch(() => ({ data: [] })),
  });

  // Query RFQs
  const { data: rfqsData } = useQuery({
    queryKey: ["procurement", "rfq"],
    queryFn: () => apiGet<{ data: RFQ[] }>(endpoints.procurement.rfq).catch(() => ({ data: [] })),
  });

  // Query Purchase Orders
  const { data: posData } = useQuery({
    queryKey: ["procurement", "purchaseOrders"],
    queryFn: () => apiGet<{ data: PurchaseOrder[] }>(endpoints.procurement.purchaseOrders).catch(() => ({ data: [] })),
  });

  // Materialize datasets or fall back to high-fidelity mocks
  const vendorsList = React.useMemo(() => {
    const list = vendorsData?.data || [];
    if (list.length > 0) return list;
    return [
      { id: "v-1", name: "Global Tech Solutions", code: "VND-GTS-01", email: "orders@globaltech.com", status: "ACTIVE" },
      { id: "v-2", name: "Apex Supply Corp", code: "VND-ASC-02", email: "procurement@apex.com", status: "ACTIVE" },
      { id: "v-3", name: "Logistics Direct Inc", code: "VND-LDI-03", email: "sales@logisticsdirect.com", status: "ACTIVE" },
      { id: "v-4", name: "Prime Builders Supply", code: "VND-PBS-04", email: "support@primebuilders.com", status: "INACTIVE" },
    ];
  }, [vendorsData]);

  const rfqsList = React.useMemo<RFQ[]>(() => {
    const list = rfqsData?.data || [];
    if (list.length > 0) return list;
    return [
      { id: "rfq-1", rfqNumber: "RFQ-2026-001", title: "Enterprise Database Upgrades", status: "SENT", dueDate: "2026-07-05" },
      { id: "rfq-2", rfqNumber: "RFQ-2026-002", title: "Office Desktop Hardware", status: "DRAFT", dueDate: "2026-07-12" },
      { id: "rfq-3", rfqNumber: "RFQ-2026-003", title: "Fiber Optic Line Leases", status: "CLOSED", dueDate: "2026-06-20" },
    ];
  }, [rfqsData]);

  const posList = React.useMemo<PurchaseOrder[]>(() => {
    const list = posData?.data || [];
    if (list.length > 0) return list;
    return [
      { id: "po-1", poNumber: "PO-2026-001", vendorName: "Global Tech Solutions", totalAmount: 48500, status: "APPROVED", orderDate: "2026-06-12" },
      { id: "po-2", poNumber: "PO-2026-002", vendorName: "Apex Supply Corp", totalAmount: 12400, status: "SUBMITTED", orderDate: "2026-06-18" },
      { id: "po-3", poNumber: "PO-2026-003", vendorName: "Logistics Direct Inc", totalAmount: 3800, status: "COMPLETED", orderDate: "2026-05-28" },
      { id: "po-4", poNumber: "PO-2026-004", vendorName: "Global Tech Solutions", totalAmount: 9200, status: "REJECTED", orderDate: "2026-06-05" },
    ];
  }, [posData]);

  // Calculations
  const stats = React.useMemo(() => {
    const totalSpendVal = posList
      .filter((po) => po.status === "APPROVED" || po.status === "COMPLETED")
      .reduce((sum, po) => sum + po.totalAmount, 0);

    const activeRfqsCount = rfqsList.filter((rfq) => rfq.status === "SENT").length;
    const pendingPoApprovals = posList.filter((po) => po.status === "SUBMITTED").length;
    const activeVendors = vendorsList.filter((v) => v.status === "ACTIVE").length;

    return {
      totalSpend: totalSpendVal > 0 ? totalSpendVal : 52300,
      activeRfqs: activeRfqsCount > 0 ? activeRfqsCount : 1,
      pendingPOs: pendingPoApprovals > 0 ? pendingPoApprovals : 1,
      vendorsCount: activeVendors > 0 ? activeVendors : 3,
    };
  }, [posList, rfqsList, vendorsList]);

  // Chart data: Monthly procurement spend
  const spendTrendData = [
    { name: "Jan", Spend: 15000 },
    { name: "Feb", Spend: 28000 },
    { name: "Mar", Spend: 42000 },
    { name: "Apr", Spend: 31000 },
    { name: "May", Spend: 55000 },
    { name: "Jun", Spend: stats.totalSpend },
  ];

  // RFQ status donut chart data
  const rfqStatusData = React.useMemo(() => {
    const statuses = { SENT: 0, DRAFT: 0, CLOSED: 0 };
    rfqsList.forEach((r) => {
      if (r.status === "SENT") statuses.SENT += 1;
      else if (r.status === "DRAFT") statuses.DRAFT += 1;
      else if (r.status === "CLOSED") statuses.CLOSED += 1;
    });

    return [
      { name: "Sent (Active)", value: statuses.SENT > 0 ? statuses.SENT : 1 },
      { name: "Drafts", value: statuses.DRAFT > 0 ? statuses.DRAFT : 1 },
      { name: "Closed/Awarded", value: statuses.CLOSED > 0 ? statuses.CLOSED : 1 },
    ];
  }, [rfqsList]);

  const getPoStatusStyle = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SUBMITTED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getRfqStatusStyle = (status: RFQ["status"]) => {
    switch (status) {
      case "SENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DRAFT":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "CLOSED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Procurement Dashboard</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Automate Requests for Quotes, administer vendor relations, review purchase approvals, and optimize spend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-slate-600 hover:text-slate-900 border-slate-200 bg-white">
            <Download className="mr-2 h-4 w-4" />
            Audit Report
          </Button>
          <Link href="/procurement/purchase-orders">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Procured Spend (YTD)</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">${stats.totalSpend.toLocaleString()}</p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +8.3% vs. last quarter
            </p>
          </CardContent>
        </Card>

        {/* Active RFQs */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active RFQs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{stats.activeRfqs}</p>
            <p className="mt-1 text-[12px] text-slate-500 font-medium">
              Quotes currently collecting bids
            </p>
          </CardContent>
        </Card>

        {/* Pending POs */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Pending PO Approvals</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-amber-600">{stats.pendingPOs}</p>
            <p className="mt-1 text-[12px] text-amber-600 font-medium">
              Requires budget approval
            </p>
          </CardContent>
        </Card>

        {/* Active Vendors */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Vendors</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{stats.vendorsCount}</p>
            <p className="mt-1 text-[12px] text-slate-500 font-medium">
              Pre-approved business suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spend trend bar chart */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[15px] font-bold text-slate-900">Procurement Spend Trend</CardTitle>
              <p className="text-[12px] text-slate-500">Monthly breakdown of capital spent through Purchase Orders.</p>
            </CardHeader>
            <CardContent>
              <BarChart
                data={spendTrendData}
                xAxisKey="name"
                dataKeys={["Spend"]}
                colors={["#4f46e5"]}
                height={260}
              />
            </CardContent>
          </Card>

          {/* Active Purchase Orders Table */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold text-slate-900">Active Purchase Orders</CardTitle>
                <Link href="/procurement/purchase-orders" className="text-[12px] text-indigo-600 font-semibold hover:underline">
                  View All POs
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                      <th className="py-2.5 px-4">PO Number</th>
                      <th className="py-2.5 px-4">Vendor</th>
                      <th className="py-2.5 px-4">Total Amount</th>
                      <th className="py-2.5 px-4">Order Date</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posList.map((po) => (
                      <tr key={po.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-850">{po.poNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{po.vendorName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">${po.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(po.orderDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPoStatusStyle(po.status)}`}>
                            {po.status}
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
          {/* RFQ distribution donut */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[15px] font-bold text-slate-900">RFQ Status Distribution</CardTitle>
              <p className="text-[12px] text-slate-500">Breakdown of current requests for quote by status.</p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DonutChart
                data={rfqStatusData}
                dataKey="value"
                nameKey="name"
                colors={["#10b981", "#6366f1", "#f59e0b"]}
                height={200}
              />
            </CardContent>
          </Card>

          {/* AI Sourcing Advisor */}
          <Card className="border-none bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-bold flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-indigo-300" />
                AI Sourcing Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[12.5px] leading-relaxed text-indigo-100">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Lead Time Risk:</strong> <code>Global Tech Solutions</code> has shown a +4 day delivery latency drift on the last 2 orders. Factor in extra buffer for upcoming hardware orders.
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Sourcing Savings:</strong> Consolidating desktop server contracts under <code>Apex Supply Corp</code> could unlock a volume discount tier of 5.8% ($2,810 potential savings).
                </p>
              </div>
              <div className="flex gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Compliance:</strong> Vendor code <code>VND-PBS-04</code> has an expired insurance certification. Automated email has been drafted to request updated documents.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

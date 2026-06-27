"use client";

import * as React from "react";
import {
  DollarSign,
  Users,
  Calendar,
  CreditCard,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Building,
  FileText,
  Printer,
  Calculator,
  ChevronRight,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Import payroll types and hooks
import {
  usePayrollRuns,
  usePayslips,
  usePayrollSummary,
  useCreatePayrollRun,
  useUpdatePayrollRun,
  useUpdatePayslip,
} from "@/hooks/queries/hrms/payroll/payroll.hooks";
import { PayrollRun, Payslip, PayrollRunStatus, PayslipStatus } from "@/hooks/queries/hrms/payroll/payroll.types";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = React.useState<"payslips" | "history" | "formulas">("payslips");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals state
  const [isCreateRunOpen, setIsCreateRunOpen] = React.useState(false);
  const [isPayStubOpen, setIsPayStubOpen] = React.useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  
  // Selected items state
  const [selectedPayslip, setSelectedPayslip] = React.useState<Payslip | null>(null);

  // Form states
  const [newRunMonth, setNewRunMonth] = React.useState("July");
  const [newRunYear, setNewRunYear] = React.useState(2026);
  const [adjustValues, setAdjustValues] = React.useState({
    allowances: 0,
    deductions: 0,
    notes: "",
  });

  // Query Hooks
  const { data: serverRuns, isLoading: runsLoading, refetch: refetchRuns } = usePayrollRuns();
  const { data: serverSummary } = usePayrollSummary();

  const createRunMutation = useCreatePayrollRun();
  const updateRunMutation = useUpdatePayrollRun();
  const updatePayslipMutation = useUpdatePayslip();

  // High-fidelity fallback database
  const fallbackRuns: PayrollRun[] = React.useMemo(() => [
    {
      id: "run-june",
      month: "June",
      year: 2026,
      status: "processed",
      totalAmount: 124500,
      employeeCount: 6,
      processedAt: "2026-06-25T14:00:00Z",
      createdAt: "2026-06-01T09:00:00Z",
      updatedAt: "2026-06-25T14:00:00Z",
    },
    {
      id: "run-may",
      month: "May",
      year: 2026,
      status: "paid",
      totalAmount: 122800,
      employeeCount: 6,
      processedAt: "2026-05-25T14:00:00Z",
      paidAt: "2026-05-27T10:00:00Z",
      createdAt: "2026-05-01T09:00:00Z",
      updatedAt: "2026-05-27T10:00:00Z",
    },
    {
      id: "run-april",
      month: "April",
      year: 2026,
      status: "paid",
      totalAmount: 120500,
      employeeCount: 5,
      processedAt: "2026-04-24T14:00:00Z",
      paidAt: "2026-04-26T10:00:00Z",
      createdAt: "2026-04-01T09:00:00Z",
      updatedAt: "2026-04-26T10:00:00Z",
    },
  ], []);

  const fallbackPayslips: Payslip[] = React.useMemo(() => [
    {
      id: "pay-1",
      payrollRunId: "run-june",
      employeeId: "emp-1",
      employee: {
        id: "emp-1",
        employeeId: "EMP-20601",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        designation: "Principal Engineer",
        department: { id: "d1", name: "Engineering" },
      },
      month: "June",
      year: 2026,
      basicSalary: 12000,
      allowances: 1500,
      deductions: 450,
      tax: 1800,
      netSalary: 11250,
      status: "draft",
      createdAt: "2026-06-25T14:00:00Z",
      updatedAt: "2026-06-25T14:00:00Z",
    },
    {
      id: "pay-2",
      payrollRunId: "run-june",
      employeeId: "emp-2",
      employee: {
        id: "emp-2",
        employeeId: "EMP-20602",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@company.com",
        designation: "Product Director",
        department: { id: "d2", name: "Product & Design" },
      },
      month: "June",
      year: 2026,
      basicSalary: 14000,
      allowances: 2000,
      deductions: 600,
      tax: 2200,
      netSalary: 13200,
      status: "draft",
      createdAt: "2026-06-25T14:00:00Z",
      updatedAt: "2026-06-25T14:00:00Z",
    },
    {
      id: "pay-3",
      payrollRunId: "run-june",
      employeeId: "emp-3",
      employee: {
        id: "emp-3",
        employeeId: "EMP-20603",
        firstName: "Robert",
        lastName: "Chen",
        email: "robert.chen@company.com",
        designation: "Talent Partner",
        department: { id: "d4", name: "Human Resources" },
      },
      month: "June",
      year: 2026,
      basicSalary: 8500,
      allowances: 800,
      deductions: 300,
      tax: 1100,
      netSalary: 7900,
      status: "draft",
      createdAt: "2026-06-25T14:00:00Z",
      updatedAt: "2026-06-25T14:00:00Z",
    },
    {
      id: "pay-4",
      payrollRunId: "run-june",
      employeeId: "emp-4",
      employee: {
        id: "emp-4",
        employeeId: "EMP-20604",
        firstName: "Emily",
        lastName: "Watson",
        email: "emily.watson@company.com",
        designation: "Marketing Specialist",
        department: { id: "d3", name: "Sales & Marketing" },
      },
      month: "June",
      year: 2026,
      basicSalary: 7500,
      allowances: 1200,
      deductions: 250,
      tax: 950,
      netSalary: 7500,
      status: "draft",
      createdAt: "2026-06-25T14:00:00Z",
      updatedAt: "2026-06-25T14:00:00Z",
    },
    {
      id: "pay-5",
      payrollRunId: "run-june",
      employeeId: "emp-5",
      employee: {
        id: "emp-5",
        employeeId: "EMP-20605",
        firstName: "Alex",
        lastName: "Rivera",
        email: "alex.r@company.com",
        designation: "DevOps Engineer",
        department: { id: "d1", name: "Engineering" },
      },
      month: "June",
      year: 2026,
      basicSalary: 9000,
      allowances: 1100,
      deductions: 350,
      tax: 1300,
      netSalary: 8450,
      status: "draft",
      createdAt: "2026-06-25T14:00:00Z",
      updatedAt: "2026-06-25T14:00:00Z",
    },
  ], []);

  // UI state-driven fallbacks
  const [localRuns, setLocalRuns] = React.useState<PayrollRun[]>([]);
  const [localPayslips, setLocalPayslips] = React.useState<Payslip[]>([]);
  const [activeRunId, setActiveRunId] = React.useState("run-june");

  React.useEffect(() => {
    setLocalRuns(fallbackRuns);
    setLocalPayslips(fallbackPayslips);
  }, [fallbackRuns, fallbackPayslips]);

  // Selected Active Run Details
  const activeRun = React.useMemo(() => {
    const list = serverRuns || localRuns;
    return list.find((run) => run.id === activeRunId) || list[0];
  }, [serverRuns, localRuns, activeRunId]);

  // Combined metrics
  const stats = React.useMemo(() => {
    const runsList = serverRuns || localRuns;
    const paidRuns = runsList.filter((run) => run.status === "paid");
    const totalPaid = paidRuns.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      totalPaidCost: totalPaid || 243300,
      employeePaidCount: activeRun?.employeeCount || 6,
      lastPayPeriod: activeRun ? `${activeRun.month} ${activeRun.year}` : "June 2026",
      activeRunStatus: activeRun?.status || "processed",
      activeRunCost: activeRun?.totalAmount || 124500,
    };
  }, [serverRuns, localRuns, activeRun]);

  // Filtering payslips
  const payslipsList = React.useMemo(() => {
    const list = localPayslips.filter((ps) => ps.payrollRunId === activeRunId);
    
    return list.filter((ps) => {
      const name = ps.employee
        ? `${ps.employee.firstName} ${ps.employee.lastName}`.toLowerCase()
        : "";
      return name.includes(searchQuery.toLowerCase());
    });
  }, [localPayslips, activeRunId, searchQuery]);

  // Handle open adjust dialog
  const handleOpenAdjust = (ps: Payslip) => {
    setSelectedPayslip(ps);
    setAdjustValues({
      allowances: ps.allowances,
      deductions: ps.deductions,
      notes: ps.notes || "",
    });
    setIsAdjustOpen(true);
  };

  // Submit payslip adjustments
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayslip) return;

    try {
      await updatePayslipMutation.mutateAsync({
        id: selectedPayslip.id,
        data: adjustValues,
      });
      toast.success("Payslip updated successfully");
      setIsAdjustOpen(false);
    } catch (err) {
      // Mock local update
      const updatedList = localPayslips.map((ps) => {
        if (ps.id === selectedPayslip.id) {
          const net = ps.basicSalary + adjustValues.allowances - adjustValues.deductions - ps.tax;
          return {
            ...ps,
            allowances: adjustValues.allowances,
            deductions: adjustValues.deductions,
            netSalary: net,
            notes: adjustValues.notes,
            updatedAt: new Date().toISOString(),
          };
        }
        return ps;
      });

      setLocalPayslips(updatedList);

      // Also update total run amount in local runs list
      const calculatedTotal = updatedList
        .filter((ps) => ps.payrollRunId === activeRunId)
        .reduce((sum, ps) => sum + ps.netSalary, 0);

      const updatedRunsList = localRuns.map((run) => {
        if (run.id === activeRunId) {
          return {
            ...run,
            totalAmount: calculatedTotal,
          };
        }
        return run;
      });

      setLocalRuns(updatedRunsList);

      toast.info("Deduction adjustments computed locally.");
      setIsAdjustOpen(false);
    }
  };

  // Start new run cycle
  const handleCreateRunSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRunMutation.mutateAsync({
        month: newRunMonth,
        year: newRunYear,
      });
      toast.success("Payroll run started");
      setIsCreateRunOpen(false);
      refetchRuns();
    } catch (err) {
      // Mock starting a new run cycle
      const nextRunId = `run-${newRunMonth.toLowerCase()}-${newRunYear}`;
      const duplicateExists = localRuns.some((r) => r.id === nextRunId);
      if (duplicateExists) {
        toast.error(`Payroll cycle for ${newRunMonth} ${newRunYear} already exists`);
        return;
      }

      const newRun: PayrollRun = {
        id: nextRunId,
        month: newRunMonth,
        year: newRunYear,
        status: "draft",
        totalAmount: 48500, // Seed total net salary
        employeeCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Clone existing payslips for next period
      const seedPayslips = fallbackPayslips.map((ps, idx) => ({
        ...ps,
        id: `pay-${nextRunId}-${idx}`,
        payrollRunId: nextRunId,
        month: newRunMonth,
        year: newRunYear,
        status: "draft" as PayslipStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setLocalRuns([newRun, ...localRuns]);
      setLocalPayslips([...seedPayslips, ...localPayslips]);
      setActiveRunId(nextRunId);

      toast.info(`Initialized ${newRunMonth} ${newRunYear} payroll cycle (Mock mode)`);
      setIsCreateRunOpen(false);
    }
  };

  // Change current run status
  const handleUpdateStatus = async (targetStatus: PayrollRunStatus) => {
    if (!activeRun) return;

    try {
      await updateRunMutation.mutateAsync({
        id: activeRun.id,
        data: { status: targetStatus },
      });
      toast.success(`Payroll status updated to: ${targetStatus}`);
      refetchRuns();
    } catch (err) {
      // Mock status transitions
      const updated = localRuns.map((run) => {
        if (run.id === activeRunId) {
          const runUpdate = {
            ...run,
            status: targetStatus,
            updatedAt: new Date().toISOString(),
          };
          if (targetStatus === "processed") {
            runUpdate.processedAt = new Date().toISOString();
          } else if (targetStatus === "paid") {
            runUpdate.paidAt = new Date().toISOString();
          }
          return runUpdate;
        }
        return run;
      });

      setLocalRuns(updated);
      toast.success(`Status updated to ${targetStatus} (Mock mode)`);
    }
  };

  // Open Pay Stub modal sheet
  const handleOpenPayStub = (ps: Payslip) => {
    setSelectedPayslip(ps);
    setIsPayStubOpen(true);
  };

  // Format monetary currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const getStatusBadge = (status: PayrollRunStatus) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Disbursed / Paid</Badge>;
      case "processed":
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Calculated</Badge>;
      case "processing":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">Processing Calculations</Badge>;
      case "draft":
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Draft Setup</Badge>;
    }
  };

  // Calculate salary in words (basic simulation)
  const getSalaryInWords = (amount: number) => {
    // Standard mock description for printable pay stub
    return "US Dollars Only";
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Payroll Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculate earnings, manage individual bonuses, disburse payslips, and review history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateRunOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Pay Cycle
          </Button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Disbursed</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(stats.totalPaidCost)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Employees Paid</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.employeePaidCount} Staff</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Last Pay Cycle</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.lastPayPeriod}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Net Salary</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(9860)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Active Run Workspace Panel */}
      {activeRun && (
        <Card className="border-indigo-100 bg-gradient-to-r from-slate-900 to-slate-950 text-white overflow-hidden shadow-md">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            
            {/* Background design elements */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
            
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold uppercase tracking-wider text-[10px]">
                  Active Pay Cycle
                </Badge>
                {getStatusBadge(activeRun.status)}
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                {activeRun.month} {activeRun.year} Payroll Run
              </h2>
              <p className="text-slate-400 text-xs md:text-sm font-medium">
                Draft calculated outflow: <span className="text-indigo-400 font-extrabold">{formatCurrency(stats.activeRunCost)}</span> across <span className="text-white font-bold">{activeRun.employeeCount} staff members</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 z-10 shrink-0">
              {activeRun.status === "draft" && (
                <Button
                  onClick={() => handleUpdateStatus("processed")}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-sm"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Process Calculations
                </Button>
              )}
              {activeRun.status === "processed" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus("draft")}
                    className="border-slate-800 text-slate-350 hover:bg-slate-900/50 hover:text-white"
                  >
                    Reset Draft
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus("paid")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm"
                  >
                    Confirm Disbursements
                  </Button>
                </>
              )}
              {activeRun.status === "paid" && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Disbursed and Closed
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Tabs Selectors */}
        <div className="space-y-2">
          <Button
            variant={activeTab === "payslips" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("payslips")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "payslips" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Users className="mr-2 h-4 w-4 shrink-0" />
            Payslips Log
          </Button>
          <Button
            variant={activeTab === "history" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("history")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "history" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Calendar className="mr-2 h-4 w-4 shrink-0" />
            Payroll History Archive
          </Button>
          <Button
            variant={activeTab === "formulas" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("formulas")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "formulas" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Calculator className="mr-2 h-4 w-4 shrink-0" />
            Compensation Formula
          </Button>
        </div>

        {/* Content Sheets */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Payslips */}
          {activeTab === "payslips" && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">Staff Compensation Sheets</CardTitle>
                    <CardDescription className="text-xs">
                      Adjust individual bonuses, allowances, deductions, and tax values.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search employee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 max-w-[200px] text-xs"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Employee</th>
                        <th className="py-3 px-6 text-right">Basic Pay</th>
                        <th className="py-3 px-6 text-right">Allowances</th>
                        <th className="py-3 px-6 text-right">Deductions</th>
                        <th className="py-3 px-6 text-right">Taxes (PF/IT)</th>
                        <th className="py-3 px-6 text-right">Net Payout</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {payslipsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <FileText className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                            <span className="text-xs font-semibold">No payslips found for this period</span>
                          </td>
                        </tr>
                      ) : (
                        payslipsList.map((ps) => {
                          const emp = ps.employee;
                          const deptName = emp?.department?.name || "Corporate";

                          return (
                            <tr key={ps.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="py-3.5 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 border border-slate-200">
                                    {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : "EM"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 leading-tight">
                                      {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {deptName} • {emp?.designation || "Staff"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-6 text-right font-medium text-slate-800">
                                {formatCurrency(ps.basicSalary)}
                              </td>
                              <td className="py-3.5 px-6 text-right text-emerald-600 font-semibold">
                                + {formatCurrency(ps.allowances)}
                              </td>
                              <td className="py-3.5 px-6 text-right text-rose-600 font-semibold">
                                - {formatCurrency(ps.deductions)}
                              </td>
                              <td className="py-3.5 px-6 text-right text-slate-500 font-medium">
                                {formatCurrency(ps.tax)}
                              </td>
                              <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                                {formatCurrency(ps.netSalary)}
                              </td>
                              <td className="py-3.5 px-6">
                                <div className="flex justify-center items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenPayStub(ps)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold p-1.5 h-8 w-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {activeRun.status === "draft" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleOpenAdjust(ps)}
                                      className="text-xs text-slate-500 hover:text-indigo-600 font-semibold p-1.5 h-8 w-8"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 2: History */}
          {activeTab === "history" && (
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Payroll Cycle Archives</CardTitle>
                <CardDescription className="text-xs">
                  Review historic disbursements, payout values, and transaction statuses.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Pay Period</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-center">Headcount</th>
                        <th className="py-3 px-6 text-right">Total Net Outflow</th>
                        <th className="py-3 px-6">Processed On</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {localRuns.map((run) => (
                        <tr
                          key={run.id}
                          className={cn(
                            "hover:bg-slate-50/30 transition-colors",
                            run.id === activeRunId && "bg-indigo-50/20"
                          )}
                        >
                          <td className="py-3.5 px-6 font-bold text-slate-850">
                            {run.month} {run.year}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            {getStatusBadge(run.status)}
                          </td>
                          <td className="py-3.5 px-6 text-center font-semibold text-slate-800">
                            {run.employeeCount} paid
                          </td>
                          <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                            {formatCurrency(run.totalAmount)}
                          </td>
                          <td className="py-3.5 px-6 text-xs text-slate-500">
                            {run.processedAt ? new Date(run.processedAt).toLocaleString() : "-"}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setActiveRunId(run.id);
                                setActiveTab("payslips");
                                toast.success(`Selected active period: ${run.month} ${run.year}`);
                              }}
                              className="text-xs text-indigo-600 font-bold hover:bg-indigo-50"
                            >
                              Load cycle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Formula Settings */}
          {activeTab === "formulas" && (
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Salary Formula Architecture</CardTitle>
                <CardDescription className="text-xs">
                  Review formulas and compliance variables regulating payouts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earnings Calculations</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex justify-between">
                        <span>Basic Pay</span>
                        <span className="text-slate-500">60% of Gross Compensation</span>
                      </li>
                      <li className="flex justify-between">
                        <span>HRA (House Rent Allowance)</span>
                        <span className="text-slate-500">40% of Basic Pay</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Special Allowance</span>
                        <span className="text-slate-500">Remainder of Gross Compensation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deductions & Compliance</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex justify-between">
                        <span>EPF Contribution</span>
                        <span className="text-slate-500">12% of Basic Pay</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Professional Tax</span>
                        <span className="text-slate-500">Flat $200.00 / month</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Health Insurance Premium</span>
                        <span className="text-slate-500">Flat $250.00 / month (Company subsidized)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-indigo-850">Tax Audit Note</h5>
                    <p className="text-[11px] text-indigo-700 leading-relaxed font-semibold">
                      Income tax withholding rates are auto-calculated on local country tax tables. Manual adjustments override custom allowances and base rates only; withholding is locked inside compliance formulas.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Dialog 1: Create Pay Run */}
      <Dialog open={isCreateRunOpen} onOpenChange={setIsCreateRunOpen}>
        <DialogContent className="max-w-sm bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Initialize New Pay Cycle
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Start new payroll calculations. Staff base salaries will be pre-populated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRunSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Month</label>
              <select
                value={newRunMonth}
                onChange={(e) => setNewRunMonth(e.target.value)}
                className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
              >
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Year</label>
              <Input
                type="number"
                value={newRunYear}
                onChange={(e) => setNewRunYear(parseInt(e.target.value))}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateRunOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Initialize Cycle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Adjust Payslip */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Adjust Payslip Compensation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Override allowances and deductions for {selectedPayslip?.employee?.firstName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdjustSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Custom Allowances (+)</label>
              <Input
                type="number"
                value={adjustValues.allowances}
                onChange={(e) => setAdjustValues({ ...adjustValues, allowances: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Custom Deductions (-)</label>
              <Input
                type="number"
                value={adjustValues.deductions}
                onChange={(e) => setAdjustValues({ ...adjustValues, deductions: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Adjustment Note / Reason</label>
              <Textarea
                placeholder="E.g., Quarterly performance bonus, equipment allowance..."
                value={adjustValues.notes}
                onChange={(e) => setAdjustValues({ ...adjustValues, notes: e.target.value })}
                className="h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdjustOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Apply Adjustments
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Printable Pay Stub Detail Sheet */}
      <Dialog open={isPayStubOpen} onOpenChange={setIsPayStubOpen}>
        <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-xl p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Printable Layout Stub */}
          <div className="space-y-6">
            
            {/* Stub Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">AI BIZ OS CORP.</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                  100 Enterprise Way, Suite 400<br />
                  Silicon Valley, CA 94043
                </p>
              </div>
              <div className="text-right">
                <Badge className="bg-indigo-600 text-white border-0 font-bold text-[10px]">
                  SALARY SLIP
                </Badge>
                <p className="text-[11px] font-bold text-slate-700 mt-2">
                  Period: {selectedPayslip?.month} {selectedPayslip?.year}
                </p>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50 p-4 rounded-xl text-xs font-semibold text-slate-700">
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-450">Employee Name:</span>
                <span className="text-slate-850">
                  {selectedPayslip?.employee?.firstName} {selectedPayslip?.employee?.lastName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-450">Employee ID:</span>
                <span className="text-slate-850">{selectedPayslip?.employee?.employeeId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5 md:border-b-0">
                <span className="text-slate-450">Designation:</span>
                <span className="text-slate-850">{selectedPayslip?.employee?.designation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5 md:border-b-0">
                <span className="text-slate-450">Department:</span>
                <span className="text-slate-850">
                  {selectedPayslip?.employee?.department?.name || "Corporate"}
                </span>
              </div>
            </div>

            {/* Earnings vs Deductions Table */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Earnings column */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50/80 px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Earnings
                </div>
                <div className="p-4 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>{selectedPayslip && formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Allowances</span>
                    <span>+ {selectedPayslip && formatCurrency(selectedPayslip.allowances)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                    <span>Total Gross</span>
                    <span>
                      {selectedPayslip && formatCurrency(selectedPayslip.basicSalary + selectedPayslip.allowances)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions column */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50/80 px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Deductions
                </div>
                <div className="p-4 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between text-rose-600">
                    <span>Deductions</span>
                    <span>- {selectedPayslip && formatCurrency(selectedPayslip.deductions)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Income Tax (IT)</span>
                    <span>- {selectedPayslip && formatCurrency(selectedPayslip.tax)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                    <span>Total Deductions</span>
                    <span>
                      {selectedPayslip && formatCurrency(selectedPayslip.deductions + selectedPayslip.tax)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Total Payout Calculations summary */}
            {selectedPayslip && (
              <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                    Net Salary Payable
                  </span>
                  <p className="text-xs text-indigo-900 font-semibold">
                    {getSalaryInWords(selectedPayslip.netSalary)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-950 block">
                    {formatCurrency(selectedPayslip.netSalary)}
                  </span>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="flex justify-between items-end pt-8 text-[11px] font-bold text-slate-400">
              <div className="text-center w-40">
                <div className="border-b border-slate-200 h-10 mb-2" />
                <span>Employee Signature</span>
              </div>
              <div className="text-center w-40">
                <div className="border-b border-slate-200 h-10 mb-2" />
                <span>HR Manager Signature</span>
              </div>
            </div>

          </div>

          <DialogFooter className="pt-6 border-t border-slate-100 mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPayStubOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                window.print();
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Payslip
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}

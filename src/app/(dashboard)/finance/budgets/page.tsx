"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Plus,
  Search,
  AlertTriangle,
  Settings,
  Trash,
  Sliders,
  DollarSign,
  PieChart,
  BarChart2,
  FolderLock
} from "lucide-react";
import { useBudgetsList, useCreateBudget, useUpdateBudget } from "@/hooks/queries/finance";
import { Budget } from "@/hooks/queries/finance/finance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

const localBudgets: Budget[] = [
  { id: "bud-1", category: "Infrastructure", limit: 5000, spent: 4230, department: "Engineering" },
  { id: "bud-2", category: "Software Licensing", limit: 2000, spent: 350, department: "Product" },
  { id: "bud-3", category: "Office Rent & Facilities", limit: 1800, spent: 1800, department: "Operations" },
  { id: "bud-4", category: "Marketing Events & Ads", limit: 6000, spent: 6500, department: "Marketing" },
  { id: "bud-5", category: "Hardware Logistics", limit: 3000, spent: 950, department: "Engineering" },
];

const departmentsList = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Operations",
  "HR"
];

export default function BudgetsPage() {
  const { data: serverBudgets } = useBudgetsList();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();

  const [sandboxBudgets, setSandboxBudgets] = React.useState<Budget[]>(localBudgets);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null);

  // Form states
  const [category, setCategory] = React.useState("");
  const [limit, setLimit] = React.useState("");
  const [spent, setSpent] = React.useState("");
  const [department, setDepartment] = React.useState("Engineering");

  // Resolve Budgets List
  const activeBudgetsList = React.useMemo(() => {
    let list = sandboxBudgets;
    if (serverBudgets && Array.isArray(serverBudgets) && serverBudgets.length > 0) {
      list = serverBudgets;
    } else if (serverBudgets && typeof serverBudgets === 'object' && 'data' in serverBudgets && Array.isArray(serverBudgets.data) && serverBudgets.data.length > 0) {
      list = serverBudgets.data;
    }

    return list.filter((b) => {
      const matchSearch = b.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === "ALL" || b.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [serverBudgets, sandboxBudgets, searchTerm, departmentFilter]);

  // Aggregate Metrics
  const metrics = React.useMemo(() => {
    let list = sandboxBudgets;
    if (serverBudgets && Array.isArray(serverBudgets) && serverBudgets.length > 0) {
      list = serverBudgets;
    } else if (serverBudgets && typeof serverBudgets === 'object' && 'data' in serverBudgets && Array.isArray(serverBudgets.data) && serverBudgets.data.length > 0) {
      list = serverBudgets.data;
    }

    const totalLimit = list.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = list.reduce((sum, b) => sum + b.spent, 0);
    const headroom = Math.max(0, totalLimit - totalSpent);

    return { totalLimit, totalSpent, headroom };
  }, [serverBudgets, sandboxBudgets]);

  const openCreateDialog = () => {
    setEditingBudget(null);
    setCategory("");
    setLimit("");
    setSpent("0");
    setDepartment("Engineering");
    setIsFormOpen(true);
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setSpent(budget.spent.toString());
    setDepartment(budget.department);
    setIsFormOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) {
      toast.error("Please specify a category and a budget limit.");
      return;
    }

    const payload = {
      category,
      limit: Number(limit),
      spent: Number(spent || 0),
      department,
    };

    if (editingBudget) {
      try {
        await updateBudgetMutation.mutateAsync({
          id: editingBudget.id,
          data: payload,
        });
        toast.success("Budget settings adjusted on server.");
      } catch (err) {
        setSandboxBudgets(prev =>
          prev.map(b => (b.id === editingBudget.id ? { ...b, ...payload, id: editingBudget.id } : b))
        );
        toast.success("Budget settings updated (Sandbox Mock).");
      }
    } else {
      try {
        await createBudgetMutation.mutateAsync(payload);
        toast.success("Budget created successfully on server.");
      } catch (err) {
        const newBudget: Budget = {
          ...payload,
          id: `bud-${Date.now()}`,
        };
        setSandboxBudgets(prev => [newBudget, ...prev]);
        toast.success("Budget created (Sandbox Mock).");
      }
    }
    setIsFormOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Color warning for progress bars
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return "bg-rose-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-indigo-600";
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return "text-rose-600 font-bold";
    if (percentage >= 80) return "text-amber-600 font-bold";
    return "text-indigo-600 font-bold";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Corporate Budgets</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Set department spend limits, evaluate real-time headroom, and prevent budget overruns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Configure New Budget
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Allocated Limit</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FolderLock className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(metrics.totalLimit)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Total authorized caps</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Accumulated Outlay</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(metrics.totalSpent)}</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">
              {metrics.totalLimit > 0 ? ((metrics.totalSpent / metrics.totalLimit) * 100).toFixed(1) : 0}% depletion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Net Headroom Cap</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(metrics.headroom)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Available spend headroom</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search budgets by category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departmentsList.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Visual Budget Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeBudgetsList.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            No budgets matching the selected filters.
          </div>
        ) : (
          activeBudgetsList.map((budget) => {
            const percentage = Math.round((budget.spent / budget.limit) * 100);
            const isOver = budget.spent > budget.limit;
            return (
              <Card key={budget.id} className="border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/30 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      {budget.department}
                    </span>
                    <CardTitle className="text-sm font-bold text-slate-800 mt-0.5">{budget.category}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(budget)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-900"
                  >
                    <Sliders className="h-4.5 w-4.5" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">Usage Progress:</span>
                    <span className={getTextColor(percentage)}>{percentage}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[12px] pt-1.5 border-t border-slate-50">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Spent</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Limit</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(budget.limit)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Remaining</span>
                      <span className={`font-semibold ${isOver ? "text-rose-600" : "text-emerald-600"}`}>
                        {formatCurrency(budget.limit - budget.spent)}
                      </span>
                    </div>
                  </div>

                  {isOver && (
                    <div className="flex items-center gap-1.5 text-rose-600 text-[11px] bg-rose-50 border border-rose-100 px-2 py-1.5 rounded-lg font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Warning: Spend exceeds configured ceiling budget.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Budget Configure Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingBudget ? "Adjust Corporate Budget" : "Configure New Budget"}
            </DialogTitle>
            <DialogDescription>
              Establish a financial limit ceiling by organizational department and cost category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-[12px] font-semibold text-slate-600">Category Name</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. AWS Infrastructure, Marketing Events, Office Rent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept" className="text-[12px] font-semibold text-slate-600">Organizational Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="limit" className="text-[12px] font-semibold text-slate-600">Spend Limit ($)</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="0.00"
                  required
                  min="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spent" className="text-[12px] font-semibold text-slate-600">Current Spent ($)</Label>
                <Input
                  id="spent"
                  type="number"
                  value={spent}
                  onChange={(e) => setSpent(e.target.value)}
                  placeholder="0"
                  min="0"
                />
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
                Save Budget Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

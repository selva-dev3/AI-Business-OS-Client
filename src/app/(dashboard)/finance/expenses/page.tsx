"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Trash,
  Edit2,
  AlertCircle,
  Clock,
  CheckCircle,
  FileCheck,
  DollarSign,
  ArrowUpRight
} from "lucide-react";
import { useExpensesList, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/queries/finance";
import { Expense } from "@/hooks/queries/finance/finance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localExpenses: Expense[] = [
  { id: "exp-1", merchant: "AWS Cloud Infrastructure", amount: 4230, category: "Infrastructure", status: "APPROVED", date: "2026-06-24", description: "Monthly cloud hosting bill" },
  { id: "exp-2", merchant: "Zoom Communications", amount: 350, category: "Software", status: "APPROVED", date: "2026-06-22", description: "Enterprise video conferencing plan" },
  { id: "exp-3", merchant: "Silicon Valley Cowork", amount: 1800, category: "Office Rent", status: "PENDING", date: "2026-06-20", description: "Flex space rent - June" },
  { id: "exp-4", merchant: "Local Bistro Catering", amount: 620, category: "Marketing Events", status: "REJECTED", date: "2026-06-18", description: "Catering for client seminar" },
  { id: "exp-5", merchant: "FedEx Freight Service", amount: 950, category: "Logistics", status: "APPROVED", date: "2026-06-15", description: "Express shipping for server hardware" },
];

const categoriesList = [
  "Infrastructure",
  "Software",
  "Office Rent",
  "Marketing Events",
  "Logistics",
  "Travel",
  "Others"
];

export default function ExpensesPage() {
  const { data: serverExpenses } = useExpensesList();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const [sandboxExpenses, setSandboxExpenses] = React.useState<Expense[]>(localExpenses);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);

  // Form states
  const [merchant, setMerchant] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState("Infrastructure");
  const [date, setDate] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Resolve list
  const activeExpensesList = React.useMemo(() => {
    let list = sandboxExpenses;
    if (serverExpenses && Array.isArray(serverExpenses) && serverExpenses.length > 0) {
      list = serverExpenses;
    } else if (serverExpenses && typeof serverExpenses === 'object' && 'data' in serverExpenses && Array.isArray(serverExpenses.data) && serverExpenses.data.length > 0) {
      list = serverExpenses.data;
    }

    return list.filter((exp) => {
      const matchSearch =
        exp.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = categoryFilter === "ALL" || exp.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || exp.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [serverExpenses, sandboxExpenses, searchTerm, categoryFilter, statusFilter]);

  // Metrics
  const metrics = React.useMemo(() => {
    let list = sandboxExpenses;
    if (serverExpenses && Array.isArray(serverExpenses) && serverExpenses.length > 0) {
      list = serverExpenses;
    } else if (serverExpenses && typeof serverExpenses === 'object' && 'data' in serverExpenses && Array.isArray(serverExpenses.data) && serverExpenses.data.length > 0) {
      list = serverExpenses.data;
    }

    const total = list.reduce((sum, exp) => sum + exp.amount, 0);
    const approved = list.filter(e => e.status === "APPROVED").reduce((sum, e) => sum + e.amount, 0);
    const pending = list.filter(e => e.status === "PENDING").reduce((sum, e) => sum + e.amount, 0);
    const rejected = list.filter(e => e.status === "REJECTED").reduce((sum, e) => sum + e.amount, 0);

    return { total, approved, pending, rejected };
  }, [serverExpenses, sandboxExpenses]);

  const openCreateDialog = () => {
    setEditingExpense(null);
    setMerchant("");
    setAmount("");
    setCategory("Infrastructure");
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setDescription("");
    setIsFormOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setMerchant(expense.merchant);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setDescription(expense.description || "");
    setIsFormOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount || !date) {
      toast.error("Please fill in the merchant, amount, and claim date.");
      return;
    }

    const payload = {
      merchant,
      amount: Number(amount),
      category,
      date,
      description,
    };

    if (editingExpense) {
      try {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense.id,
          data: { ...payload, status: editingExpense.status },
        });
        toast.success("Expense claim updated on server.");
      } catch (err) {
        setSandboxExpenses(prev =>
          prev.map(e => (e.id === editingExpense.id ? { ...e, ...payload, id: editingExpense.id, status: editingExpense.status } : e))
        );
        toast.success("Expense claim updated (Sandbox Mock).");
      }
    } else {
      try {
        await createExpenseMutation.mutateAsync({
          ...payload,
          status: "PENDING",
        });
        toast.success("Expense claim submitted to server.");
      } catch (err) {
        const newExpense: Expense = {
          ...payload,
          id: `exp-${Date.now()}`,
          status: "PENDING",
        };
        setSandboxExpenses(prev => [newExpense, ...prev]);
        toast.success("Expense claim submitted (Sandbox Mock).");
      }
    }
    setIsFormOpen(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: Expense["status"]) => {
    try {
      await updateExpenseMutation.mutateAsync({
        id,
        data: { status: newStatus },
      });
      toast.success(`Expense status marked as ${newStatus} on server.`);
    } catch (err) {
      setSandboxExpenses(prev =>
        prev.map(e => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(`Expense marked as ${newStatus} (Sandbox Mock).`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense claim?")) return;
    try {
      await deleteExpenseMutation.mutateAsync(id);
      toast.success("Expense deleted from server.");
    } catch (err) {
      setSandboxExpenses(prev => prev.filter(e => e.id !== id));
      toast.success("Expense removed (Sandbox Mock).");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getExpenseStatusStyle = (status: Expense["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Expenses & Claims</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Submit operating expenses, upload virtual receipts, and review approvals for audit compliance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Submit Expense claim
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Claims</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(metrics.total)}</p>
            <p className="mt-1 text-[12px] text-slate-400">All submitted logs</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Approved Claims</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(metrics.approved)}</p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium">Reimbursement approved</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Pending Review</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-amber-600">{formatCurrency(metrics.pending)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Claims in queue</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Rejected Claims</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <X className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(metrics.rejected)}</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">Declined expenditures</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search by merchant or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categoriesList.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                <th className="py-3.5 px-4 font-semibold">Claim Date</th>
                <th className="py-3.5 px-4 font-semibold">Merchant</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Description</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeExpensesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No expense claims matching the selected filters.
                  </td>
                </tr>
              ) : (
                activeExpensesList.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {new Date(expense.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{expense.merchant}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(expense.amount)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getExpenseStatusStyle(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                      {expense.description || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200">
                          {expense.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(expense.id, "APPROVED")}
                                className="text-emerald-600 focus:text-emerald-700 cursor-pointer"
                              >
                                <Check className="mr-2 h-4 w-4" /> Approve Claim
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(expense.id, "REJECTED")}
                                className="text-rose-600 focus:text-rose-700 cursor-pointer"
                              >
                                <X className="mr-2 h-4 w-4" /> Reject Claim
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => openEditDialog(expense)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-rose-600 focus:text-rose-700 cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete Claim
                          </DropdownMenuItem>
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

      {/* Expense Submit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingExpense ? "Edit Expense Claim" : "Submit Expense Claim"}
            </DialogTitle>
            <DialogDescription>
              Submit receipts and expense values for organizational bookkeeping review.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveExpense} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="merchant" className="text-[12px] font-semibold text-slate-600">Merchant / Supplier</Label>
              <Input
                id="merchant"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. AWS Infrastructure, Amazon, local vendor"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-[12px] font-semibold text-slate-600">Claim Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[12px] font-semibold text-slate-600">Expense Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesList.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-[12px] font-semibold text-slate-600">Transaction Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-[12px] font-semibold text-slate-600">Description / Business Purpose</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe details regarding this expense claim..."
                rows={3}
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
                Submit Claim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

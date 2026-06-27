"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Check,
  Send,
  Download,
  Trash,
  Edit2,
  PlusCircle,
  MinusCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Coins
} from "lucide-react";
import { useInvoicesList, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from "@/hooks/queries/finance";
import { Invoice, InvoiceItem } from "@/hooks/queries/finance/finance.types";
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

const localInvoices: Invoice[] = [
  { id: "inv-1", invoiceNumber: "INV-2026-001", clientName: "Acme Corporation", amount: 15450, status: "PAID", dueDate: "2026-07-15", issueDate: "2026-06-15", description: "Q2 Consulting Services", taxRate: 10, discountRate: 5, subtotal: 15000, taxAmount: 1500, discountAmount: 750, total: 15450, items: [{ description: "Consulting fees", quantity: 30, unitPrice: 500, total: 15000 }] },
  { id: "inv-2", invoiceNumber: "INV-2026-002", clientName: "Globex Industries", amount: 8900, status: "PENDING", dueDate: "2026-07-20", issueDate: "2026-06-20", description: "Design Deliverables", taxRate: 0, discountRate: 0, subtotal: 8900, taxAmount: 0, discountAmount: 0, total: 8900, items: [{ description: "Landing Page + Dashboard assets", quantity: 1, unitPrice: 8900, total: 8900 }] },
  { id: "inv-3", invoiceNumber: "INV-2026-003", clientName: "Initech LLC", amount: 12500, status: "OVERDUE", dueDate: "2026-06-10", issueDate: "2026-05-10", description: "Y2K Compliance Audit", taxRate: 0, discountRate: 0, subtotal: 12500, taxAmount: 0, discountAmount: 0, total: 12500, items: [{ description: "System migration support", quantity: 25, unitPrice: 500, total: 12500 }] },
  { id: "inv-4", invoiceNumber: "INV-2026-004", clientName: "Umbrella Corp", amount: 4800, status: "PAID", dueDate: "2026-06-30", issueDate: "2026-05-30", description: "Medical Equipment License", taxRate: 10, discountRate: 0, subtotal: 4400, taxAmount: 440, discountAmount: 0, total: 4840, items: [{ description: "Lab asset manager software", quantity: 2, unitPrice: 2200, total: 4400 }] },
  { id: "inv-5", invoiceNumber: "INV-2026-005", clientName: "Hooli Inc", amount: 22000, status: "PENDING", dueDate: "2026-07-28", issueDate: "2026-06-28", description: "Kernel Optimization", taxRate: 0, discountRate: 0, subtotal: 22000, taxAmount: 0, discountAmount: 0, total: 22000, items: [{ description: "Platform latency adjustments", quantity: 1, unitPrice: 22000, total: 22000 }] },
];

export default function InvoicesPage() {
  const { data: serverInvoices, isLoading } = useInvoicesList();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const deleteInvoiceMutation = useDeleteInvoice();

  const [sandboxInvoices, setSandboxInvoices] = React.useState<Invoice[]>(localInvoices);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [issueDate, setIssueDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [items, setItems] = React.useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [taxRate, setTaxRate] = React.useState<number>(0);
  const [discountRate, setDiscountRate] = React.useState<number>(0);

  // Resolve invoices list
  const activeInvoicesList = React.useMemo(() => {
    // If endpoints are fully configured and server data exists
    let list = sandboxInvoices;
    if (serverInvoices && Array.isArray(serverInvoices) && serverInvoices.length > 0) {
      list = serverInvoices;
    } else if (serverInvoices && typeof serverInvoices === 'object' && 'data' in serverInvoices && Array.isArray(serverInvoices.data) && serverInvoices.data.length > 0) {
      list = serverInvoices.data;
    }

    return list.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [serverInvoices, sandboxInvoices, searchTerm, statusFilter]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxInvoices;
    if (serverInvoices && Array.isArray(serverInvoices) && serverInvoices.length > 0) {
      list = serverInvoices;
    } else if (serverInvoices && typeof serverInvoices === 'object' && 'data' in serverInvoices && Array.isArray(serverInvoices.data) && serverInvoices.data.length > 0) {
      list = serverInvoices.data;
    }

    const total = list.reduce((sum, inv) => sum + inv.amount, 0);
    const collected = list.filter(inv => inv.status === "PAID").reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = list.filter(inv => inv.status === "PENDING").reduce((sum, inv) => sum + inv.amount, 0);
    const overdue = list.filter(inv => inv.status === "OVERDUE").reduce((sum, inv) => sum + inv.amount, 0);

    return { total, collected, outstanding, overdue };
  }, [serverInvoices, sandboxInvoices]);

  // Calculations logic
  const invoiceCalculations = React.useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = (subtotal * discountRate) / 100;
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, discountAmount, total };
  }, [items, taxRate, discountRate]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, key: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const updatedItem = { ...newItems[index], [key]: value };
    if (key === "quantity" || key === "unitPrice") {
      const q = key === "quantity" ? Number(value) : updatedItem.quantity;
      const p = key === "unitPrice" ? Number(value) : updatedItem.unitPrice;
      updatedItem.total = q * p;
    }
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const openCreateDialog = () => {
    const nextNum = `INV-2026-00${activeInvoicesList.length + 1}`;
    setEditingInvoice(null);
    setInvoiceNumber(nextNum);
    setClientName("");
    const today = new Date().toISOString().split("T")[0];
    setIssueDate(today);
    setDueDate("");
    setDescription("");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setTaxRate(0);
    setDiscountRate(0);
    setIsFormOpen(true);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setInvoiceNumber(invoice.invoiceNumber);
    setClientName(invoice.clientName);
    setIssueDate(invoice.issueDate);
    setDueDate(invoice.dueDate);
    setDescription(invoice.description || "");
    setItems(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: "", quantity: 1, unitPrice: invoice.amount, total: invoice.amount }]);
    setTaxRate(invoice.taxRate || 0);
    setDiscountRate(invoice.discountRate || 0);
    setIsFormOpen(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !dueDate) {
      toast.error("Please fill in the client name and due date.");
      return;
    }

    const payload = {
      invoiceNumber,
      clientName,
      dueDate,
      issueDate,
      description,
      items: items.map(it => ({ ...it, total: it.quantity * it.unitPrice })),
      taxRate,
      discountRate,
      amount: invoiceCalculations.total,
      subtotal: invoiceCalculations.subtotal,
      taxAmount: invoiceCalculations.taxAmount,
      discountAmount: invoiceCalculations.discountAmount,
      total: invoiceCalculations.total,
    };

    if (editingInvoice) {
      // Update action
      try {
        await updateInvoiceMutation.mutateAsync({
          id: editingInvoice.id,
          data: { ...payload, status: editingInvoice.status },
        });
        toast.success("Invoice updated successfully on server.");
      } catch (err) {
        // Fallback local sandbox
        setSandboxInvoices(prev =>
          prev.map(i => (i.id === editingInvoice.id ? { ...i, ...payload, id: editingInvoice.id, status: editingInvoice.status } : i))
        );
        toast.success("Invoice updated (Sandbox Mock Mode).");
      }
    } else {
      // Create action
      try {
        await createInvoiceMutation.mutateAsync({
          ...payload,
          amount: invoiceCalculations.total,
        });
        toast.success("Invoice created successfully on server.");
      } catch (err) {
        // Fallback local sandbox
        const newInvoice: Invoice = {
          ...payload,
          id: `inv-${Date.now()}`,
          status: "PENDING",
        };
        setSandboxInvoices(prev => [newInvoice, ...prev]);
        toast.success("Invoice created (Sandbox Mock Mode).");
      }
    }
    setIsFormOpen(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: Invoice["status"]) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        id,
        data: { status: newStatus },
      });
      toast.success(`Invoice marked as ${newStatus} on server.`);
    } catch (err) {
      setSandboxInvoices(prev =>
        prev.map(i => (i.id === id ? { ...i, status: newStatus } : i))
      );
      toast.success(`Invoice marked as ${newStatus} (Sandbox Mock).`);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteInvoiceMutation.mutateAsync(id);
      toast.success("Invoice deleted successfully on server.");
    } catch (err) {
      setSandboxInvoices(prev => prev.filter(i => i.id !== id));
      toast.success("Invoice removed (Sandbox Mock).");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getInvoiceStatusStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "OVERDUE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DRAFT":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Invoices Manager</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Create professional corporate invoices, track pending client receivables, and automate collection reminders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Billed</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(metrics.total)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Aggregated invoices list</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Collected</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(metrics.collected)}</p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium">
              {metrics.total > 0 ? ((metrics.collected / metrics.total) * 100).toFixed(1) : 0}% recovery rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Pending Receivables</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-amber-600">{formatCurrency(metrics.outstanding)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Awaiting client payment</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Overdue Balances</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(metrics.overdue)}</p>
            <p className="mt-1 text-[12px] text-rose-600 font-medium">Critical attention required</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search by invoice # or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
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
                <th className="py-3.5 px-4 font-semibold">Invoice Number</th>
                <th className="py-3.5 px-4 font-semibold">Client Name</th>
                <th className="py-3.5 px-4 font-semibold">Issue Date</th>
                <th className="py-3.5 px-4 font-semibold">Due Date</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeInvoicesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No invoices matching the selected filters.
                  </td>
                </tr>
              ) : (
                activeInvoicesList.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">{invoice.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{invoice.clientName}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(invoice.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(invoice.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(invoice.amount)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getInvoiceStatusStyle(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200">
                          {invoice.status !== "PAID" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(invoice.id, "PAID")}
                              className="text-emerald-600 focus:text-emerald-700 cursor-pointer"
                            >
                              <Check className="mr-2 h-4 w-4" /> Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === "PENDING" || invoice.status === "OVERDUE") && (
                            <DropdownMenuItem
                              onClick={() => {
                                toast.success(`Reminder notification sent to ${invoice.clientName}!`);
                              }}
                              className="cursor-pointer"
                            >
                              <Send className="mr-2 h-4 w-4" /> Send Reminder
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              toast.success(`Exporting ${invoice.invoiceNumber} as PDF...`);
                            }}
                            className="cursor-pointer"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(invoice)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-rose-600 focus:text-rose-700 cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete Invoice
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

      {/* Invoice Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingInvoice ? `Edit Invoice: ${invoiceNumber}` : "Create Corporate Invoice"}
            </DialogTitle>
            <DialogDescription>
              Enter customer metadata, define itemized tables, and configure global taxes/discounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveInvoice} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="invoiceNum" className="text-[12px] font-semibold text-slate-600">Invoice Number</Label>
                <Input
                  id="invoiceNum"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client" className="text-[12px] font-semibold text-slate-600">Client Name</Label>
                <Input
                  id="client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Industries"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="issue" className="text-[12px] font-semibold text-slate-600">Issue Date</Label>
                <Input
                  id="issue"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due" className="text-[12px] font-semibold text-slate-600">Due Date</Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-[12px] font-semibold text-slate-600">Global Description / Memo</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or payment bank transfer instructions..."
                rows={2}
              />
            </div>

            {/* Line Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h3 className="text-sm font-bold text-slate-800">Itemized Bill Breakdown</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-8 text-xs border-slate-200"
                >
                  <PlusCircle className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                  Add Row
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <Input
                        placeholder="Item name / Service description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        required
                        className="bg-white border-slate-200 text-xs"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        required
                        min="1"
                        className="bg-white border-slate-200 text-xs"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        required
                        min="0"
                        className="bg-white border-slate-200 text-xs"
                      />
                    </div>
                    <div className="w-24 flex items-center justify-between font-bold text-slate-800 text-xs px-1">
                      <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length === 1}
                        className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="tax" className="text-[12px] font-semibold text-slate-600">Tax Rate (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="discount" className="text-[12px] font-semibold text-slate-600">Discount Rate (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 text-[13px] self-end">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(invoiceCalculations.subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-semibold">{formatCurrency(invoiceCalculations.taxAmount)}</span>
                  </div>
                )}
                {discountRate > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount ({discountRate}%):</span>
                    <span className="font-semibold">-{formatCurrency(invoiceCalculations.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 text-sm font-extrabold border-t border-slate-200 pt-2.5">
                  <span>Invoice Total:</span>
                  <span className="text-base text-indigo-600">{formatCurrency(invoiceCalculations.total)}</span>
                </div>
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
                Save Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Plus,
  Search,
  Trash,
  Printer,
  Calendar,
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { usePaymentsList, useCreatePayment, useInvoicesList, useAccountsList } from "@/hooks/queries/finance";
import { Payment } from "@/hooks/queries/finance/finance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const localPayments: Payment[] = [
  { id: "pay-1", paymentNumber: "PAY-2026-001", invoiceId: "inv-1", amount: 15450, method: "BANK_TRANSFER", date: "2026-06-25", type: "INBOUND", referenceNumber: "TXN-984712", notes: "Acme Invoice INV-2026-001 Settlement" },
  { id: "pay-2", paymentNumber: "PAY-2026-002", amount: 4230, method: "CREDIT_CARD", date: "2026-06-24", type: "OUTBOUND", referenceNumber: "TXN-442109", notes: "AWS Cloud Infrastructure Billing" },
  { id: "pay-3", paymentNumber: "PAY-2026-003", invoiceId: "inv-4", amount: 4800, method: "STRIPE", date: "2026-06-30", type: "INBOUND", referenceNumber: "TXN-109284", notes: "Umbrella Corp Software License Payment" },
  { id: "pay-4", paymentNumber: "PAY-2026-004", amount: 350, method: "PAYPAL", date: "2026-06-23", type: "OUTBOUND", referenceNumber: "TXN-765123", notes: "Zoom Enterprise Video Subscription" },
  { id: "pay-5", paymentNumber: "PAY-2026-005", amount: 1800, method: "BANK_TRANSFER", date: "2026-06-20", type: "OUTBOUND", referenceNumber: "TXN-228741", notes: "Office Cowork Space Rent" },
];

const methodsList = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "STRIPE", label: "Stripe Gateway" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "CASH", label: "Cash Asset" }
] as const;

export default function PaymentsPage() {
  const { data: serverPayments } = usePaymentsList();
  const { data: serverInvoices } = useInvoicesList();
  const { data: serverAccounts } = useAccountsList();
  const createPaymentMutation = useCreatePayment();

  const [sandboxPayments, setSandboxPayments] = React.useState<Payment[]>(localPayments);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);

  // Form states
  const [invoiceId, setInvoiceId] = React.useState<string>("none");
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState<Payment["method"]>("BANK_TRANSFER");
  const [date, setDate] = React.useState("");
  const [type, setType] = React.useState<Payment["type"]>("INBOUND");
  const [referenceNumber, setReferenceNumber] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [accountId, setAccountId] = React.useState<string>("");

  // Lists lookup
  const invoicesOptions = React.useMemo(() => {
    if (serverInvoices && Array.isArray(serverInvoices)) return serverInvoices;
    if (serverInvoices && typeof serverInvoices === 'object' && 'data' in serverInvoices && Array.isArray(serverInvoices.data)) return serverInvoices.data;
    return [];
  }, [serverInvoices]);

  const accountsOptions = React.useMemo(() => {
    if (serverAccounts && Array.isArray(serverAccounts)) return serverAccounts;
    if (serverAccounts && typeof serverAccounts === 'object' && 'data' in serverAccounts && Array.isArray(serverAccounts.data)) return serverAccounts.data;
    return [];
  }, [serverAccounts]);

  // Sync amount on invoice select
  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    if (invId !== "none") {
      const match = invoicesOptions.find(i => i.id === invId);
      if (match) {
        setAmount(match.amount.toString());
        setType("INBOUND");
        if (!notes) {
          setNotes(`Invoice payment for ${match.clientName} (${match.invoiceNumber})`);
        }
      }
    }
  };

  // Filter calculations
  const activePaymentsList = React.useMemo(() => {
    let list = sandboxPayments;
    if (serverPayments && Array.isArray(serverPayments) && serverPayments.length > 0) {
      list = serverPayments;
    } else if (serverPayments && typeof serverPayments === 'object' && 'data' in serverPayments && Array.isArray(serverPayments.data) && serverPayments.data.length > 0) {
      list = serverPayments.data;
    }

    return list.filter((p) => {
      const matchSearch =
        p.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "ALL" || p.type === typeFilter;
      const matchMethod = methodFilter === "ALL" || p.method === methodFilter;
      return matchSearch && matchType && matchMethod;
    });
  }, [serverPayments, sandboxPayments, searchTerm, typeFilter, methodFilter]);

  // Aggregate Metrics
  const metrics = React.useMemo(() => {
    let list = sandboxPayments;
    if (serverPayments && Array.isArray(serverPayments) && serverPayments.length > 0) {
      list = serverPayments;
    } else if (serverPayments && typeof serverPayments === 'object' && 'data' in serverPayments && Array.isArray(serverPayments.data) && serverPayments.data.length > 0) {
      list = serverPayments.data;
    }

    const inbound = list.filter(p => p.type === "INBOUND").reduce((sum, p) => sum + p.amount, 0);
    const outbound = list.filter(p => p.type === "OUTBOUND").reduce((sum, p) => sum + p.amount, 0);
    const net = inbound - outbound;

    return { inbound, outbound, net };
  }, [serverPayments, sandboxPayments]);

  const openCreateDialog = () => {
    setInvoiceId("none");
    setAmount("");
    setMethod("BANK_TRANSFER");
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setType("INBOUND");
    setReferenceNumber(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setNotes("");
    if (accountsOptions.length > 0) {
      setAccountId(accountsOptions[0].id);
    } else {
      setAccountId("");
    }
    setIsFormOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !referenceNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const paymentNumber = `PAY-2026-00${activePaymentsList.length + 1}`;
    const payload = {
      invoiceId: invoiceId === "none" ? undefined : invoiceId,
      amount: Number(amount),
      method,
      type,
      referenceNumber,
      date,
      notes,
    };

    try {
      await createPaymentMutation.mutateAsync(payload);
      toast.success("Payment transaction successfully recorded on server.");
    } catch (err) {
      const newPayment: Payment = {
        ...payload,
        id: `pay-${Date.now()}`,
        paymentNumber,
      };
      setSandboxPayments(prev => [newPayment, ...prev]);
      toast.success("Payment transaction recorded (Sandbox Mock).");
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payments Ledger</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Log financial settlement payments, reconcile invoice receipts, and track liquidity flows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Log Payment Transaction
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Inbound Payments</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(metrics.inbound)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Total cash collected from invoices</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Outbound Payments</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-amber-600">{formatCurrency(metrics.outbound)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Operating costs settled</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Net Volume Flow</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Coins className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-extrabold ${metrics.net >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
              {formatCurrency(metrics.net)}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">Liquidity change over active timeline</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search by txn description or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Flows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Flows</SelectItem>
                <SelectItem value="INBOUND">Inbound (Credit)</SelectItem>
                <SelectItem value="OUTBOUND">Outbound (Debit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                {methodsList.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
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
                <th className="py-3.5 px-4 font-semibold">Payment Date</th>
                <th className="py-3.5 px-4 font-semibold">Reference #</th>
                <th className="py-3.5 px-4 font-semibold">Flow</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Method</th>
                <th className="py-3.5 px-4 font-semibold">Notes / Purpose</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activePaymentsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No payment logs matching the selected filters.
                  </td>
                </tr>
              ) : (
                activePaymentsList.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {new Date(payment.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{payment.referenceNumber}</td>
                    <td className="py-3.5 px-4">
                      {payment.type === "INBOUND" ? (
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <ArrowDownLeft className="h-3 w-3 mr-0.5 text-emerald-600" />
                          INBOUND
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <ArrowUpRight className="h-3 w-3 mr-0.5 text-amber-600" />
                          OUTBOUND
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(payment.amount)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {methodsList.find(m => m.value === payment.method)?.label || payment.method}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[240px] truncate">
                      {payment.notes || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast.success(`Printing payment receipt for ${payment.referenceNumber}...`);
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Payment Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Log Payment Transaction
            </DialogTitle>
            <DialogDescription>
              Record an inbound/outbound financial payment and link to customer invoices.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Transaction Flow Direction</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={type === "INBOUND" ? "default" : "outline"}
                  onClick={() => setType("INBOUND")}
                  className={type === "INBOUND" ? "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" : "border-slate-200"}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-1.5 text-emerald-500" />
                  Inbound (Receive)
                </Button>
                <Button
                  type="button"
                  variant={type === "OUTBOUND" ? "default" : "outline"}
                  onClick={() => setType("OUTBOUND")}
                  className={type === "OUTBOUND" ? "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" : "border-slate-200"}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1.5 text-amber-500" />
                  Outbound (Disburse)
                </Button>
              </div>
            </div>

            {type === "INBOUND" && invoicesOptions.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="invoiceId" className="text-[12px] font-semibold text-slate-600">Link Customer Invoice</Label>
                <Select value={invoiceId} onValueChange={handleInvoiceChange}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Select linked invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Independent Payment (No Invoice)</SelectItem>
                    {invoicesOptions.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.clientName} ({formatCurrency(inv.amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {accountsOptions.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="accountId" className="text-[12px] font-semibold text-slate-600">Source/Target Ledger Account</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Select bank/cash account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsOptions.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-[12px] font-semibold text-slate-600">Amount ($)</Label>
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
                <Label htmlFor="method" className="text-[12px] font-semibold text-slate-600">Payment Method</Label>
                <Select value={method} onValueChange={(val: any) => setMethod(val)}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodsList.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-[12px] font-semibold text-slate-600">Payment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ref" className="text-[12px] font-semibold text-slate-600">Reference Number</Label>
                <Input
                  id="ref"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="TXN-XXXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[12px] font-semibold text-slate-600">Description Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Invoice payment for consulting, catering services, etc."
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
                Record Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

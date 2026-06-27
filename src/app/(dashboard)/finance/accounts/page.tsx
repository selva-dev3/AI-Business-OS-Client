"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Wallet,
  Plus,
  ArrowLeftRight,
  Search,
  Building,
  CreditCard,
  Banknote,
  Sliders,
  DollarSign,
  TrendingDown,
  Trash,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Check
} from "lucide-react";
import { useAccountsList, useCreateAccount, useUpdateAccount, useTransferFunds } from "@/hooks/queries/finance";
import { Account } from "@/hooks/queries/finance/finance.types";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localAccounts: Account[] = [
  { id: "acc-1", accountName: "Primary SVB Operating", accountType: "BANK", accountNumber: "3382947192", balance: 148500, currency: "USD", bankName: "Silicon Valley Bank" },
  { id: "acc-2", accountName: "Stripe Holding Vault", accountType: "BANK", accountNumber: "9940182741", balance: 65200, currency: "USD", bankName: "Stripe Financial" },
  { id: "acc-3", accountName: "Corporate Credit Card", accountType: "CREDIT_CARD", accountNumber: "4111222233334444", balance: 12450, currency: "USD", bankName: "Chase Commercial" },
  { id: "acc-4", accountName: "Petty Cash Chest", accountType: "CASH", accountNumber: "CASH-PETTY-001", balance: 2500, currency: "USD" },
];

const accountTypesList = [
  { value: "BANK", label: "Bank Account" },
  { value: "CREDIT_CARD", label: "Credit Card Account" },
  { value: "CASH", label: "Cash Account" },
  { value: "RECEIVABLE", label: "Receivable Ledger" },
  { value: "PAYABLE", label: "Payable Ledger" }
];

export default function AccountsPage() {
  const { data: serverAccounts } = useAccountsList();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const transferFundsMutation = useTransferFunds();

  const [sandboxAccounts, setSandboxAccounts] = React.useState<Account[]>(localAccounts);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);

  // Form states
  const [accountName, setAccountName] = React.useState("");
  const [accountType, setAccountType] = React.useState<Account["accountType"]>("BANK");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [balance, setBalance] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [bankName, setBankName] = React.useState("");

  // Transfer Form state
  const [isTransferOpen, setIsTransferOpen] = React.useState(false);
  const [fromAccountId, setFromAccountId] = React.useState("");
  const [toAccountId, setToAccountId] = React.useState("");
  const [transferAmount, setTransferAmount] = React.useState("");
  const [transferDescription, setTransferDescription] = React.useState("");

  // Resolve List
  const activeAccountsList = React.useMemo(() => {
    let list = sandboxAccounts;
    if (serverAccounts && Array.isArray(serverAccounts) && serverAccounts.length > 0) {
      list = serverAccounts;
    } else if (serverAccounts && typeof serverAccounts === 'object' && 'data' in serverAccounts && Array.isArray(serverAccounts.data) && serverAccounts.data.length > 0) {
      list = serverAccounts.data;
    }

    return list.filter((a) => {
      const matchName = a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.bankName && a.bankName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchName;
    });
  }, [serverAccounts, sandboxAccounts, searchTerm]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxAccounts;
    if (serverAccounts && Array.isArray(serverAccounts) && serverAccounts.length > 0) {
      list = serverAccounts;
    } else if (serverAccounts && typeof serverAccounts === 'object' && 'data' in serverAccounts && Array.isArray(serverAccounts.data) && serverAccounts.data.length > 0) {
      list = serverAccounts.data;
    }

    const bankAndCash = list.filter(a => a.accountType === "BANK" || a.accountType === "CASH" || a.accountType === "RECEIVABLE").reduce((sum, a) => sum + a.balance, 0);
    const cardDebt = list.filter(a => a.accountType === "CREDIT_CARD" || a.accountType === "PAYABLE").reduce((sum, a) => sum + a.balance, 0);
    const netLiquidity = bankAndCash - cardDebt;

    return { bankAndCash, cardDebt, netLiquidity };
  }, [serverAccounts, sandboxAccounts]);

  const openCreateDialog = () => {
    setEditingAccount(null);
    setAccountName("");
    setAccountType("BANK");
    setAccountNumber("");
    setBalance("");
    setCurrency("USD");
    setBankName("");
    setIsFormOpen(true);
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setAccountName(account.accountName);
    setAccountType(account.accountType);
    setAccountNumber(account.accountNumber);
    setBalance(account.balance.toString());
    setCurrency(account.currency);
    setBankName(account.bankName || "");
    setIsFormOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !accountNumber || !balance) {
      toast.error("Please fill in account name, number, and opening balance.");
      return;
    }

    const payload = {
      accountName,
      accountType,
      accountNumber,
      balance: Number(balance),
      currency,
      bankName: bankName || undefined,
    };

    if (editingAccount) {
      try {
        await updateAccountMutation.mutateAsync({
          id: editingAccount.id,
          data: payload,
        });
        toast.success("Account settings updated on server.");
      } catch (err) {
        setSandboxAccounts(prev =>
          prev.map(a => (a.id === editingAccount.id ? { ...a, ...payload, id: editingAccount.id } : a))
        );
        toast.success("Account settings updated (Sandbox Mock).");
      }
    } else {
      try {
        await createAccountMutation.mutateAsync(payload);
        toast.success("Account created successfully on server.");
      } catch (err) {
        const newAccount: Account = {
          ...payload,
          id: `acc-${Date.now()}`,
        };
        setSandboxAccounts(prev => [newAccount, ...prev]);
        toast.success("Account created (Sandbox Mock).");
      }
    }
    setIsFormOpen(false);
  };

  const openTransferDialog = () => {
    if (activeAccountsList.length < 2) {
      toast.error("You need at least 2 accounts to initiate a transfer.");
      return;
    }
    setFromAccountId(activeAccountsList[0].id);
    setToAccountId(activeAccountsList[1].id);
    setTransferAmount("");
    setTransferDescription("");
    setIsTransferOpen(true);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !fromAccountId || !toAccountId) {
      toast.error("Please fill in all transfer fields.");
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error("Source and destination accounts must be different.");
      return;
    }

    const amt = Number(transferAmount);

    try {
      await transferFundsMutation.mutateAsync({
        fromAccountId,
        toAccountId,
        amount: amt,
        date: new Date().toISOString().split("T")[0],
        description: transferDescription,
      });
      toast.success("Funds transferred successfully on server.");
    } catch (err) {
      setSandboxAccounts(prev => {
        return prev.map(a => {
          if (a.id === fromAccountId) {
            return { ...a, balance: a.balance - amt };
          }
          if (a.id === toAccountId) {
            return { ...a, balance: a.balance + amt };
          }
          return a;
        });
      });
      toast.success("Funds transferred (Sandbox Mock).");
    }
    setIsTransferOpen(false);
  };

  const maskAccountNumber = (num: string) => {
    if (num.length < 4) return "****";
    const lastDigits = num.slice(-4);
    return `•••• •••• •••• ${lastDigits}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getAccountTypeIcon = (type: Account["accountType"]) => {
    switch (type) {
      case "BANK":
        return <Building className="h-4.5 w-4.5 text-indigo-600" />;
      case "CREDIT_CARD":
        return <CreditCard className="h-4.5 w-4.5 text-rose-500" />;
      case "CASH":
        return <Banknote className="h-4.5 w-4.5 text-emerald-600" />;
      default:
        return <Wallet className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ledger Accounts</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Manage corporate bank accounts, check credit card liabilities, and execute internal funds transfers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openTransferDialog}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 font-semibold"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4 text-indigo-600" />
            Transfer Funds
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Ledger Account
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Consolidated Bank/Cash Assets</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(metrics.bankAndCash)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Total liquid bank funds</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Credit Card Liabilities</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(metrics.cardDebt)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Outstanding credit liabilities</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Net Liquidity Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(metrics.netLiquidity)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Net worth assets subtraction</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search accounts by name or banking institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Accounts Grid Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAccountsList.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            No accounts matching the search filter.
          </div>
        ) : (
          activeAccountsList.map((account) => {
            const isLiability = account.accountType === "CREDIT_CARD" || account.accountType === "PAYABLE";
            return (
              <Card key={account.id} className="border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800">{account.accountName}</CardTitle>
                      {account.bankName && (
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {account.bankName}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 bg-white border border-slate-200">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(account)}
                        className="cursor-pointer"
                      >
                        <Sliders className="mr-2 h-4 w-4 text-indigo-600" /> Edit Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pt-2 pb-4 space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/50 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Account Number</span>
                    <span className="text-[12px] font-mono text-slate-600 block">
                      {maskAccountNumber(account.accountNumber)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-semibold">Ledger Balance:</span>
                    <span className={`text-base font-extrabold ${isLiability ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Account Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingAccount ? "Edit Ledger Account" : "Add Ledger Account"}
            </DialogTitle>
            <DialogDescription>
              Add bank institutions or credit cards to manage company cash reserves.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="accName" className="text-[12px] font-semibold text-slate-600">Account Display Name</Label>
              <Input
                id="accName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Primary Silicon Valley Bank"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="accType" className="text-[12px] font-semibold text-slate-600">Account Type</Label>
                <Select value={accountType} onValueChange={(val: any) => setAccountType(val)}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypesList.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank" className="text-[12px] font-semibold text-slate-600">Banking Institution</Label>
                <Input
                  id="bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Chase Bank (Optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="accNumber" className="text-[12px] font-semibold text-slate-600">Account/Card Number</Label>
                <Input
                  id="accNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="balance" className="text-[12px] font-semibold text-slate-600">Opening Balance ($)</Label>
                <Input
                  id="balance"
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  required
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
                Save Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fund Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Transfer Funds Internal
            </DialogTitle>
            <DialogDescription>
              Execute a ledger transaction between internal company cash holdings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fromAcc" className="text-[12px] font-semibold text-slate-600">Source Account (Debit)</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="From Account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccountsList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.accountName} ({formatCurrency(a.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="toAcc" className="text-[12px] font-semibold text-slate-600">Destination Account (Credit)</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="To Account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccountsList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.accountName} ({formatCurrency(a.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transferAmount" className="text-[12px] font-semibold text-slate-600">Transfer Value ($)</Label>
              <Input
                id="transferAmount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                required
                min="1"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transferDesc" className="text-[12px] font-semibold text-slate-600">Reconciliation Note</Label>
              <Input
                id="transferDesc"
                value={transferDescription}
                onChange={(e) => setTransferDescription(e.target.value)}
                placeholder="Description / Reason for transfer"
              />
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransferOpen(false)}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
                Complete Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

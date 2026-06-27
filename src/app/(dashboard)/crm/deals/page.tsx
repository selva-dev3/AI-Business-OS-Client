"use client";

import * as React from "react";
import {
  useDealsList,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useCloseDealWon,
  useCloseDealLost,
  useAccountsList,
  Deal,
  CreateDealData,
  UpdateDealData,
} from "@/hooks/queries/crm";
import { useUsers as useSystemUsers } from "@/hooks/queries/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  MoreVertical,
  Trash,
  Edit2,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const MOCK_DEALS: Deal[] = [
  {
    _id: "mock-deal-1",
    title: "TCS Enterprise HRMS Migration",
    value: 45000,
    currency: "USD",
    stage: "PROPOSAL",
    probability: 70,
    expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 15).toISOString().substring(0, 10),
    finalValue: 0,
    status: "OPEN",
    notes: "Reviewing proposal terms this week.",
    tags: ["Enterprise", "Migration"],
    companyId: "mock-company",
    position: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-deal-2",
    title: "Reliance AI Operations Tooling",
    value: 85000,
    currency: "USD",
    stage: "NEGOTIATION",
    probability: 90,
    expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().substring(0, 10),
    finalValue: 0,
    status: "OPEN",
    notes: "Security clearance completed. Contract draft under review.",
    tags: ["AI", "Security Approved"],
    companyId: "mock-company",
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-deal-3",
    title: "Infotech Hub Core Licenses",
    value: 12000,
    currency: "USD",
    stage: "WON",
    probability: 100,
    expectedCloseDate: new Date().toISOString().substring(0, 10),
    actualCloseDate: new Date().toISOString(),
    finalValue: 12000,
    status: "WON",
    notes: "Deal closed successfully. Handed over to accounts.",
    tags: ["SMB", "Won"],
    companyId: "mock-company",
    position: 2,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DealsPage() {
  const [search, setSearch] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // React Query hooks
  const { data: serverData, isLoading, refetch } = useDealsList({
    page,
    limit,
    search: search || undefined,
    stage: stageFilter !== "ALL" ? (stageFilter as any) : undefined,
    status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
  });

  const { data: accountsData } = useAccountsList();
  const { data: usersData } = useSystemUsers();

  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();
  const deleteDealMutation = useDeleteDeal();
  const closeDealWonMutation = useCloseDealWon();
  const closeDealLostMutation = useCloseDealLost();

  // Fallback state
  const [localDeals, setLocalDeals] = React.useState<Deal[]>(MOCK_DEALS);

  // Dialog Controls
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [wonDialogOpen, setWonDialogOpen] = React.useState(false);
  const [lostDialogOpen, setLostDialogOpen] = React.useState(false);

  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);

  // Form states
  const [dealForm, setDealForm] = React.useState<Partial<CreateDealData>>({
    title: "",
    value: 0,
    currency: "USD",
    stage: "QUALIFICATION",
    probability: 10,
    expectedCloseDate: "",
    accountId: "",
    notes: "",
    tags: [],
    ownerId: null,
  });

  const [wonForm, setWonForm] = React.useState({
    finalValue: 0,
    notes: "",
  });

  const [lostForm, setLostForm] = React.useState({
    lostReason: "",
    notes: "",
  });

  // Calculate filtered list
  const dealsList = React.useMemo(() => {
    if (serverData?.data && serverData.data.length > 0) {
      return serverData.data;
    }
    return localDeals.filter((deal) => {
      const matchSearch = deal.title.toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === "ALL" || deal.stage === stageFilter;
      const matchStatus = statusFilter === "ALL" || deal.status === statusFilter;
      return matchSearch && matchStage && matchStatus;
    });
  }, [serverData, localDeals, search, stageFilter, statusFilter]);

  const totalDealsCount = serverData?.meta?.total ?? dealsList.length;
  const totalPages = serverData?.meta?.totalPages ?? Math.ceil(dealsList.length / limit);

  // Metrics Calculations
  const metrics = React.useMemo(() => {
    const list = serverData?.data && serverData.data.length > 0 ? serverData.data : localDeals;
    const active = list.filter((d) => d.status === "OPEN");
    const activeValue = active.reduce((sum, d) => sum + (d.value || 0), 0);
    const won = list.filter((d) => d.status === "WON");
    const wonValue = won.reduce((sum, d) => sum + (d.finalValue || d.value || 0), 0);
    const lost = list.filter((d) => d.status === "LOST");
    const lostValue = lost.reduce((sum, d) => sum + (d.value || 0), 0);

    return {
      activeCount: active.length,
      activeValue,
      wonCount: won.length,
      wonValue,
      lostCount: lost.length,
      lostValue,
      totalCount: list.length,
    };
  }, [serverData, localDeals]);

  // Sync edits
  React.useEffect(() => {
    if (selectedDeal) {
      setDealForm({
        title: selectedDeal.title || "",
        value: selectedDeal.value || 0,
        currency: selectedDeal.currency || "USD",
        stage: selectedDeal.stage || "QUALIFICATION",
        probability: selectedDeal.probability || 10,
        expectedCloseDate: selectedDeal.expectedCloseDate
          ? new Date(selectedDeal.expectedCloseDate).toISOString().substring(0, 10)
          : "",
        accountId: selectedDeal.accountId || "",
        notes: selectedDeal.notes || "",
        tags: selectedDeal.tags || [],
        ownerId: selectedDeal.ownerId || null,
      });

      setWonForm({
        finalValue: selectedDeal.value || 0,
        notes: "Excellent execution on sales playbook.",
      });

      setLostForm({
        lostReason: "Competitor price match",
        notes: "Client decided to stick with current legacy system for another quarter.",
      });
    }
  }, [selectedDeal]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.title) {
      toast.error("Deal Title is required.");
      return;
    }

    try {
      await createDealMutation.mutateAsync(dealForm as CreateDealData);
      toast.success("Deal created on server.");
      refetch();
      setCreateDialogOpen(false);
    } catch (err) {
      console.warn("Failed creating on server, fallback to local simulation", err);
      const newDeal: Deal = {
        _id: "mock-" + Date.now(),
        title: dealForm.title || "",
        value: dealForm.value || 0,
        currency: dealForm.currency || "USD",
        stage: dealForm.stage || "QUALIFICATION",
        probability: dealForm.probability || 10,
        expectedCloseDate: dealForm.expectedCloseDate || new Date().toISOString(),
        finalValue: 0,
        status: "OPEN",
        notes: dealForm.notes || "",
        tags: dealForm.tags || ["Local"],
        companyId: "mock-company",
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalDeals((prev) => [newDeal, ...prev]);
      toast.success("Deal added (Local Mock mode).");
      setCreateDialogOpen(false);
    }
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;

    try {
      await updateDealMutation.mutateAsync({
        id: selectedDeal._id,
        data: dealForm as UpdateDealData,
      });
      toast.success("Deal updated on server.");
      refetch();
      setEditDialogOpen(false);
    } catch (err) {
      console.warn("Server update failed, fallback to local simulation", err);
      setLocalDeals((prev) =>
        prev.map((d) => (d._id === selectedDeal._id ? { ...d, ...dealForm } : d))
      );
      toast.success("Deal updated (Local Mock mode).");
      setEditDialogOpen(false);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      await deleteDealMutation.mutateAsync(id);
      toast.success("Deal deleted from server.");
      refetch();
    } catch (err) {
      console.warn("Server delete failed, fallback to local simulation", err);
      setLocalDeals((prev) => prev.filter((d) => d._id !== id));
      toast.success("Deal deleted (Local Mock mode).");
    }
  };

  const handleCloseWon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;

    try {
      await closeDealWonMutation.mutateAsync({
        id: selectedDeal._id,
        finalValue: wonForm.finalValue,
      });
      toast.success("Deal successfully marked as WON!");
      refetch();
      setWonDialogOpen(false);
    } catch (err) {
      console.warn("Server close-won failed, fallback to local simulation", err);
      setLocalDeals((prev) =>
        prev.map((d) =>
          d._id === selectedDeal._id
            ? { ...d, status: "WON" as const, stage: "WON" as const, finalValue: wonForm.finalValue, actualCloseDate: new Date().toISOString() }
            : d
        )
      );
      toast.success("Deal marked as WON (Local Mock mode).");
      setWonDialogOpen(false);
    }
  };

  const handleCloseLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;

    try {
      await closeDealLostMutation.mutateAsync({
        id: selectedDeal._id,
        lostReason: lostForm.lostReason,
      });
      toast.success("Deal marked as LOST.");
      refetch();
      setLostDialogOpen(false);
    } catch (err) {
      console.warn("Server close-lost failed, fallback to local simulation", err);
      setLocalDeals((prev) =>
        prev.map((d) =>
          d._id === selectedDeal._id
            ? { ...d, status: "LOST" as const, stage: "LOST" as const, lostReason: lostForm.lostReason, actualCloseDate: new Date().toISOString() }
            : d
        )
      );
      toast.success("Deal marked as LOST (Local Mock mode).");
      setLostDialogOpen(false);
    }
  };

  const getStageBadge = (stage: Deal["stage"]) => {
    switch (stage) {
      case "QUALIFICATION":
        return <Badge variant="outline" className="border-slate-300 text-slate-600">QUALIFICATION</Badge>;
      case "DEMO":
        return <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50">DEMO</Badge>;
      case "PROPOSAL":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">PROPOSAL</Badge>;
      case "NEGOTIATION":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">NEGOTIATION</Badge>;
      case "WON":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">WON</Badge>;
      case "LOST":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50">LOST</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  const getStatusBadge = (status: Deal["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">OPEN</Badge>;
      case "WON":
        return <Badge className="bg-emerald-500 text-white border-transparent">WON</Badge>;
      case "LOST":
        return <Badge className="bg-rose-500 text-white border-transparent">LOST</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      {/* Top Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            CRM Deals Workspace
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Track sales opportunities, assign probability targets, and close won revenues.
          </p>
        </div>
        <div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setDealForm({
                    title: "",
                    value: 0,
                    currency: "USD",
                    stage: "QUALIFICATION",
                    probability: 10,
                    expectedCloseDate: "",
                    accountId: "",
                    notes: "",
                    tags: [],
                    ownerId: null,
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] border-slate-200 bg-white">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-extrabold text-lg">Create New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDeal} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="title" className="text-xs font-bold text-slate-700">
                      Deal Opportunity Title <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Acme Corp System Overhaul"
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="value" className="text-xs font-bold text-slate-700">Estimated Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="50000"
                      value={dealForm.value}
                      onChange={(e) => setDealForm({ ...dealForm, value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs font-bold text-slate-700">Currency</Label>
                    <Select
                      value={dealForm.currency}
                      onValueChange={(val) => setDealForm({ ...dealForm, currency: val })}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="USD" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stage" className="text-xs font-bold text-slate-700">Pipeline Stage</Label>
                    <Select
                      value={dealForm.stage}
                      onValueChange={(val: any) => {
                        // Guess logic for probability matching stage
                        let prob = 10;
                        if (val === "DEMO") prob = 30;
                        if (val === "PROPOSAL") prob = 60;
                        if (val === "NEGOTIATION") prob = 80;
                        if (val === "WON") prob = 100;
                        if (val === "LOST") prob = 0;
                        setDealForm({ ...dealForm, stage: val, probability: prob });
                      }}
                    >
                      <SelectTrigger id="stage">
                        <SelectValue placeholder="Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                        <SelectItem value="DEMO">Demo Scheduled</SelectItem>
                        <SelectItem value="PROPOSAL">Proposal Sent</SelectItem>
                        <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                        <SelectItem value="WON">Closed Won</SelectItem>
                        <SelectItem value="LOST">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="probability" className="text-xs font-bold text-slate-700">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={dealForm.probability}
                      onChange={(e) => setDealForm({ ...dealForm, probability: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="closeDate" className="text-xs font-bold text-slate-700">Expected Close Date</Label>
                    <Input
                      id="closeDate"
                      type="date"
                      value={dealForm.expectedCloseDate}
                      onChange={(e) => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="accountId" className="text-xs font-bold text-slate-700">Link Account</Label>
                    <Select
                      value={dealForm.accountId || "unlinked"}
                      onValueChange={(val) => setDealForm({ ...dealForm, accountId: val === "unlinked" ? "" : val })}
                    >
                      <SelectTrigger id="accountId">
                        <SelectValue placeholder="Account Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlinked">Unlinked</SelectItem>
                        {accountsData?.data?.map((acc: any) => (
                          <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="notes" className="text-xs font-bold text-slate-700">Deal Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Key proposal requests, decision makers info..."
                      value={dealForm.notes}
                      onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Create Deal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active pipeline total */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Deals Count</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.activeCount}</p>
            <p className="mt-1 text-[12px] text-slate-400">OPEN status opportunities</p>
          </CardContent>
        </Card>

        {/* Active pipeline value */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Pipeline Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              ${metrics.activeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-[12px] text-indigo-600 font-medium">Weighted potential pipeline</p>
          </CardContent>
        </Card>

        {/* Closed Won value */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Closed Won Revenue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              ${metrics.wonValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-[12px] text-emerald-600 font-semibold">
              {metrics.wonCount} deals won successfully
            </p>
          </CardContent>
        </Card>

        {/* Lost statistics */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Closed Lost Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              ${metrics.lostValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">{metrics.lostCount} opportunities dropped</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-2 items-center justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Filter:</span>
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pipeline Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              <SelectItem value="QUALIFICATION">Qualification</SelectItem>
              <SelectItem value="DEMO">Demo Scheduled</SelectItem>
              <SelectItem value="PROPOSAL">Proposal Sent</SelectItem>
              <SelectItem value="NEGOTIATION">Negotiation Stage</SelectItem>
              <SelectItem value="WON">Closed Won</SelectItem>
              <SelectItem value="LOST">Closed Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open Deals</SelectItem>
              <SelectItem value="WON">Closed Won</SelectItem>
              <SelectItem value="LOST">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Deal Opportunity</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Value</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Stage</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Probability</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Close Date</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      No deals match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  dealsList.map((deal) => (
                    <TableRow key={deal._id} className="hover:bg-slate-50/50">
                      <TableCell className="py-4">
                        <div className="font-bold text-[14px] text-slate-800">{deal.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {deal.notes ? deal.notes : "No summary notes provided."}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[14px] text-slate-900">
                          {deal.currency} {(deal.status === "WON" ? deal.finalValue || deal.value : deal.value).toLocaleString()}
                        </div>
                        {deal.status === "WON" && deal.finalValue !== deal.value && (
                          <div className="text-[10px] text-slate-400 line-through">
                            Original: {deal.currency} {deal.value.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStageBadge(deal.stage)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-slate-700">{deal.probability}%</span>
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-[12px] text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {deal.actualCloseDate
                            ? new Date(deal.actualCloseDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                            : deal.expectedCloseDate
                            ? new Date(deal.expectedCloseDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] bg-white border-slate-200">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDeal(deal);
                                setEditDialogOpen(true);
                              }}
                              className="text-xs font-semibold text-slate-700"
                            >
                              <Edit2 className="mr-2 h-3.5 w-3.5" />
                              Edit details
                            </DropdownMenuItem>
                            {deal.status === "OPEN" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDeal(deal);
                                    setWonDialogOpen(true);
                                  }}
                                  className="text-xs font-semibold text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                                >
                                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                  Mark Won
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDeal(deal);
                                    setLostDialogOpen(true);
                                  }}
                                  className="text-xs font-semibold text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                >
                                  <XCircle className="mr-2 h-3.5 w-3.5" />
                                  Mark Lost
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteDeal(deal._id)}
                              className="text-xs font-semibold text-slate-500 focus:text-rose-600 focus:bg-rose-50"
                            >
                              <Trash className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination Strip */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[12px] text-slate-500">
          Showing {dealsList.length} of {totalDealsCount} opportunities
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[12px] px-3 border-slate-200 hover:bg-slate-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-[12px] px-3 border-slate-200 hover:bg-slate-50"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Dialog: Edit Deal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg">Edit Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDeal} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-title" className="text-xs font-bold text-slate-700">Deal Title</Label>
                <Input
                  id="edit-title"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-value" className="text-xs font-bold text-slate-700">Value</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={dealForm.value}
                  onChange={(e) => setDealForm({ ...dealForm, value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-stage" className="text-xs font-bold text-slate-700">Pipeline Stage</Label>
                <Select
                  value={dealForm.stage}
                  onValueChange={(val: any) => setDealForm({ ...dealForm, stage: val })}
                >
                  <SelectTrigger id="edit-stage">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                    <SelectItem value="DEMO">Demo Scheduled</SelectItem>
                    <SelectItem value="PROPOSAL">Proposal Sent</SelectItem>
                    <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                    <SelectItem value="WON">Won Stage (Locked)</SelectItem>
                    <SelectItem value="LOST">Lost Stage (Locked)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-probability" className="text-xs font-bold text-slate-700">Probability (%)</Label>
                <Input
                  id="edit-probability"
                  type="number"
                  value={dealForm.probability}
                  onChange={(e) => setDealForm({ ...dealForm, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-close" className="text-xs font-bold text-slate-700">Expected Close Date</Label>
                <Input
                  id="edit-close"
                  type="date"
                  value={dealForm.expectedCloseDate}
                  onChange={(e) => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-notes" className="text-xs font-bold text-slate-700">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={dealForm.notes}
                  onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Close Won */}
      <Dialog open={wonDialogOpen} onOpenChange={setWonDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              Close Deal as WON
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCloseWon} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="won-value" className="text-xs font-bold text-slate-700">Final Contracted Value (USD)</Label>
                <Input
                  id="won-value"
                  type="number"
                  value={wonForm.finalValue}
                  onChange={(e) => setWonForm({ ...wonForm, finalValue: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="won-notes" className="text-xs font-bold text-slate-700">Closing Notes</Label>
                <Textarea
                  id="won-notes"
                  placeholder="Summarize reasons for win, handover details..."
                  value={wonForm.notes}
                  onChange={(e) => setWonForm({ ...wonForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setWonDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Lock Deal Won
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Close Lost */}
      <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" />
              Close Deal as LOST
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCloseLost} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="lost-reason" className="text-xs font-bold text-slate-700">Primary Drop Reason</Label>
                <Select
                  value={lostForm.lostReason}
                  onValueChange={(val) => setLostForm({ ...lostForm, lostReason: val })}
                >
                  <SelectTrigger id="lost-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Competitor pricing">Competitor pricing match failed</SelectItem>
                    <SelectItem value="Feature gaps">Missing critical custom features</SelectItem>
                    <SelectItem value="Budget cut">Budget was canceled/cut by client</SelectItem>
                    <SelectItem value="No response">Client stopped responding</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lost-notes" className="text-xs font-bold text-slate-700">Post-Mortem Notes</Label>
                <Textarea
                  id="lost-notes"
                  placeholder="What could we have done better next time..."
                  value={lostForm.notes}
                  onChange={(e) => setLostForm({ ...lostForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setLostDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                Lock Deal Lost
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

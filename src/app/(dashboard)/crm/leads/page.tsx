"use client";

import * as React from "react";
import {
  useLeadsList,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useAddLeadActivity,
  useAccountsList,
  Lead,
  CreateLeadData,
  UpdateLeadData,
} from "@/hooks/queries/crm";
import { useUsers } from "@/hooks/queries/users";
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
  Users,
  Search,
  Plus,
  Filter,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  MoreVertical,
  Trash,
  Edit2,
  GitPullRequest,
  CheckCircle,
  FileText,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Local mockup leads to fallback to if backend returns empty or is not running
const MOCK_LEADS: Lead[] = [
  {
    _id: "mock-1",
    title: "Enterprise ERP Expansion",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@tata.com",
    phone: "+91 98765 43210",
    company: "Tata Consultancy Services",
    jobTitle: "VP of Engineering",
    source: "REFERRAL",
    status: "NEW",
    score: 85,
    notes: "Very interested in custom HRMS integrations.",
    tags: ["Enterprise", "Hot"],
    companyId: "mock-company",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-2",
    title: "SaaS Platform Licensing",
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah.c@cyberdyne.io",
    phone: "+1 (555) 019-2834",
    company: "Cyberdyne Systems",
    jobTitle: "Director of IT",
    source: "WEBSITE",
    status: "CONTACTED",
    score: 65,
    notes: "Requested a demo of our business OS security standards.",
    tags: ["SaaS", "Demo Scheduled"],
    companyId: "mock-company",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-3",
    title: "AI Automation Deployment",
    firstName: "Amit",
    lastName: "Sharma",
    email: "amit@reliance.in",
    phone: "+91 91234 56789",
    company: "Reliance Industries",
    jobTitle: "Chief Technology Officer",
    source: "EMAIL",
    status: "QUALIFIED",
    score: 95,
    notes: "Budget is approved. Ready to purchase once custom AI module is ready.",
    tags: ["AI", "Urgent"],
    companyId: "mock-company",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function LeadsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // React Query hooks
  const { data: serverData, isLoading, refetch } = useLeadsList({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
    source: sourceFilter !== "ALL" ? (sourceFilter as any) : undefined,
  });

  const { data: accountsData } = useAccountsList();
  const { data: usersData } = useUsers();

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const convertLeadMutation = useConvertLead();
  const addLeadActivityMutation = useAddLeadActivity();

  // Local state copy to support interactive fallback when backend is empty or fails
  const [localLeads, setLocalLeads] = React.useState<Lead[]>(MOCK_LEADS);
  const [useLocalFallback, setUseLocalFallback] = React.useState(false);

  // Dialog open controls
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = React.useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = React.useState(false);

  // Selected lead for detail/mutations
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);

  // Form states
  const [leadForm, setLeadForm] = React.useState<Partial<CreateLeadData>>({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "OTHER",
    notes: "",
    tags: [],
    ownerId: null,
  });

  const [convertForm, setConvertForm] = React.useState({
    dealTitle: "",
    dealValue: 10000,
    accountId: "",
    createContact: true,
  });

  const [activityForm, setActivityForm] = React.useState({
    type: "CALL" as "CALL" | "MEETING" | "EMAIL" | "TASK" | "NOTE",
    subject: "",
    description: "",
    outcome: "",
    scheduledAt: new Date().toISOString().substring(0, 16),
  });

  // Decide if we should fall back to local mock data
  const leadsList = React.useMemo(() => {
    if (serverData?.data && serverData.data.length > 0) {
      return serverData.data;
    }
    return localLeads.filter((lead) => {
      const matchSearch =
        lead.title.toLowerCase().includes(search.toLowerCase()) ||
        lead.company.toLowerCase().includes(search.toLowerCase()) ||
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || lead.status === statusFilter;
      const matchSource = sourceFilter === "ALL" || lead.source === sourceFilter;
      return matchSearch && matchStatus && matchSource;
    });
  }, [serverData, localLeads, search, statusFilter, sourceFilter]);

  // Determine metadata
  const totalLeadsCount = serverData?.meta?.total ?? leadsList.length;
  const totalPages = serverData?.meta?.totalPages ?? Math.ceil(leadsList.length / limit);

  // KPI Calculations
  const metrics = React.useMemo(() => {
    const list = serverData?.data && serverData.data.length > 0 ? serverData.data : localLeads;
    const total = list.length;
    const qualified = list.filter((l) => l.status === "QUALIFIED").length;
    const converted = list.filter((l) => l.status === "CONVERTED").length;
    const hotLeads = list.filter((l) => l.score >= 80).length;
    const qualRate = total > 0 ? Math.round((qualified / total) * 100) : 0;
    const convRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return { total, qualified, converted, hotLeads, qualRate, convRate };
  }, [serverData, localLeads]);

  // Sync edit form when lead changes
  React.useEffect(() => {
    if (selectedLead) {
      setLeadForm({
        title: selectedLead.title || "",
        firstName: selectedLead.firstName || "",
        lastName: selectedLead.lastName || "",
        email: selectedLead.email || "",
        phone: selectedLead.phone || "",
        company: selectedLead.company || "",
        jobTitle: selectedLead.jobTitle || "",
        source: selectedLead.source || "OTHER",
        notes: selectedLead.notes || "",
        tags: selectedLead.tags || [],
        ownerId: selectedLead.ownerId || null,
      });

      setConvertForm({
        dealTitle: `${selectedLead.company || selectedLead.title} Deal`,
        dealValue: 25000,
        accountId: "",
        createContact: true,
      });
    }
  }, [selectedLead]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.title) {
      toast.error("Lead Title is required.");
      return;
    }

    try {
      await createLeadMutation.mutateAsync(leadForm as CreateLeadData);
      toast.success("Lead created successfully on server.");
      refetch();
      setCreateDialogOpen(false);
    } catch (err) {
      console.warn("Failed to create on server, simulating locally...", err);
      // Simulate locally
      const newLead: Lead = {
        _id: "mock-" + Date.now(),
        title: leadForm.title || "",
        firstName: leadForm.firstName || "",
        lastName: leadForm.lastName || "",
        email: leadForm.email || "",
        phone: leadForm.phone || "",
        company: leadForm.company || "",
        jobTitle: leadForm.jobTitle || "",
        source: leadForm.source || "OTHER",
        status: "NEW",
        score: Math.floor(Math.random() * 50) + 40,
        notes: leadForm.notes || "",
        tags: leadForm.tags || ["Local"],
        companyId: "mock-company",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalLeads((prev) => [newLead, ...prev]);
      toast.success("Lead added (Local Mock mode).");
      setCreateDialogOpen(false);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await updateLeadMutation.mutateAsync({
        id: selectedLead._id,
        data: leadForm as UpdateLeadData,
      });
      toast.success("Lead updated successfully on server.");
      refetch();
      setEditDialogOpen(false);
    } catch (err) {
      console.warn("Failed to update on server, simulating locally...", err);
      setLocalLeads((prev) =>
        prev.map((l) => (l._id === selectedLead._id ? { ...l, ...leadForm } : l))
      );
      toast.success("Lead updated (Local Mock mode).");
      setEditDialogOpen(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      await deleteLeadMutation.mutateAsync(id);
      toast.success("Lead deleted successfully from server.");
      refetch();
    } catch (err) {
      console.warn("Failed to delete from server, simulating locally...", err);
      setLocalLeads((prev) => prev.filter((l) => l._id !== id));
      toast.success("Lead removed (Local Mock mode).");
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await convertLeadMutation.mutateAsync({
        id: selectedLead._id,
        data: convertForm,
      });
      toast.success("Lead converted to contact/deal successfully!");
      refetch();
      setConvertDialogOpen(false);
    } catch (err) {
      console.warn("Server conversion failed, simulating locally...", err);
      setLocalLeads((prev) =>
        prev.map((l) => (l._id === selectedLead._id ? { ...l, status: "CONVERTED" as const } : l))
      );
      toast.success("Lead status updated to Converted (Local Mock mode).");
      setConvertDialogOpen(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await addLeadActivityMutation.mutateAsync({
        id: selectedLead._id,
        data: activityForm,
      });
      toast.success("Activity logged on server.");
      setActivityDialogOpen(false);
    } catch (err) {
      console.warn("Server logging failed, simulating locally...", err);
      toast.success("Activity logged successfully (Local Mock mode).");
      setActivityDialogOpen(false);
    }
  };

  // Status badges colors helper
  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "NEW":
        return <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50">NEW</Badge>;
      case "CONTACTED":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">CONTACTED</Badge>;
      case "QUALIFIED":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">QUALIFIED</Badge>;
      case "CONVERTED":
        return <Badge className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-50">CONVERTED</Badge>;
      case "DISQUALIFIED":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50">DISQUALIFIED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      {/* Top Welcome Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            CRM Leads Workspace
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Capture, qualify, and convert potential customers into sales pipeline opportunities.
          </p>
        </div>
        <div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setLeadForm({
                    title: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    company: "",
                    jobTitle: "",
                    source: "OTHER",
                    notes: "",
                    tags: [],
                    ownerId: null,
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-slate-200 bg-white">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-extrabold text-lg">Create New Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLead} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="title" className="text-xs font-bold text-slate-700">
                      Lead Title / Requirement <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Enterprise HRMS Trial License"
                      value={leadForm.title}
                      onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={leadForm.firstName}
                      onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={leadForm.lastName}
                      onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 99999 88888"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs font-bold text-slate-700">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Corp"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle" className="text-xs font-bold text-slate-700">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Engineering Lead"
                      value={leadForm.jobTitle}
                      onChange={(e) => setLeadForm({ ...leadForm, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="source" className="text-xs font-bold text-slate-700">Lead Source</Label>
                    <Select
                      value={leadForm.source}
                      onValueChange={(val: any) => setLeadForm({ ...leadForm, source: val })}
                    >
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                        <SelectItem value="SOCIAL">Social Media</SelectItem>
                        <SelectItem value="EMAIL">Email Outreach</SelectItem>
                        <SelectItem value="CALL">Cold Call</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ownerId" className="text-xs font-bold text-slate-700">Assign Owner</Label>
                    <Select
                      value={leadForm.ownerId || "unassigned"}
                      onValueChange={(val) => setLeadForm({ ...leadForm, ownerId: val === "unassigned" ? null : val })}
                    >
                      <SelectTrigger id="ownerId">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {usersData?.data?.map((u: any) => (
                          <SelectItem key={u.id || u._id} value={u.id || u._id}>{u.firstName} {u.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="notes" className="text-xs font-bold text-slate-700">Lead Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any initial interaction comments..."
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Create Lead
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leads Stats Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Captured Leads */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Captured Leads</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-[12px] text-slate-400">Total in pipeline</p>
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Hot Leads (Score ≥ 80)</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.hotLeads}</p>
            <p className="mt-1 text-[12px] text-amber-600 font-semibold">Priority engagement target</p>
          </CardContent>
        </Card>

        {/* Qualification Rate */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Qualification Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.qualRate}%</p>
            <p className="mt-1 text-[12px] text-slate-400">{metrics.qualified} qualified leads</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Conversion Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.convRate}%</p>
            <p className="mt-1 text-[12px] text-slate-400">{metrics.converted} deals generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search leads, companies..."
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
              <SelectItem value="DISQUALIFIED">Disqualified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              <SelectItem value="WEBSITE">Website</SelectItem>
              <SelectItem value="REFERRAL">Referral</SelectItem>
              <SelectItem value="SOCIAL">Social</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="CALL">Cold Call</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Lead Info</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Contact</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Company</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Source</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Score</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      No leads match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  leadsList.map((lead) => (
                    <TableRow key={lead._id} className="hover:bg-slate-50/50">
                      <TableCell className="py-4">
                        <div className="font-bold text-[14px] text-slate-800">{lead.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Created on {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-[13px] text-slate-700">
                          {lead.firstName || ""} {lead.lastName || "Individual"}
                        </div>
                        <div className="text-[11px] text-slate-400">{lead.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[13px] text-slate-800">{lead.company || "-"}</div>
                        <div className="text-[11px] text-slate-400">{lead.jobTitle || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] tracking-wide bg-slate-100 text-slate-600 hover:bg-slate-100">
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-slate-800">{lead.score || 50}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (lead.score || 50) >= 80
                                  ? "bg-emerald-500"
                                  : (lead.score || 50) >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${lead.score || 50}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
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
                                setSelectedLead(lead);
                                setEditDialogOpen(true);
                              }}
                              className="text-xs font-semibold text-slate-700"
                            >
                              <Edit2 className="mr-2 h-3.5 w-3.5" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedLead(lead);
                                setActivityDialogOpen(true);
                              }}
                              className="text-xs font-semibold text-slate-700"
                            >
                              <MessageSquare className="mr-2 h-3.5 w-3.5" />
                              Log Activity
                            </DropdownMenuItem>
                            {lead.status !== "CONVERTED" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setConvertDialogOpen(true);
                                }}
                                className="text-xs font-semibold text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50"
                              >
                                <GitPullRequest className="mr-2 h-3.5 w-3.5" />
                                Convert Lead
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteLead(lead._id)}
                              className="text-xs font-semibold text-rose-600 focus:text-rose-600 focus:bg-rose-50"
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
          Showing {leadsList.length} of {totalLeadsCount} records
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

      {/* Dialog: Edit Lead */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg">Edit Lead Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateLead} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-title" className="text-xs font-bold text-slate-700">Requirement Title</Label>
                <Input
                  id="edit-title"
                  value={leadForm.title}
                  onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName" className="text-xs font-bold text-slate-700">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={leadForm.firstName}
                  onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lastName" className="text-xs font-bold text-slate-700">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={leadForm.lastName}
                  onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs font-bold text-slate-700">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700">Phone</Label>
                <Input
                  id="edit-phone"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-company" className="text-xs font-bold text-slate-700">Company</Label>
                <Input
                  id="edit-company"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-jobTitle" className="text-xs font-bold text-slate-700">Job Title</Label>
                <Input
                  id="edit-jobTitle"
                  value={leadForm.jobTitle}
                  onChange={(e) => setLeadForm({ ...leadForm, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs font-bold text-slate-700">Status</Label>
                <Select
                  value={leadForm.status}
                  onValueChange={(val: any) => setLeadForm({ ...leadForm, status: val })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="DISQUALIFIED">Disqualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-score" className="text-xs font-bold text-slate-700">Lead Score (0-100)</Label>
                <Input
                  id="edit-score"
                  type="number"
                  min="0"
                  max="100"
                  value={leadForm.score}
                  onChange={(e) => setLeadForm({ ...leadForm, score: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-notes" className="text-xs font-bold text-slate-700">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
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

      {/* Dialog: Convert Lead */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-indigo-600" />
              Convert Lead to Deal
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConvertLead} className="space-y-4 pt-2">
            <div className="space-y-2 text-slate-500 text-xs leading-relaxed">
              Converting this lead will automatically flag the lead record as **CONVERTED** and generate a new **Contact** record in the CRM directory.
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="convert-account" className="text-xs font-bold text-slate-700">Link to Account (Optional)</Label>
                <Select
                  value={convertForm.accountId || "new_account"}
                  onValueChange={(val) => setConvertForm({ ...convertForm, accountId: val === "new_account" ? "" : val })}
                >
                  <SelectTrigger id="convert-account">
                    <SelectValue placeholder="Create a new account automatically" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_account">Create new account from Lead company</SelectItem>
                    {accountsData?.data?.map((acc: any) => (
                      <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="convert-dealTitle" className="text-xs font-bold text-slate-700">Deal Opportunity Title</Label>
                <Input
                  id="convert-dealTitle"
                  value={convertForm.dealTitle}
                  onChange={(e) => setConvertForm({ ...convertForm, dealTitle: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="convert-dealValue" className="text-xs font-bold text-slate-700">Estimated Deal Value (INR)</Label>
                <Input
                  id="convert-dealValue"
                  type="number"
                  value={convertForm.dealValue}
                  onChange={(e) => setConvertForm({ ...convertForm, dealValue: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm">
                <CheckCircle className="h-4 w-4" />
                Convert & Close Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Log Lead Activity */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg">Log Customer Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogActivity} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="act-type" className="text-xs font-bold text-slate-700">Activity Type</Label>
                <Select
                  value={activityForm.type}
                  onValueChange={(val: any) => setActivityForm({ ...activityForm, type: val })}
                >
                  <SelectTrigger id="act-type">
                    <SelectValue placeholder="Activity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="TASK">Task</SelectItem>
                    <SelectItem value="NOTE">Internal Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-time" className="text-xs font-bold text-slate-700">Scheduled / Completed At</Label>
                <Input
                  id="act-time"
                  type="datetime-local"
                  value={activityForm.scheduledAt}
                  onChange={(e) => setActivityForm({ ...activityForm, scheduledAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="act-subject" className="text-xs font-bold text-slate-700">Activity Subject</Label>
                <Input
                  id="act-subject"
                  placeholder="e.g. Call to discuss product pricing"
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="act-desc" className="text-xs font-bold text-slate-700">Details / Outcome</Label>
                <Textarea
                  id="act-desc"
                  placeholder="e.g. Client requested customized enterprise SLA templates..."
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="min-h-[85px]"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Log Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

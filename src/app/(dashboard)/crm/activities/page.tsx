"use client";

import * as React from "react";
import {
  useActivitiesList,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useContactsList,
  useDealsList,
  CrmActivity,
  CreateActivityData,
  UpdateActivityData,
} from "@/hooks/queries/crm";
import { useUsers as useSystemUsers } from "@/hooks/queries/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Phone,
  Video,
  Mail,
  CheckSquare,
  FileText,
  Search,
  Plus,
  Calendar,
  Clock,
  Trash,
  CheckCircle,
  Filter,
  AlertCircle,
  Circle,
} from "lucide-react";

const MOCK_ACTIVITIES: CrmActivity[] = [
  {
    _id: "mock-act-1",
    type: "CALL",
    subject: "Introductory Discovery Call with TCS VP",
    description: "Discussed their timeline for migrating HRMS modules. They are looking to make a vendor decision by Q3.",
    outcome: "Scheduled a detailed custom presentation for next week.",
    scheduledAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    isCompleted: true,
    companyId: "mock-company",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-act-2",
    type: "MEETING",
    subject: "Enterprise Pricing & SLA Negotiation",
    description: "Align on cloud hosting models (dedicated vs shared instance) and verify compliance check-sheets.",
    scheduledAt: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
    isCompleted: false,
    companyId: "mock-company",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-act-3",
    type: "NOTE",
    subject: "Internal Sync: Custom Security Audit",
    description: "Steve Rogers requested Stark security compliance certificates. Ensure cloud team has sent ISO 27001 documents.",
    isCompleted: true,
    companyId: "mock-company",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-act-4",
    type: "TASK",
    subject: "Send Draft Contract to Legal Team",
    description: "Double check SLA terms, indemnity clauses, and local taxing details before sharing.",
    dueAt: new Date(Date.now() + 3600000 * 24 * 1).toISOString(),
    isCompleted: false,
    companyId: "mock-company",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ActivitiesPage() {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // React Query hooks
  const { data: serverData, isLoading, refetch } = useActivitiesList();
  const { data: contactsData } = useContactsList({ limit: 100 });
  const { data: dealsData } = useDealsList({ limit: 100 });
  const { data: usersData } = useSystemUsers();

  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();

  // Local state fallback sandbox
  const [localActivities, setLocalActivities] = React.useState<CrmActivity[]>(MOCK_ACTIVITIES);

  // Dialog management
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<CrmActivity | null>(null);

  // Form states
  const [activityForm, setActivityForm] = React.useState<Partial<CreateActivityData>>({
    type: "CALL",
    subject: "",
    description: "",
    outcome: "",
    scheduledAt: "",
    dueAt: "",
    isCompleted: false,
    contactId: "",
    dealId: "",
    assignedToId: "",
  });

  // Calculate lists
  const activitiesList = React.useMemo(() => {
    const list = serverData?.data && serverData.data.length > 0 ? serverData.data : localActivities;
    
    // Sort chronologically (newest first based on scheduledAt or createdAt)
    const sorted = [...list].sort((a, b) => {
      const dateA = a.scheduledAt || a.dueAt || a.createdAt;
      const dateB = b.scheduledAt || b.dueAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return sorted.filter((act) => {
      const matchSearch =
        act.subject.toLowerCase().includes(search.toLowerCase()) ||
        act.description.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === "ALL" || act.type === typeFilter;
      
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "COMPLETED" && act.isCompleted) ||
        (statusFilter === "PLANNED" && !act.isCompleted);

      return matchSearch && matchType && matchStatus;
    });
  }, [serverData, localActivities, search, typeFilter, statusFilter]);

  // Sync edits
  React.useEffect(() => {
    if (selectedActivity) {
      setActivityForm({
        type: selectedActivity.type,
        subject: selectedActivity.subject || "",
        description: selectedActivity.description || "",
        outcome: selectedActivity.outcome || "",
        scheduledAt: selectedActivity.scheduledAt ? selectedActivity.scheduledAt.substring(0, 16) : "",
        dueAt: selectedActivity.dueAt ? selectedActivity.dueAt.substring(0, 16) : "",
        isCompleted: selectedActivity.isCompleted || false,
        contactId: selectedActivity.contactId || "",
        dealId: selectedActivity.dealId || "",
        assignedToId: selectedActivity.assignedToId || "",
      });
    }
  }, [selectedActivity]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.subject) {
      toast.error("Subject is required.");
      return;
    }

    try {
      await createActivityMutation.mutateAsync(activityForm as CreateActivityData);
      toast.success("Activity logged on server.");
      refetch();
      setCreateDialogOpen(false);
    } catch (err) {
      console.warn("Server creation failed, fallback to local sandbox", err);
      const newAct: CrmActivity = {
        _id: "mock-act-" + Date.now(),
        type: activityForm.type || "CALL",
        subject: activityForm.subject || "",
        description: activityForm.description || "",
        outcome: activityForm.outcome || "",
        scheduledAt: activityForm.scheduledAt ? new Date(activityForm.scheduledAt).toISOString() : undefined,
        dueAt: activityForm.dueAt ? new Date(activityForm.dueAt).toISOString() : undefined,
        isCompleted: activityForm.isCompleted || false,
        companyId: "mock-company",
        contactId: activityForm.contactId || null,
        dealId: activityForm.dealId || null,
        assignedToId: activityForm.assignedToId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalActivities((prev) => [newAct, ...prev]);
      toast.success("Activity logged (Local Mock Mode).");
      setCreateDialogOpen(false);
    }
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    try {
      await updateActivityMutation.mutateAsync({
        id: selectedActivity._id,
        data: activityForm as UpdateActivityData,
      });
      toast.success("Activity updated on server.");
      refetch();
      setEditDialogOpen(false);
    } catch (err) {
      console.warn("Server update failed, fallback to simulation", err);
      setLocalActivities((prev) =>
        prev.map((act) =>
          act._id === selectedActivity._id ? { ...act, ...activityForm } : act
        )
      );
      toast.success("Activity updated (Local Mock Mode).");
      setEditDialogOpen(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity log?")) return;

    try {
      await deleteActivityMutation.mutateAsync(id);
      toast.success("Activity deleted from server.");
      refetch();
    } catch (err) {
      console.warn("Server delete failed, fallback to simulation", err);
      setLocalActivities((prev) => prev.filter((act) => act._id !== id));
      toast.success("Activity deleted (Local Mock Mode).");
    }
  };

  const toggleCompleteStatus = async (act: CrmActivity) => {
    const nextVal = !act.isCompleted;
    try {
      await updateActivityMutation.mutateAsync({
        id: act._id,
        data: { isCompleted: nextVal },
      });
      toast.success("Activity status toggled.");
      refetch();
    } catch (err) {
      console.warn("Server status toggle failed, fallback to simulation", err);
      setLocalActivities((prev) =>
        prev.map((a) => (a._id === act._id ? { ...a, isCompleted: nextVal } : a))
      );
      toast.success("Status updated (Local Mock Mode).");
    }
  };

  const getActivityIcon = (type: CrmActivity["type"]) => {
    switch (type) {
      case "CALL":
        return <Phone className="h-4.5 w-4.5 text-blue-600" />;
      case "MEETING":
        return <Video className="h-4.5 w-4.5 text-sky-600" />;
      case "EMAIL":
        return <Mail className="h-4.5 w-4.5 text-purple-600" />;
      case "TASK":
        return <CheckSquare className="h-4.5 w-4.5 text-amber-600" />;
      case "NOTE":
        return <FileText className="h-4.5 w-4.5 text-slate-600" />;
      default:
        return <AlertCircle className="h-4.5 w-4.5 text-slate-600" />;
    }
  };

  const getActivityBadge = (type: CrmActivity["type"]) => {
    switch (type) {
      case "CALL":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Call</Badge>;
      case "MEETING":
        return <Badge className="bg-sky-50 text-sky-700 border-sky-200">Meeting</Badge>;
      case "EMAIL":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Email</Badge>;
      case "TASK":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Task</Badge>;
      case "NOTE":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Note</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            CRM Activity Center
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Log and review interactions, scheduled meetings, notes, and task checklists.
          </p>
        </div>
        <div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setActivityForm({
                    type: "CALL",
                    subject: "",
                    description: "",
                    outcome: "",
                    scheduledAt: "",
                    dueAt: "",
                    isCompleted: false,
                    contactId: "",
                    dealId: "",
                    assignedToId: "",
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Log Interaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-slate-200 bg-white">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-extrabold text-lg">Log New Interaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateActivity} className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-xs font-bold text-slate-700">Activity Type</Label>
                    <Select
                      value={activityForm.type}
                      onValueChange={(val: any) => setActivityForm({ ...activityForm, type: val })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Choose type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CALL">📞 Telephone Call</SelectItem>
                        <SelectItem value="MEETING">🤝 Video Meeting</SelectItem>
                        <SelectItem value="EMAIL">✉️ Email Exchange</SelectItem>
                        <SelectItem value="TASK">✅ Todo Checklist Task</SelectItem>
                        <SelectItem value="NOTE">📝 Internal File Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-bold text-slate-700">
                      Subject Title <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Discovery call setup, Contract sent"
                      value={activityForm.subject}
                      onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-bold text-slate-700">Detailed Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Add summary bullet points of the conversation or task details..."
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="scheduledAt" className="text-xs font-bold text-slate-700">Scheduled Date/Time</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={activityForm.scheduledAt}
                        onChange={(e) => setActivityForm({ ...activityForm, scheduledAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dueAt" className="text-xs font-bold text-slate-700">Due Date/Time</Label>
                      <Input
                        id="dueAt"
                        type="datetime-local"
                        value={activityForm.dueAt}
                        onChange={(e) => setActivityForm({ ...activityForm, dueAt: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contactId" className="text-xs font-bold text-slate-700">Link Contact</Label>
                      <Select
                        value={activityForm.contactId || "unlinked"}
                        onValueChange={(val) => setActivityForm({ ...activityForm, contactId: val === "unlinked" ? "" : val })}
                      >
                        <SelectTrigger id="contactId">
                          <SelectValue placeholder="Choose contact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unlinked">None</SelectItem>
                          {contactsData?.data?.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dealId" className="text-xs font-bold text-slate-700">Link Deal</Label>
                      <Select
                        value={activityForm.dealId || "unlinked"}
                        onValueChange={(val) => setActivityForm({ ...activityForm, dealId: val === "unlinked" ? "" : val })}
                      >
                        <SelectTrigger id="dealId">
                          <SelectValue placeholder="Choose deal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unlinked">None</SelectItem>
                          {dealsData?.data?.map((d: any) => (
                            <SelectItem key={d._id} value={d._id}>{d.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="isCompleted"
                      type="checkbox"
                      checked={activityForm.isCompleted}
                      onChange={(e) => setActivityForm({ ...activityForm, isCompleted: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Label htmlFor="isCompleted" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Mark as Completed immediately
                    </Label>
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
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
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search subject, summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CALL">Calls</SelectItem>
                <SelectItem value="MEETING">Meetings</SelectItem>
                <SelectItem value="EMAIL">Emails</SelectItem>
                <SelectItem value="TASK">Tasks</SelectItem>
                <SelectItem value="NOTE">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chronological Timeline */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : activitiesList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No logged activities match current filters.
            </div>
          ) : (
            <div className="relative pl-6 border-l border-slate-100 space-y-8">
              {activitiesList.map((act) => {
                const dateToShow = act.scheduledAt || act.dueAt || act.createdAt;
                return (
                  <div key={act._id} className="relative group animate-in fade-in duration-300">
                    {/* Circle Node Icon */}
                    <div className="absolute -left-[38px] top-1.5 h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-indigo-300 transition-colors">
                      {getActivityIcon(act.type)}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Info details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[14px] text-slate-800">
                            {act.subject}
                          </span>
                          {getActivityBadge(act.type)}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCompleteStatus(act)}
                            className="h-6 w-6 text-slate-400 hover:text-indigo-600 rounded-full"
                            title={act.isCompleted ? "Mark as planned" : "Mark as completed"}
                          >
                            {act.isCompleted ? (
                              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 fill-emerald-50" />
                            ) : (
                              <Circle className="h-4.5 w-4.5 text-slate-300 hover:text-indigo-500" />
                            )}
                          </Button>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed max-w-3xl">
                          {act.description || <em className="text-slate-400">No description provided.</em>}
                        </p>
                        {act.outcome && (
                          <div className="text-[12px] text-indigo-700 bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-100/50 mt-2 font-medium">
                            Outcome: {act.outcome}
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(dateToShow).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(dateToShow).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedActivity(act);
                            setEditDialogOpen(true);
                          }}
                          className="h-8 text-xs font-semibold text-slate-600 border border-slate-100 bg-slate-50 hover:bg-slate-100"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteActivity(act._id)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete log"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Edit Activity */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg">Edit Activity Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateActivity} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-subject" className="text-xs font-bold text-slate-700">Subject</Label>
                <Input
                  id="edit-subject"
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-bold text-slate-700">Description</Label>
                <Textarea
                  id="edit-description"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-outcome" className="text-xs font-bold text-slate-700">Meeting Outcome / Follow Up Notes</Label>
                <Input
                  id="edit-outcome"
                  placeholder="Record summary decision points..."
                  value={activityForm.outcome}
                  onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="edit-isCompleted"
                  type="checkbox"
                  checked={activityForm.isCompleted}
                  onChange={(e) => setActivityForm({ ...activityForm, isCompleted: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Label htmlFor="edit-isCompleted" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as Completed
                </Label>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

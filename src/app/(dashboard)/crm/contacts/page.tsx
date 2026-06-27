"use client";

import * as React from "react";
import {
  useContactsList,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useMergeContacts,
  useAccountsList,
  Contact,
  CreateContactData,
  UpdateContactData,
  MergeContactsData,
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
  Users,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Trash,
  Edit2,
  CheckCircle,
  GitMerge,
  Star,
  Building,
  Mail,
  Phone,
  Globe,
  Link2,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const MOCK_CONTACTS: Contact[] = [
  {
    _id: "mock-contact-1",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@tata.com",
    phone: "+91 98765 43210",
    mobile: "+91 98765 43210",
    jobTitle: "VP of Engineering",
    department: "Enterprise Systems",
    isPrimary: true,
    tags: ["Decision Maker", "Tata Group"],
    notes: "Main point of contact for Tata Consultancy Services.",
    companyId: "mock-company",
    accountId: "mock-account-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-contact-2",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@reliance.in",
    phone: "+91 91234 56789",
    mobile: "+91 91234 56789",
    jobTitle: "Procurement Manager",
    department: "Finance",
    isPrimary: false,
    tags: ["Financial Approver"],
    notes: "Coordinates custom billing cycles.",
    companyId: "mock-company",
    accountId: "mock-account-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-contact-3",
    firstName: "Steve",
    lastName: "Rogers",
    email: "steve.rogers@stark.com",
    phone: "+1 (555) 123-4567",
    mobile: "+1 (555) 765-4321",
    jobTitle: "Security Architect",
    department: "IT Infrastructure",
    isPrimary: true,
    tags: ["Tech Evaluator", "Security"],
    notes: "Requires end-to-end encryption audit sheets.",
    companyId: "mock-company",
    accountId: "mock-account-3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ContactsPage() {
  const [search, setSearch] = React.useState("");
  const [primaryFilter, setPrimaryFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // React Query hooks
  const { data: serverData, isLoading, refetch } = useContactsList({
    page,
    limit,
    search: search || undefined,
  });

  const { data: accountsData } = useAccountsList();
  const { data: usersData } = useSystemUsers();

  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();
  const mergeContactsMutation = useMergeContacts();

  // Local state fallback
  const [localContacts, setLocalContacts] = React.useState<Contact[]>(MOCK_CONTACTS);

  // Dialog controls
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = React.useState(false);

  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  // Form states
  const [contactForm, setContactForm] = React.useState<Partial<CreateContactData>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobile: "",
    jobTitle: "",
    department: "",
    isPrimary: false,
    accountId: "",
    notes: "",
    tags: [],
    ownerId: null,
  });

  const [mergeForm, setMergeForm] = React.useState<MergeContactsData>({
    primaryContactId: "",
    secondaryContactId: "",
  });

  // Filtered contacts calculation
  const contactsList = React.useMemo(() => {
    if (serverData?.data && serverData.data.length > 0) {
      return serverData.data;
    }
    return localContacts.filter((c) => {
      const matchSearch =
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(search.toLowerCase()));

      const matchPrimary =
        primaryFilter === "ALL" ||
        (primaryFilter === "PRIMARY" && c.isPrimary) ||
        (primaryFilter === "SECONDARY" && !c.isPrimary);

      return matchSearch && matchPrimary;
    });
  }, [serverData, localContacts, search, primaryFilter]);

  const totalContactsCount = serverData?.meta?.total ?? contactsList.length;
  const totalPages = serverData?.meta?.totalPages ?? Math.ceil(contactsList.length / limit);

  // Analytics Metrics
  const metrics = React.useMemo(() => {
    const list = serverData?.data && serverData.data.length > 0 ? serverData.data : localContacts;
    const total = list.length;
    const primary = list.filter((c) => c.isPrimary).length;
    const accounts = new Set(list.map((c) => c.accountId).filter(Boolean)).size;

    return { total, primary, accounts };
  }, [serverData, localContacts]);

  // Sync edits
  React.useEffect(() => {
    if (selectedContact) {
      setContactForm({
        firstName: selectedContact.firstName || "",
        lastName: selectedContact.lastName || "",
        email: selectedContact.email || "",
        phone: selectedContact.phone || "",
        mobile: selectedContact.mobile || "",
        jobTitle: selectedContact.jobTitle || "",
        department: selectedContact.department || "",
        isPrimary: selectedContact.isPrimary || false,
        accountId: selectedContact.accountId || "",
        notes: selectedContact.notes || "",
        tags: selectedContact.tags || [],
        ownerId: selectedContact.ownerId || null,
      });
    }
  }, [selectedContact]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.email) {
      toast.error("First Name and Email are required fields.");
      return;
    }

    try {
      await createContactMutation.mutateAsync(contactForm as CreateContactData);
      toast.success("Contact created on server.");
      refetch();
      setCreateDialogOpen(false);
    } catch (err) {
      console.warn("Server creation failed, fallback to simulation", err);
      const newContact: Contact = {
        _id: "mock-" + Date.now(),
        firstName: contactForm.firstName || "",
        lastName: contactForm.lastName || "",
        email: contactForm.email || "",
        phone: contactForm.phone || "",
        mobile: contactForm.mobile || "",
        jobTitle: contactForm.jobTitle || "",
        department: contactForm.department || "",
        isPrimary: contactForm.isPrimary || false,
        accountId: contactForm.accountId || "",
        notes: contactForm.notes || "",
        tags: contactForm.tags || ["Local"],
        companyId: "mock-company",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalContacts((prev) => [newContact, ...prev]);
      toast.success("Contact created (Local Mock mode).");
      setCreateDialogOpen(false);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    try {
      await updateContactMutation.mutateAsync({
        id: selectedContact._id,
        data: contactForm as UpdateContactData,
      });
      toast.success("Contact updated on server.");
      refetch();
      setEditDialogOpen(false);
    } catch (err) {
      console.warn("Server update failed, fallback to simulation", err);
      setLocalContacts((prev) =>
        prev.map((c) => (c._id === selectedContact._id ? { ...c, ...contactForm } : c))
      );
      toast.success("Contact details updated (Local Mock mode).");
      setEditDialogOpen(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await deleteContactMutation.mutateAsync(id);
      toast.success("Contact deleted from server.");
      refetch();
    } catch (err) {
      console.warn("Server delete failed, fallback to simulation", err);
      setLocalContacts((prev) => prev.filter((c) => c._id !== id));
      toast.success("Contact removed (Local Mock mode).");
    }
  };

  const handleMergeContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeForm.primaryContactId || !mergeForm.secondaryContactId) {
      toast.error("Please select both primary and duplicate contacts.");
      return;
    }
    if (mergeForm.primaryContactId === mergeForm.secondaryContactId) {
      toast.error("Primary and Duplicate contacts cannot be the same person.");
      return;
    }

    try {
      await mergeContactsMutation.mutateAsync(mergeForm);
      toast.success("Contacts merged successfully on server!");
      refetch();
      setMergeDialogOpen(false);
    } catch (err) {
      console.warn("Server merge failed, fallback to simulation", err);
      // Simulate by removing secondary contact
      setLocalContacts((prev) => prev.filter((c) => c._id !== mergeForm.secondaryContactId));
      toast.success("Contacts merged successfully (Local Mock mode).");
      setMergeDialogOpen(false);
    }
  };

  const togglePrimaryStatus = async (contact: Contact) => {
    const nextVal = !contact.isPrimary;
    try {
      await updateContactMutation.mutateAsync({
        id: contact._id,
        data: { isPrimary: nextVal },
      });
      toast.success(`Primary status updated for ${contact.firstName}.`);
      refetch();
    } catch (err) {
      console.warn("Server status toggle failed, fallback to simulation", err);
      setLocalContacts((prev) =>
        prev.map((c) => (c._id === contact._id ? { ...c, isPrimary: nextVal } : c))
      );
      toast.success(`Primary status updated (Local Mock mode).`);
    }
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            CRM Contacts Directory
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Organize customer representatives, manage accounts, and handle duplicates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setMergeForm({ primaryContactId: "", secondaryContactId: "" });
              setMergeDialogOpen(true);
            }}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold"
          >
            <GitMerge className="mr-2 h-4 w-4 text-indigo-500" />
            Merge Duplicates
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setContactForm({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    mobile: "",
                    jobTitle: "",
                    department: "",
                    isPrimary: false,
                    accountId: "",
                    notes: "",
                    tags: [],
                    ownerId: null,
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-slate-200 bg-white">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-extrabold text-lg">Create New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateContact} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
                      First Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={contactForm.lastName}
                      onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane.smith@corporation.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Direct Desk Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 901-2345"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle" className="text-xs font-bold text-slate-700">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Director of Operations"
                      value={contactForm.jobTitle}
                      onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-bold text-slate-700">Department</Label>
                    <Input
                      id="department"
                      placeholder="Global Strategy"
                      value={contactForm.department}
                      onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="accountId" className="text-xs font-bold text-slate-700">Link Account / Company</Label>
                    <Select
                      value={contactForm.accountId || "unlinked"}
                      onValueChange={(val) => setContactForm({ ...contactForm, accountId: val === "unlinked" ? "" : val })}
                    >
                      <SelectTrigger id="accountId">
                        <SelectValue placeholder="Select corporate account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlinked">Unlinked (Individual)</SelectItem>
                        {accountsData?.data?.map((acc: any) => (
                          <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 md:pt-6">
                    <input
                      id="isPrimary"
                      type="checkbox"
                      checked={contactForm.isPrimary}
                      onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Label htmlFor="isPrimary" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Flag as Primary Contact
                    </Label>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="notes" className="text-xs font-bold text-slate-700">Internal Bio/Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Background details, reference logs, preference tags..."
                      value={contactForm.notes}
                      onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                    Save Contact
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Headers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Directory */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Directory Contacts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-[12px] text-slate-400">Total customer representatives</p>
          </CardContent>
        </Card>

        {/* Primary Contacts */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Primary Points of Contact</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.primary}</p>
            <p className="mt-1 text-[12px] text-amber-600 font-medium">Primary stakeholders linked</p>
          </CardContent>
        </Card>

        {/* Unique Accounts */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Corporate Accounts Linked</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.accounts}</p>
            <p className="mt-1 text-[12px] text-slate-400">Unique companies linked</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search name, job title, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Classification:</span>
          </div>
          <Select value={primaryFilter} onValueChange={setPrimaryFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Stakeholder priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Representatives</SelectItem>
              <SelectItem value="PRIMARY">Primary Contact Only</SelectItem>
              <SelectItem value="SECONDARY">Secondary Contacts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
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
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Primary</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Representative</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Contact Channels</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Job / Department</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Social Handles</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider">Tags</TableHead>
                  <TableHead className="font-bold text-[12px] text-slate-700 uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      No contacts found matching search filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  contactsList.map((contact) => (
                    <TableRow key={contact._id} className="hover:bg-slate-50/50">
                      <TableCell className="py-4 pl-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePrimaryStatus(contact)}
                          className="h-8 w-8 text-slate-300 hover:text-amber-500"
                        >
                          <Star className={`h-4.5 w-4.5 ${contact.isPrimary ? "text-amber-500 fill-amber-500" : ""}`} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[14px] text-slate-800 flex items-center gap-1.5">
                          {contact.firstName} {contact.lastName}
                          {contact.isPrimary && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0">
                              PRIMARY
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Account Ref: {contact.accountId ? "Linked" : "Individual"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-[12px] text-slate-700">
                          <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {contact.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {contact.phone || contact.mobile || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-[13px] text-slate-700">{contact.jobTitle || "-"}</div>
                        <div className="text-[11px] text-slate-400">{contact.department || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Globe className="h-4 w-4 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" />
                          <Link2 className="h-4 w-4 text-slate-400 cursor-pointer hover:text-sky-500 transition-colors" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags?.map((t, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-slate-100 hover:bg-slate-100 text-slate-600 text-[10px]">
                              {t}
                            </Badge>
                          )) || "-"}
                        </div>
                      </TableCell>
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
                                setSelectedContact(contact);
                                setEditDialogOpen(true);
                              }}
                              className="text-xs font-semibold text-slate-700"
                            >
                              <Edit2 className="mr-2 h-3.5 w-3.5" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteContact(contact._id)}
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
          Showing {contactsList.length} of {totalContactsCount} stakeholders
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

      {/* Dialog: Edit Contact */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg">Edit Stakeholder Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateContact} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName" className="text-xs font-bold text-slate-700">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lastName" className="text-xs font-bold text-slate-700">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs font-bold text-slate-700">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700">Phone</Label>
                <Input
                  id="edit-phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-jobTitle" className="text-xs font-bold text-slate-700">Job Title</Label>
                <Input
                  id="edit-jobTitle"
                  value={contactForm.jobTitle}
                  onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-department" className="text-xs font-bold text-slate-700">Department</Label>
                <Input
                  id="edit-department"
                  value={contactForm.department}
                  onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="edit-notes" className="text-xs font-bold text-slate-700">Bio / Background notes</Label>
                <Textarea
                  id="edit-notes"
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  className="min-h-[80px]"
                />
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

      {/* Dialog: Merge Duplicates Wizard */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-indigo-600" />
              Merge Stakeholders Wizard
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMergeContacts} className="space-y-4 pt-2">
            <div className="space-y-2 text-slate-500 text-xs leading-relaxed">
              Consolidate two contacts. All historical notes, call/email logs, and assigned deals will be merged under the **Primary Contact** file, and the duplicate contact will be deleted.
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="merge-primary" className="text-xs font-bold text-slate-700">Keep Primary Contact</Label>
                <Select
                  value={mergeForm.primaryContactId}
                  onValueChange={(val) => setMergeForm({ ...mergeForm, primaryContactId: val })}
                >
                  <SelectTrigger id="merge-primary">
                    <SelectValue placeholder="Select contact to keep" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactsList.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="merge-duplicate" className="text-xs font-bold text-slate-700">Duplicate Contact to Merge & Delete</Label>
                <Select
                  value={mergeForm.secondaryContactId}
                  onValueChange={(val) => setMergeForm({ ...mergeForm, secondaryContactId: val })}
                >
                  <SelectTrigger id="merge-duplicate">
                    <SelectValue placeholder="Select contact to absorb" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactsList
                      .filter((c) => c._id !== mergeForm.primaryContactId)
                      .map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setMergeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Confirm & Merge Files
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

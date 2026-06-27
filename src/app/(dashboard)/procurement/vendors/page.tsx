"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Star,
  Mail,
  Phone,
  MapPin,
  Building,
  MoreVertical,
  Edit2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  Globe,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/hooks/queries/client";
import { endpoints } from "@/lib/api/endpoints";
import { Vendor } from "@/types/procurement";
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

const mockVendors: Vendor[] = [
  {
    id: "v-1",
    name: "Global Tech Solutions",
    email: "orders@globaltech.com",
    phone: "+1 (555) 234-5678",
    address: "1200 Enterprise Blvd, Austin TX 78701",
    category: "Technology",
    rating: 4.8,
    status: "active",
    paymentTerms: "Net 30",
    taxId: "TX-84521907",
    createdAt: "2025-03-15",
  },
  {
    id: "v-2",
    name: "Apex Supply Corp",
    email: "procurement@apex.com",
    phone: "+1 (555) 876-5432",
    address: "500 Commerce Park, Chicago IL 60601",
    category: "Hardware",
    rating: 4.5,
    status: "active",
    paymentTerms: "Net 45",
    taxId: "IL-33218754",
    createdAt: "2025-06-22",
  },
  {
    id: "v-3",
    name: "Logistics Direct Inc",
    email: "sales@logisticsdirect.com",
    phone: "+1 (555) 111-9999",
    address: "88 Freight Way, Memphis TN 38103",
    category: "Logistics",
    rating: 4.2,
    status: "active",
    paymentTerms: "Net 15",
    taxId: "TN-66709123",
    createdAt: "2025-09-10",
  },
  {
    id: "v-4",
    name: "Prime Builders Supply",
    email: "support@primebuilders.com",
    phone: "+1 (555) 444-7777",
    address: "200 Industrial Ave, Phoenix AZ 85001",
    category: "Construction",
    rating: 3.8,
    status: "inactive",
    paymentTerms: "Net 60",
    taxId: "AZ-12345678",
    createdAt: "2024-12-01",
  },
  {
    id: "v-5",
    name: "CloudScale Hosting",
    email: "enterprise@cloudscale.io",
    phone: "+1 (555) 222-8888",
    address: "900 Data Center Dr, Portland OR 97201",
    category: "Cloud Services",
    rating: 4.9,
    status: "active",
    paymentTerms: "Net 30",
    taxId: "OR-99887766",
    createdAt: "2026-01-05",
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  category: "Technology",
  paymentTerms: "Net 30",
  taxId: "",
};

export default function VendorsPage() {
  const { data: serverVendors } = useQuery({
    queryKey: ["procurement", "vendors"],
    queryFn: () =>
      apiGet<{ data: Vendor[] }>(endpoints.procurement.vendors).catch(() => ({
        data: [],
      })),
  });

  const [vendors, setVendors] = React.useState<Vendor[]>(mockVendors);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    if (serverVendors?.data && serverVendors.data.length > 0) {
      setVendors(serverVendors.data);
    }
  }, [serverVendors]);

  const filteredVendors = React.useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  const metrics = React.useMemo(() => {
    const active = vendors.filter((v) => v.status === "active").length;
    const inactive = vendors.filter((v) => v.status === "inactive").length;
    const avgRating =
      vendors.length > 0
        ? vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length
        : 0;
    return { total: vendors.length, active, inactive, avgRating };
  }, [vendors]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setForm({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || "",
      address: vendor.address || "",
      category: vendor.category,
      paymentTerms: vendor.paymentTerms || "Net 30",
      taxId: vendor.taxId || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }

    if (editingId) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editingId
            ? {
                ...v,
                ...form,
                phone: form.phone || undefined,
                address: form.address || undefined,
                taxId: form.taxId || undefined,
              }
            : v
        )
      );
      toast.success("Vendor updated successfully.");
    } else {
      const newVendor: Vendor = {
        id: `v-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        category: form.category,
        rating: 0,
        status: "active",
        paymentTerms: form.paymentTerms || undefined,
        taxId: form.taxId || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setVendors((prev) => [newVendor, ...prev]);
      toast.success("Vendor onboarded successfully.");
    }
    setIsFormOpen(false);
  };

  const toggleStatus = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const newStatus = v.status === "active" ? "inactive" : "active";
          toast.success(
            `${v.name} is now ${newStatus === "active" ? "Active" : "Inactive"}.`
          );
          return { ...v, status: newStatus };
        }
        return v;
      })
    );
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    toast.success("Vendor removed.");
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalf
                ? "fill-amber-200 text-amber-400"
                : "text-slate-200"
            }`}
          />
        ))}
        <span className="text-[11px] text-slate-500 ml-1 font-semibold">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Vendor Management
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Onboard, evaluate, and manage your approved supplier network.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Onboard Vendor
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">
              Total Vendors
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              {metrics.total}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              Registered in vendor directory
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">
              Active Partners
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">
              {metrics.active}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              Approved for procurement
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">
              Inactive Vendors
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">
              {metrics.inactive}
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              Suspended or deactivated
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">
              Average Rating
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">
              {metrics.avgRating.toFixed(1)}{" "}
              <span className="text-[13px] font-medium text-slate-400">/ 5</span>
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              Across all vendors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">
            Status:
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">
            No vendors match your search criteria.
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[13px] shadow-sm">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-[14px] font-bold text-slate-900">
                          {vendor.name}
                        </CardTitle>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            vendor.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              vendor.status === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {vendor.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border-slate-200"
                    >
                      <DropdownMenuItem onClick={() => openEdit(vendor)}>
                        <Edit2 className="mr-2 h-3.5 w-3.5" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(vendor.id)}>
                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                        {vendor.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteVendor(vendor.id)}
                        className="text-rose-600"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-[12.5px]">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] text-slate-400 font-semibold block">
                      CATEGORY
                    </span>
                    <span className="text-[12px] text-slate-700 font-semibold flex items-center gap-1">
                      <Globe className="h-3 w-3 text-slate-400" />
                      {vendor.category}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10.5px] text-slate-400 font-semibold block">
                      RATING
                    </span>
                    {renderStars(vendor.rating)}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div className="text-[11px] text-slate-400">
                    Terms:{" "}
                    <span className="font-semibold text-slate-600">
                      {vendor.paymentTerms || "—"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Tax ID:{" "}
                    <span className="font-mono text-slate-600 font-semibold">
                      {vendor.taxId || "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Vendor" : "Onboard New Vendor"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update vendor profile information."
                : "Register a new supplier partner in the procurement directory."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Company Name *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Global Tech Solutions"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Email *
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vendor@company.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Phone
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Address
                </Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full business address"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(val: string) =>
                    setForm({ ...form, category: val })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Payment Terms
                </Label>
                <Select
                  value={form.paymentTerms}
                  onValueChange={(val: string) =>
                    setForm({ ...form, paymentTerms: val })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Terms" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600">
                  Tax ID
                </Label>
                <Input
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder="e.g. TX-84521907"
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
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
              >
                {editingId ? "Save Changes" : "Onboard Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

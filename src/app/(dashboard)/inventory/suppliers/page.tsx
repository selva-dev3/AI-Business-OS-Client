"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Building2,
  ShoppingBag,
  TrendingUp,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  status: "active" | "inactive";
  activeOrders: number;
}

const localSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Apex Semiconductor Group",
    code: "APEX-SEMI",
    contactName: "Sarah Jenkins",
    contactEmail: "sjenkins@apexsemi.com",
    contactPhone: "+1 (555) 234-5678",
    address: "2048 Silicon Blvd, San Jose, CA 95134",
    status: "active",
    activeOrders: 3
  },
  {
    id: "sup-2",
    name: "Summit Optics Ltd.",
    code: "SUMMIT-OPT",
    contactName: "David Vance",
    contactEmail: "dvance@summitoptics.com",
    contactPhone: "+44 20 7946 0958",
    address: "88 Glasshouse Lane, London, EC1A 1AA",
    status: "active",
    activeOrders: 1
  },
  {
    id: "sup-3",
    name: "CoreTech Manufacturing",
    code: "CORE-MFG",
    contactName: "Kenji Sato",
    contactEmail: "k.sato@coretech.co.jp",
    contactPhone: "+81 3 5555 0192",
    address: "4-10-1 Shibaura, Minato-ku, Tokyo 108-8506",
    status: "active",
    activeOrders: 5
  },
  {
    id: "sup-4",
    name: "Vector Power Systems",
    code: "VECTOR-PWR",
    contactName: "Elena Rostova",
    contactEmail: "e.rostova@vectorpower.eu",
    contactPhone: "+49 89 2424 0",
    address: "Max-Planck-Str. 12, 85748 Garching, Germany",
    status: "inactive",
    activeOrders: 0
  }
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(localSuppliers);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");

  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter((sup) => {
      const matchSearch =
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [suppliers, searchTerm]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === "active").length;
    const totalActiveOrders = suppliers.reduce((sum, s) => sum + s.activeOrders, 0);
    return { total, active, totalActiveOrders };
  }, [suppliers]);

  const openCreateDialog = () => {
    setEditingSupplier(null);
    setName("");
    setCode("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setAddress("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const openEditDialog = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setCode(sup.code);
    setContactName(sup.contactName);
    setContactEmail(sup.contactEmail);
    setContactPhone(sup.contactPhone);
    setAddress(sup.address || "");
    setStatus(sup.status);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !contactName || !contactEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      name,
      code: code.toUpperCase().replace(/[^A-Z0-9-_]/g, ""),
      contactName,
      contactEmail,
      contactPhone,
      address,
      status,
    };

    if (editingSupplier) {
      setSuppliers(prev =>
        prev.map(s => (s.id === editingSupplier.id ? { ...s, ...payload } : s))
      );
      toast.success("Supplier updated successfully.");
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        ...payload,
        activeOrders: 0
      };
      setSuppliers(prev => [newSup, ...prev]);
      toast.success("Supplier added successfully.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) return;
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success("Supplier deleted successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Suppliers & Vendors</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Manage partner profiles, contact directories, procurement channels, and track contract fulfillment pipelines.
          </p>
        </div>
        <div>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Partners</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-[12px] text-slate-400">{metrics.active} active suppliers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active Purchase Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalActiveOrders}</p>
            <p className="mt-1 text-[12px] text-slate-400">Procurements currently in transit</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Primary Partner</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900 truncate">CoreTech MFG</p>
            <p className="mt-1 text-[12px] text-slate-400">Largest procurement fulfillment share</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search suppliers by name, code, contact or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Suppliers Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Supplier / Code</th>
                <th className="py-3 px-4">Contact Representative</th>
                <th className="py-3 px-4">Address / Geography</th>
                <th className="py-3 px-4 text-center">Fulfillments</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No suppliers matched search criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{sup.name}</div>
                      <div className="font-mono text-[10.5px] text-slate-400 mt-0.5">{sup.code}</div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <User className="h-3 w-3 text-slate-400" />
                        {sup.contactName}
                      </div>
                      <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {sup.contactEmail}
                      </div>
                      {sup.contactPhone && (
                        <div className="text-[11.5px] text-slate-450 flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {sup.contactPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{sup.address || <span className="italic text-slate-350">No address recorded</span>}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {sup.activeOrders} Active POs
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        sup.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sup.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {sup.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(sup)}
                          className="h-8 w-8 text-slate-450 hover:text-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sup.id)}
                          className="h-8 w-8 text-slate-450 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Supplier Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingSupplier ? "Edit Supplier Profile" : "Add Supplier Profile"}
            </DialogTitle>
            <DialogDescription>
              Record core manufacturer details and primary representatives.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="supName" className="text-[12px] font-semibold text-slate-600">Company Name</Label>
                <Input
                  id="supName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apex Semiconductor"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supCode" className="text-[12px] font-semibold text-slate-600">Supplier Code</Label>
                <Input
                  id="supCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="APEX-SEMI"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="repName" className="text-[12px] font-semibold text-slate-600">Contact Representative</Label>
              <Input
                id="repName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Sarah Jenkins"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="repEmail" className="text-[12px] font-semibold text-slate-600">Email Address</Label>
                <Input
                  id="repEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="rep@company.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repPhone" className="text-[12px] font-semibold text-slate-600">Phone Number</Label>
                <Input
                  id="repPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supAddress" className="text-[12px] font-semibold text-slate-600">Corporate Address</Label>
              <textarea
                id="supAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="HQ corporate location, city, state, zip..."
                className="w-full min-h-16 rounded-md border border-slate-200 bg-transparent py-2 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-slate-600">Supplier Status</Label>
              <Select value={status} onValueChange={(val: string) => setStatus(val as "active" | "inactive")}>
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="active">Active Vendor</SelectItem>
                  <SelectItem value="inactive">Inactive / Suspended</SelectItem>
                </SelectContent>
              </Select>
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
                {editingSupplier ? "Save Changes" : "Add Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

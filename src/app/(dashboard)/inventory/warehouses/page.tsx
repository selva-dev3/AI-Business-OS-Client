"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Search,
  Building,
  UserCheck,
  MoreVertical,
  Edit2,
  Trash2,
  Boxes
} from "lucide-react";
import {
  useWarehousesList,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse
} from "@/hooks/queries/inventory";
import { Warehouse } from "@/types/inventory";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localWarehouses: Warehouse[] = [
  { id: "wh-1", name: "North America Hub", location: "Chicago, IL", manager: { id: "mgr-1", name: "Sarah Jenkins" } },
  { id: "wh-2", name: "EMEA Distribution Center", location: "Frankfurt, DE", manager: { id: "mgr-2", name: "Dieter Muller" } },
  { id: "wh-3", name: "APAC Logistics Center", location: "Singapore", manager: { id: "mgr-3", name: "Li Wei" } }
];

export default function WarehousesPage() {
  const { data: serverWarehouses } = useWarehousesList();
  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse();
  const deleteWarehouseMutation = useDeleteWarehouse();

  const [sandboxWarehouses, setSandboxWarehouses] = React.useState<Warehouse[]>(localWarehouses);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingWarehouse, setEditingWarehouse] = React.useState<Warehouse | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [managerName, setManagerName] = React.useState("");

  const activeWarehouses = React.useMemo(() => {
    let list = sandboxWarehouses;
    if (serverWarehouses && Array.isArray(serverWarehouses) && serverWarehouses.length > 0) {
      list = serverWarehouses;
    }
    return list.filter((wh) => {
      const matchSearch = wh.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (wh.manager?.name && wh.manager.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [serverWarehouses, sandboxWarehouses, searchTerm]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxWarehouses;
    if (serverWarehouses && Array.isArray(serverWarehouses) && serverWarehouses.length > 0) {
      list = serverWarehouses;
    }
    const total = list.length;
    
    // Unique cities/locations
    const locationsSet = new Set(list.map(w => w.location.split(",")[0].trim()));
    const uniqueCities = locationsSet.size;

    // Distinct managers
    const managersSet = new Set(list.map(w => w.manager?.name).filter(Boolean));
    const activeManagers = managersSet.size;

    return { total, uniqueCities, activeManagers };
  }, [serverWarehouses, sandboxWarehouses]);

  const openCreateDialog = () => {
    setEditingWarehouse(null);
    setName("");
    setLocation("");
    setManagerName("");
    setIsFormOpen(true);
  };

  const openEditDialog = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setName(wh.name);
    setLocation(wh.location);
    setManagerName(wh.manager?.name || "");
    setIsFormOpen(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      toast.error("Please fill in name and location.");
      return;
    }

    const payload = {
      name,
      location,
      managerName: managerName || undefined
    };

    if (editingWarehouse) {
      const updatedMock: Warehouse = {
        id: editingWarehouse.id,
        name,
        location,
        manager: managerName ? { id: "mgr-temp", name: managerName } : undefined
      };
      try {
        await updateWarehouseMutation.mutateAsync({ id: editingWarehouse.id, data: payload });
        toast.success("Warehouse updated on server.");
      } catch (err) {
        setSandboxWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? updatedMock : w));
        toast.success("Warehouse updated (Sandbox Mock).");
      }
    } else {
      try {
        await createWarehouseMutation.mutateAsync(payload);
        toast.success("Warehouse created on server.");
      } catch (err) {
        const newWarehouse: Warehouse = {
          id: `wh-${Date.now()}`,
          name,
          location,
          manager: managerName ? { id: "mgr-temp", name: managerName } : undefined
        };
        setSandboxWarehouses(prev => [newWarehouse, ...prev]);
        toast.success("Warehouse created (Sandbox Mock).");
      }
    }
    setIsFormOpen(false);
  };

  const handleDeleteWarehouse = async (id: string) => {
    try {
      await deleteWarehouseMutation.mutateAsync(id);
      toast.success("Warehouse deleted on server.");
    } catch (err) {
      setSandboxWarehouses(prev => prev.filter(w => w.id !== id));
      toast.success("Warehouse deleted (Sandbox Mock).");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Warehouse Locations</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Configure distribution warehouses, map facility coordinates, and assign operations managers.
          </p>
        </div>
        <div>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Warehouses</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="mt-1 text-[12px] text-slate-400">Operational hubs & fulfillment centers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Unique Regions / Cities</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.uniqueCities}</p>
            <p className="mt-1 text-[12px] text-slate-400">Independent global storage locations</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Facility Managers</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.activeManagers}</p>
            <p className="mt-1 text-[12px] text-slate-400">Assigned active coordinators</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search warehouses by name, city, or manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Warehouses Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Warehouse Name</th>
                <th className="py-3.5 px-4">Location / City</th>
                <th className="py-3.5 px-4">Operations Manager</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No warehouses found matching search filters.
                  </td>
                </tr>
              ) : (
                activeWarehouses.map((wh) => (
                  <tr key={wh.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                        <Building className="h-4.5 w-4.5" />
                      </div>
                      <span>{wh.name}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{wh.location}</td>
                    <td className="py-4 px-4 text-slate-700">
                      {wh.manager?.name ? (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>{wh.manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Manager Assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white border border-slate-200">
                          <DropdownMenuItem onClick={() => openEditDialog(wh)} className="cursor-pointer">
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWarehouse(wh.id)}
                            className="text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete Hub
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

      {/* Add / Edit Warehouse Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingWarehouse ? "Edit Warehouse Hub" : "Add Warehouse Hub"}
            </DialogTitle>
            <DialogDescription>
              Provide warehouse designation name, city/country location, and key point of contact.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveWarehouse} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[12px] font-semibold text-slate-600">Warehouse Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. West Coast Storage Hub"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-[12px] font-semibold text-slate-600">Location / City</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Seattle, WA"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manager" className="text-[12px] font-semibold text-slate-600">Operations Manager</Label>
              <Input
                id="manager"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
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
                Save Warehouse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

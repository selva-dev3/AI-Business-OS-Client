"use client";

import * as React from "react";
import {
  Monitor,
  Laptop,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash,
  Plus,
  Edit2,
  Search,
  ExternalLink,
  Save,
  Users,
  Shield,
  Activity,
  UserPlus,
  UserMinus,
  Mail,
  Calendar,
  DollarSign,
  Barcode,
  Grid,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Import hooks and types
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  useAssetHistory,
} from "@/hooks/queries/hrms/assets/assets.hooks";
import { Asset, AssetHistory, AssetStatus, AssetCategory } from "@/hooks/queries/hrms/assets/assets.types";

interface EmployeeMin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = React.useState<"catalog" | "history">("catalog");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");

  // Selected details
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);

  // Form input states
  const [formValues, setFormValues] = React.useState({
    name: "",
    category: "electronics" as AssetCategory,
    serialNumber: "",
    cost: 0,
    purchaseDate: "",
    notes: "",
  });

  // Checkout dialog input states
  const [checkoutTargetEmployeeId, setCheckoutTargetEmployeeId] = React.useState("");
  const [checkoutNotes, setCheckoutNotes] = React.useState("");

  // Query Hooks
  const { data: serverAssets, isLoading: assetsLoading, refetch } = useAssets();
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  // Mock static employees list for assignment
  const fallbackEmployees: EmployeeMin[] = React.useMemo(() => [
    { id: "emp-1", firstName: "John", lastName: "Doe", email: "john.doe@company.com", designation: "Principal Engineer" },
    { id: "emp-2", firstName: "Jane", lastName: "Smith", email: "jane.smith@company.com", designation: "Product Director" },
    { id: "emp-3", firstName: "Robert", lastName: "Chen", email: "robert.chen@company.com", designation: "Talent Partner" },
    { id: "emp-4", firstName: "Emily", lastName: "Watson", email: "emily.watson@company.com", designation: "Marketing Specialist" },
    { id: "emp-5", firstName: "Alex", lastName: "Rivera", email: "alex.r@company.com", designation: "DevOps Lead" },
  ], []);

  // High-fidelity fallback assets database
  const fallbackAssets: Asset[] = React.useMemo(() => [
    {
      id: "asset-1",
      name: "MacBook Pro M3 Max 16\"",
      category: "electronics",
      serialNumber: "SN-MBP-99281A",
      status: "assigned",
      cost: 3499,
      purchaseDate: "2026-01-15",
      assignedToId: "emp-1",
      assignedTo: { id: "emp-1", firstName: "John", lastName: "Doe", email: "john.doe@company.com" },
      notes: "High-spec engineering laptop for development.",
      createdAt: "2026-01-15T09:00:00Z",
      updatedAt: "2026-01-15T09:00:00Z",
    },
    {
      id: "asset-2",
      name: "Dell UltraSharp 32\" 4K Monitor",
      category: "electronics",
      serialNumber: "SN-DEL-44120X",
      status: "available",
      cost: 899,
      purchaseDate: "2026-02-10",
      notes: "Design workstation extension monitor.",
      createdAt: "2026-02-10T10:00:00Z",
      updatedAt: "2026-02-10T10:00:00Z",
    },
    {
      id: "asset-3",
      name: "Ergonomic Mesh Chair",
      category: "furniture",
      serialNumber: "SN-CHR-11002Z",
      status: "assigned",
      cost: 599,
      purchaseDate: "2026-01-20",
      assignedToId: "emp-2",
      assignedTo: { id: "emp-2", firstName: "Jane", lastName: "Smith", email: "jane.smith@company.com" },
      notes: "Lumbar support ergonomic workspace chair.",
      createdAt: "2026-01-20T09:00:00Z",
      updatedAt: "2026-01-20T09:00:00Z",
    },
    {
      id: "asset-4",
      name: "iPhone 15 Pro Max 256GB",
      category: "electronics",
      serialNumber: "SN-IPH-88301B",
      status: "maintenance",
      cost: 1199,
      purchaseDate: "2026-03-05",
      assignedToId: "emp-3",
      assignedTo: { id: "emp-3", firstName: "Robert", lastName: "Chen", email: "robert.chen@company.com" },
      notes: "Screen replacement required.",
      createdAt: "2026-03-05T09:00:00Z",
      updatedAt: "2026-03-05T09:00:00Z",
    },
    {
      id: "asset-5",
      name: "JetBrains All Products Pack License",
      category: "software",
      serialNumber: "LIC-JB-6610A",
      status: "assigned",
      cost: 649,
      purchaseDate: "2026-01-05",
      assignedToId: "emp-5",
      assignedTo: { id: "emp-5", firstName: "Alex", lastName: "Rivera", email: "alex.r@company.com" },
      notes: "Annual software subscription licence.",
      createdAt: "2026-01-05T09:00:00Z",
      updatedAt: "2026-01-05T09:00:00Z",
    },
  ], []);

  const [localAssets, setLocalAssets] = React.useState<Asset[]>([]);
  React.useEffect(() => {
    setLocalAssets(fallbackAssets);
  }, [fallbackAssets]);

  // High-fidelity fallback audit history log
  const fallbackHistory: AssetHistory[] = React.useMemo(() => [
    {
      id: "log-1",
      assetId: "asset-1",
      assetName: "MacBook Pro M3 Max 16\"",
      action: "checkout",
      employeeId: "emp-1",
      employeeName: "John Doe",
      actionDate: "2026-01-15T10:30:00Z",
      notes: "Assigned upon completion of onboarding cycle.",
    },
    {
      id: "log-2",
      assetId: "asset-3",
      assetName: "Ergonomic Mesh Chair",
      action: "checkout",
      employeeId: "emp-2",
      employeeName: "Jane Smith",
      actionDate: "2026-01-20T11:45:00Z",
      notes: "Office furniture request allocation.",
    },
    {
      id: "log-3",
      assetId: "asset-4",
      assetName: "iPhone 15 Pro Max 256GB",
      action: "maintenance_start",
      employeeId: "emp-3",
      employeeName: "Robert Chen",
      actionDate: "2026-06-12T14:00:00Z",
      notes: "Cracked screen sent to Apple Support store.",
    },
  ], []);

  const [localHistory, setLocalHistory] = React.useState<AssetHistory[]>([]);
  React.useEffect(() => {
    setLocalHistory(fallbackHistory);
  }, [fallbackHistory]);

  // Combined Active Catalog list
  const assetsList = React.useMemo(() => {
    const list = serverAssets && serverAssets.length > 0 ? serverAssets : localAssets;
    
    return list.map((item) => {
      const assigned = fallbackEmployees.find((e) => e.id === item.assignedToId);
      return {
        ...item,
        assignedTo: item.assignedTo || assigned ? {
          id: assigned!.id,
          firstName: assigned!.firstName,
          lastName: assigned!.lastName,
          email: assigned!.email,
        } : undefined,
      };
    });
  }, [serverAssets, localAssets, fallbackEmployees]);

  // Filter list by search query, status, and category
  const filteredList = React.useMemo(() => {
    return assetsList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assetsList, searchQuery, statusFilter, categoryFilter]);

  // Overview metrics
  const stats = React.useMemo(() => {
    const total = assetsList.length;
    const assigned = assetsList.filter((a) => a.status === "assigned").length;
    const available = assetsList.filter((a) => a.status === "available").length;
    const maintenance = assetsList.filter((a) => a.status === "maintenance").length;

    return {
      total,
      assigned,
      available,
      maintenance,
    };
  }, [assetsList]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormValues({
      name: "",
      category: "electronics",
      serialNumber: "",
      cost: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setIsFormOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (asset: Asset) => {
    setFormMode("edit");
    setSelectedAsset(asset);
    setFormValues({
      name: asset.name,
      category: asset.category,
      serialNumber: asset.serialNumber,
      cost: asset.cost,
      purchaseDate: asset.purchaseDate.split("T")[0],
      notes: asset.notes || "",
    });
    setIsFormOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.name || !formValues.serialNumber) {
      toast.error("Please fill in the asset name and serial tag.");
      return;
    }

    try {
      if (formMode === "create") {
        await createAssetMutation.mutateAsync({
          name: formValues.name,
          category: formValues.category,
          serialNumber: formValues.serialNumber,
          cost: Number(formValues.cost),
          purchaseDate: formValues.purchaseDate,
          notes: formValues.notes || undefined,
        });
        toast.success("Asset logged successfully");
      } else if (formMode === "edit" && selectedAsset) {
        await updateAssetMutation.mutateAsync({
          id: selectedAsset.id,
          data: {
            name: formValues.name,
            category: formValues.category,
            serialNumber: formValues.serialNumber,
            cost: Number(formValues.cost),
            purchaseDate: formValues.purchaseDate,
            notes: formValues.notes || undefined,
          },
        });
        toast.success("Asset details updated");
      }
      setIsFormOpen(false);
      refetch();
    } catch (err) {
      // Mock local update
      if (formMode === "create") {
        const newAsset: Asset = {
          id: `asset-${Date.now()}`,
          name: formValues.name,
          category: formValues.category,
          serialNumber: formValues.serialNumber,
          status: "available",
          cost: Number(formValues.cost),
          purchaseDate: formValues.purchaseDate,
          notes: formValues.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add history check-in record
        const newLog: AssetHistory = {
          id: `log-${Date.now()}`,
          assetId: newAsset.id,
          assetName: newAsset.name,
          action: "checkin",
          actionDate: new Date().toISOString(),
          notes: "Initial inventory check-in log.",
        };

        setLocalAssets([...localAssets, newAsset]);
        setLocalHistory([newLog, ...localHistory]);
        toast.info("Logged asset into local inventory state.");
      } else if (formMode === "edit" && selectedAsset) {
        const updated = localAssets.map((item) => {
          if (item.id === selectedAsset.id) {
            return {
              ...item,
              name: formValues.name,
              category: formValues.category,
              serialNumber: formValues.serialNumber,
              cost: Number(formValues.cost),
              purchaseDate: formValues.purchaseDate,
              notes: formValues.notes,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        setLocalAssets(updated);
        toast.info("Modified asset metadata locally.");
      }
      setIsFormOpen(false);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id: string) => {
    const item = assetsList.find((a) => a.id === id);
    if (item?.status === "assigned") {
      toast.error("Please check-in / return the asset before disposing.");
      return;
    }

    try {
      await deleteAssetMutation.mutateAsync(id);
      toast.success("Asset removed from register");
      refetch();
    } catch (err) {
      const updated = localAssets.filter((a) => a.id !== id);
      setLocalAssets(updated);
      toast.info("Asset removed from local register");
    }
  };

  // Open Checkout Dialog
  const handleOpenCheckout = (asset: Asset) => {
    setSelectedAsset(asset);
    setCheckoutTargetEmployeeId(asset.assignedToId || "");
    setCheckoutNotes("");
    setIsCheckoutOpen(true);
  };

  // Submit Checkout / In Allocate Handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset) return;

    const isCurrentlyAssigned = selectedAsset.status === "assigned";

    try {
      if (isCurrentlyAssigned) {
        // Perform Return Checkin Action
        await updateAssetMutation.mutateAsync({
          id: selectedAsset.id,
          data: {
            status: "available",
            assignedToId: undefined,
          },
        });
        toast.success("Asset returned to catalog stock");
      } else {
        // Perform Checkout Allocation
        if (!checkoutTargetEmployeeId) {
          toast.error("Please select an employee assignee.");
          return;
        }
        await updateAssetMutation.mutateAsync({
          id: selectedAsset.id,
          data: {
            status: "assigned",
            assignedToId: checkoutTargetEmployeeId,
          },
        });
        toast.success("Asset allocated successfully");
      }
      setIsCheckoutOpen(false);
      refetch();
    } catch (err) {
      // Fallback local allocation toggle
      if (isCurrentlyAssigned) {
        // Checkin / return
        const updated = localAssets.map((item) => {
          if (item.id === selectedAsset.id) {
            return {
              ...item,
              status: "available" as AssetStatus,
              assignedToId: undefined,
              assignedTo: undefined,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        const newLog: AssetHistory = {
          id: `log-${Date.now()}`,
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          action: "checkin",
          employeeId: selectedAsset.assignedToId,
          employeeName: selectedAsset.assignedTo
            ? `${selectedAsset.assignedTo.firstName} ${selectedAsset.assignedTo.lastName}`
            : undefined,
          actionDate: new Date().toISOString(),
          notes: checkoutNotes || "Returned to stock list.",
        };

        setLocalAssets(updated);
        setLocalHistory([newLog, ...localHistory]);
        toast.info("Checked asset back into stock list.");
      } else {
        // Checkout
        if (!checkoutTargetEmployeeId) {
          toast.error("Please select an employee assignee.");
          return;
        }
        const emp = fallbackEmployees.find((e) => e.id === checkoutTargetEmployeeId);

        const updated = localAssets.map((item) => {
          if (item.id === selectedAsset.id) {
            return {
              ...item,
              status: "assigned" as AssetStatus,
              assignedToId: checkoutTargetEmployeeId,
              assignedTo: emp ? {
                id: emp.id,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
              } : undefined,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        const newLog: AssetHistory = {
          id: `log-${Date.now()}`,
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          action: "checkout",
          employeeId: checkoutTargetEmployeeId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : undefined,
          actionDate: new Date().toISOString(),
          notes: checkoutNotes || "Checked out via console portal.",
        };

        setLocalAssets(updated);
        setLocalHistory([newLog, ...localHistory]);
        toast.info("Checked out asset to staff assignee.");
      }
      setIsCheckoutOpen(false);
    }
  };

  // Toggle Maintenance Status locally
  const handleToggleMaintenance = (asset: Asset) => {
    const isMaintenance = asset.status === "maintenance";
    const nextStatus: AssetStatus = isMaintenance ? "available" : "maintenance";

    const updated = localAssets.map((item) => {
      if (item.id === asset.id) {
        return {
          ...item,
          status: nextStatus,
          assignedToId: undefined,
          assignedTo: undefined,
        };
      }
      return item;
    });

    const newLog: AssetHistory = {
      id: `log-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      action: isMaintenance ? "maintenance_end" : "maintenance_start",
      actionDate: new Date().toISOString(),
      notes: isMaintenance ? "Maintenance completed. Returned to stock." : "Sent for hardware service checkup.",
    };

    setLocalAssets(updated);
    setLocalHistory([newLog, ...localHistory]);
    toast.info(isMaintenance ? "Asset marked available" : "Asset sent to maintenance");
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Assets Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track hardware hardware, software subscriptions, assign targets, and track checkout histories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Total Registered</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.total} assets</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">In Stock / Available</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.available} units</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Checked Out / Active</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.assigned} deployed</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-semibold">Under Repair</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.maintenance} service</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View switcher & filters row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left tabs selector panel */}
        <div className="space-y-2">
          <Button
            variant={activeTab === "catalog" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("catalog")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "catalog" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Grid className="mr-2 h-4 w-4 shrink-0" />
            Active Catalog Grid
          </Button>
          <Button
            variant={activeTab === "history" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("history")}
            className={cn(
              "w-full justify-start font-semibold text-slate-700",
              activeTab === "history" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <ClipboardList className="mr-2 h-4 w-4 shrink-0" />
            Audit Checkout Log
          </Button>
        </div>

        {/* Right side content panels */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Tab 1: Catalog */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              
              {/* Search & dropdown filter options */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 border border-slate-100 rounded-xl shadow-xs">
                
                <div className="flex items-center gap-2 max-w-xs bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    placeholder="Search name or serial number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 text-xs focus:outline-hidden w-full text-slate-700"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Hardware/Electronics</option>
                  <option value="software">Licenses/Software</option>
                  <option value="furniture">Furniture</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available in Stock</option>
                  <option value="assigned">Assigned to Staff</option>
                  <option value="maintenance">Under Repair</option>
                  <option value="disposed">Disposed</option>
                </select>

              </div>

              {/* Grid content */}
              {filteredList.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-100 rounded-xl text-slate-455">
                  <Laptop className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No assets found</p>
                  <p className="text-xs text-slate-400 mt-1">Try broadening your search query or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredList.map((item) => {
                    const isAssigned = item.status === "assigned";
                    const isRepair = item.status === "maintenance";

                    return (
                      <Card key={item.id} className="border-slate-100 bg-white hover:border-indigo-150 transition-colors shadow-xs">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">
                                {item.name}
                              </CardTitle>
                              
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <Badge className="text-[9px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 border-0">
                                  {item.category}
                                </Badge>
                                
                                <Badge
                                  className={cn(
                                    "text-[9px] uppercase font-black tracking-wider border-0",
                                    item.status === "available" && "bg-emerald-50 text-emerald-700",
                                    item.status === "assigned" && "bg-indigo-50 text-indigo-700",
                                    item.status === "maintenance" && "bg-amber-50 text-amber-700",
                                    item.status === "disposed" && "bg-rose-50 text-rose-700"
                                  )}
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(item)}
                                className="h-7 w-7 p-0 text-slate-450 hover:text-indigo-650 hover:bg-slate-50"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAsset(item.id)}
                                className="h-7 w-7 p-0 text-slate-450 hover:text-rose-650 hover:bg-slate-50"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-2 pb-4 space-y-3.5 text-xs text-slate-600 border-t border-slate-50 mt-2">
                          
                          {/* Details Row */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Barcode className="h-3.5 w-3.5 text-slate-400" />
                              <span>Tag: {item.serialNumber}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 justify-end">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                              <span>Cost: ${item.cost}</span>
                            </div>
                          </div>

                          {/* Allocation Status description */}
                          <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Allocation Assignee</span>
                              {item.assignedTo ? (
                                <span className="font-bold text-slate-800 text-[11px] mt-0.5 block">
                                  {item.assignedTo.firstName} {item.assignedTo.lastName}
                                </span>
                              ) : (
                                <span className="font-medium text-slate-450 text-[11px] mt-0.5 block">
                                  Available in Stock
                                </span>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenCheckout(item)}
                                className={cn(
                                  "h-7 text-[10px] px-2 font-bold bg-white text-slate-700 border-slate-200 shadow-xs",
                                  isAssigned && "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                                )}
                              >
                                {isAssigned ? "Return Unit" : "Check-out Staff"}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleMaintenance(item)}
                                className={cn(
                                  "h-7 text-[10px] px-2 font-bold bg-white text-slate-700 border-slate-200",
                                  isRepair && "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                                )}
                              >
                                {isRepair ? "Fix & Return" : "Send Service"}
                              </Button>
                            </div>
                          </div>

                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Checkout logs history */}
          {activeTab === "history" && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">Checkout History Register</CardTitle>
                <CardDescription className="text-xs">
                  Full trace log of hardware distribution, returns, and maintenance events.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-450 uppercase tracking-wider">
                        <th className="py-3 px-6">Asset Item</th>
                        <th className="py-3 px-6">Action Trigger</th>
                        <th className="py-3 px-6">Employee Member</th>
                        <th className="py-3 px-6">Action Date</th>
                        <th className="py-3 px-6">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                      {localHistory.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="py-3.5 px-6 font-bold text-slate-800">
                            {log.assetName}
                          </td>
                          <td className="py-3.5 px-6">
                            <Badge
                              className={cn(
                                "text-[9px] border-0 font-bold uppercase tracking-wider",
                                log.action === "checkout" && "bg-blue-50 text-blue-700",
                                log.action === "checkin" && "bg-emerald-50 text-emerald-700",
                                log.action.includes("maintenance") && "bg-amber-50 text-amber-700",
                                log.action === "dispose" && "bg-rose-50 text-rose-700"
                              )}
                            >
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-6 font-semibold">
                            {log.employeeName || "-"}
                          </td>
                          <td className="py-3.5 px-6 text-slate-450">
                            {new Date(log.actionDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-6 text-slate-450 italic max-w-xs truncate">
                            {log.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Dialog 1: Create / Edit Asset */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {formMode === "create" ? "Log Company Asset" : "Edit Asset Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Register asset specifications, tags, and acquisition costs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Asset Name</label>
              <Input
                type="text"
                placeholder="E.g., Lenovo ThinkPad T14, LG Ultrawide 34-inch..."
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <select
                  value={formValues.category}
                  onChange={(e) => setFormValues({ ...formValues, category: e.target.value as AssetCategory })}
                  className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                >
                  <option value="electronics">Electronics/Hardware</option>
                  <option value="software">Licenses/Software</option>
                  <option value="furniture">Furniture</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Serial Tag / Barcode</label>
                <Input
                  type="text"
                  placeholder="E.g. SN-XYZ-12345"
                  value={formValues.serialNumber}
                  onChange={(e) => setFormValues({ ...formValues, serialNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Acquisition Cost ($)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formValues.cost || ""}
                  onChange={(e) => setFormValues({ ...formValues, cost: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Purchase Date</label>
                <Input
                  type="date"
                  value={formValues.purchaseDate}
                  onChange={(e) => setFormValues({ ...formValues, purchaseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Description / Specs Notes</label>
              <Textarea
                placeholder="Include specifications, warranty terms, or accessory details..."
                value={formValues.notes}
                onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
                className="h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Save to Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Checkout / Return Assignee Selection */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {selectedAsset?.status === "assigned" ? "Return Asset to Inventory" : "Checkout Asset to Staff"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Manage allocations and log handovers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 py-2">
            
            {/* Info display card */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <p className="font-bold text-slate-800">{selectedAsset?.name}</p>
              <p className="text-slate-400 mt-1">Serial Tag: {selectedAsset?.serialNumber}</p>
            </div>

            {selectedAsset?.status !== "assigned" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Assignee Employee</label>
                <select
                  value={checkoutTargetEmployeeId}
                  onChange={(e) => setCheckoutTargetEmployeeId(e.target.value)}
                  className="w-full h-9 px-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                  required
                >
                  <option value="">Select Employee Assignee</option>
                  {fallbackEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Checkout / In Notes</label>
              <Textarea
                placeholder="Include condition description, keycodes, or accessories details..."
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                className="h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCheckoutOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={cn(
                  "bg-indigo-600 text-white hover:bg-indigo-700 font-semibold",
                  selectedAsset?.status === "assigned" && "bg-rose-650 hover:bg-rose-700"
                )}
              >
                {selectedAsset?.status === "assigned" ? "Confirm Return" : "Confirm Checkout"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

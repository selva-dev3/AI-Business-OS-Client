"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Sliders,
  DollarSign,
  Tag,
  Boxes,
  CheckCircle,
  XCircle,
  MoreVertical,
  Layers,
  Sparkles,
  ClipboardList
} from "lucide-react";
import {
  useProductsList,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoriesList
} from "@/hooks/queries/inventory";
import { Product } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const localProducts: Product[] = [
  { id: "prod-1", name: "Enterprise Database Server", sku: "SRV-DB-001", description: "High-performance database server for enterprise use", unitPrice: 2499.99, costPrice: 1800.00, status: "active", trackInventory: true, reorderPoint: 5, createdAt: new Date().toISOString() },
  { id: "prod-2", name: "UltraWide 34\" Monitor", sku: "MON-UW-34", description: "34-inch curved ultrawide monitor for developers", unitPrice: 599.99, costPrice: 400.00, status: "active", trackInventory: true, reorderPoint: 10, createdAt: new Date().toISOString() },
  { id: "prod-3", name: "Ergonomic Mechanical Keyboard", sku: "KEY-ERG-01", description: "Split ergonomic mechanical keyboard with cherry mx brown switches", unitPrice: 189.99, costPrice: 120.00, status: "active", trackInventory: true, reorderPoint: 20, createdAt: new Date().toISOString() },
  { id: "prod-4", name: "Precision Laser Mouse", sku: "MSE-PRC-02", description: "High-precision wireless mouse with custom side buttons", unitPrice: 89.99, costPrice: 50.00, status: "inactive", trackInventory: true, reorderPoint: 15, createdAt: new Date().toISOString() }
];

export default function ProductsPage() {
  const { data: serverProducts } = useProductsList();
  const { data: serverCategories } = useCategoriesList();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [sandboxProducts, setSandboxProducts] = React.useState<Product[]>(localProducts);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("NONE");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [costPrice, setCostPrice] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
  const [trackInventory, setTrackInventory] = React.useState(true);
  const [reorderPoint, setReorderPoint] = React.useState("");

  const activeProducts = React.useMemo(() => {
    let list = sandboxProducts;
    if (serverProducts && Array.isArray(serverProducts) && serverProducts.length > 0) {
      list = serverProducts;
    }
    return list.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchCat = categoryFilter === "ALL" || p.categoryId === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [serverProducts, sandboxProducts, searchTerm, statusFilter, categoryFilter]);

  const categories = React.useMemo(() => {
    return serverCategories && Array.isArray(serverCategories) ? serverCategories : [
      { id: "cat-1", name: "Hardware" },
      { id: "cat-2", name: "Peripherals" },
      { id: "cat-3", name: "Networking" }
    ];
  }, [serverCategories]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxProducts;
    if (serverProducts && Array.isArray(serverProducts) && serverProducts.length > 0) {
      list = serverProducts;
    }
    const totalSKUs = list.length;
    const active = list.filter(p => p.status === "active").length;
    const inactive = list.filter(p => p.status === "inactive").length;
    const avgPrice = list.length > 0 ? list.reduce((sum, p) => sum + p.unitPrice, 0) / list.length : 0;
    return { totalSKUs, active, inactive, avgPrice };
  }, [serverProducts, sandboxProducts]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setName("");
    setSku("");
    setDescription("");
    setCategoryId("NONE");
    setUnitPrice("");
    setCostPrice("");
    setStatus("active");
    setTrackInventory(true);
    setReorderPoint("10");
    setIsFormOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setDescription(product.description || "");
    setCategoryId(product.categoryId || "NONE");
    setUnitPrice(product.unitPrice.toString());
    setCostPrice(product.costPrice.toString());
    setStatus(product.status);
    setTrackInventory(product.trackInventory);
    setReorderPoint(product.reorderPoint ? product.reorderPoint.toString() : "10");
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !unitPrice || !costPrice) {
      toast.error("Please fill in name, SKU, and prices.");
      return;
    }

    const payload = {
      name,
      sku,
      description: description || undefined,
      categoryId: categoryId === "NONE" ? undefined : categoryId,
      unitPrice: Number(unitPrice),
      costPrice: Number(costPrice),
      status,
      trackInventory,
      reorderPoint: reorderPoint ? Number(reorderPoint) : undefined,
    };

    if (editingProduct) {
      try {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, data: payload });
        toast.success("Product updated on server.");
      } catch (err) {
        setSandboxProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload, id: editingProduct.id } : p));
        toast.success("Product updated (Sandbox Mock).");
      }
    } else {
      try {
        await createProductMutation.mutateAsync(payload);
        toast.success("Product created on server.");
      } catch (err) {
        const newProduct: Product = {
          ...payload,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        setSandboxProducts(prev => [newProduct, ...prev]);
        toast.success("Product created (Sandbox Mock).");
      }
    }
    setIsFormOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Product deleted on server.");
    } catch (err) {
      setSandboxProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted (Sandbox Mock).");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Products Directory</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Define corporate sales SKUs, determine inventory tracking specifications, and view catalog rates.
          </p>
        </div>
        <div>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add SKU Product
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Products</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalSKUs}</p>
            <p className="mt-1 text-[12px] text-slate-400">Configured inventory items</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Active SKUs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-emerald-600">{metrics.active}</p>
            <p className="mt-1 text-[12px] text-emerald-600 font-medium">Available for orders</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Inactive SKUs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-rose-600">{metrics.inactive}</p>
            <p className="mt-1 text-[12px] text-slate-400">Suspended or discontinued</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Avg Unit Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(metrics.avgPrice)}</p>
            <p className="mt-1 text-[12px] text-slate-400">Mean list sale price</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search by product name or SKU code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-200 bg-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Track Stock</th>
                <th className="py-3 px-4 text-center">Reorder Point</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    No products matching search filters.
                  </td>
                </tr>
              ) : (
                activeProducts.map((p) => {
                  const linkedCat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>
                          <p>{p.name}</p>
                          {p.description && (
                            <span className="text-[11px] font-normal text-slate-400 block line-clamp-1 max-w-[200px]">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{p.sku}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {linkedCat ? linkedCat.name : "Uncategorized"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(p.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(p.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.trackInventory ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                          {p.trackInventory ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {p.reorderPoint ?? "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${p.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.status === "active" ? "bg-emerald-600" : "bg-rose-600"}`} />
                          {p.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-white border border-slate-200">
                            <DropdownMenuItem onClick={() => openEditDialog(p)} className="cursor-pointer">
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                            >
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingProduct ? "Edit SKU Product" : "Add SKU Product"}
            </DialogTitle>
            <DialogDescription>
              Provide sales inventory SKU pricing, catalogs, and tracking flags.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[12px] font-semibold text-slate-600">Product Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Database Server"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-[12px] font-semibold text-slate-600">SKU Code</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. SRV-DB-001"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-[12px] font-semibold text-slate-600">Product Description</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief business summary of this SKU"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="catId" className="text-[12px] font-semibold text-slate-600">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Uncategorized</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="statusSelect" className="text-[12px] font-semibold text-slate-600">Sales Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="costPrice" className="text-[12px] font-semibold text-slate-600">Cost Price ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice" className="text-[12px] font-semibold text-slate-600">Unit Sale Price ($)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trackInv" className="text-xs font-bold text-slate-700">Track Stock Inventory</Label>
                <p className="text-[11px] text-slate-400">Trigger warnings when stock drops below safety margins.</p>
              </div>
              <Switch
                id="trackInv"
                checked={trackInventory}
                onCheckedChange={setTrackInventory}
              />
            </div>

            {trackInventory && (
              <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                <Label htmlFor="reorder" className="text-[12px] font-semibold text-slate-600">Reorder Safety Level</Label>
                <Input
                  id="reorder"
                  type="number"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
            )}

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
                Save Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

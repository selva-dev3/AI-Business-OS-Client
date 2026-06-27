"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FolderTree,
  Plus,
  Search,
  Tag,
  Layers,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  useCategoriesList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category
} from "@/hooks/queries/inventory";
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

const localCategories: Category[] = [
  { id: "cat-1", name: "Enterprise Servers", description: "High-density rack servers and database appliances", productCount: 12 },
  { id: "cat-2", name: "Displays & Monitors", description: "Ultra-wide curved panels, dual monitors, and display stands", productCount: 8 },
  { id: "cat-3", name: "Developer Peripherals", description: "Ergonomic mechanical keyboards, precision mice, and macro pads", productCount: 15 },
  { id: "cat-4", name: "Networking Hardware", description: "Managed L3 switches, SFP+ transceivers, and high-performance routers", productCount: 5 }
];

export default function CategoriesPage() {
  const { data: serverCategories } = useCategoriesList();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [sandboxCategories, setSandboxCategories] = React.useState<Category[]>(localCategories);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const activeCategories = React.useMemo(() => {
    let list = sandboxCategories;
    if (serverCategories && Array.isArray(serverCategories) && serverCategories.length > 0) {
      list = serverCategories;
    }
    return list.filter((cat) => {
      const matchSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [serverCategories, sandboxCategories, searchTerm]);

  // Aggregate metrics
  const metrics = React.useMemo(() => {
    let list = sandboxCategories;
    if (serverCategories && Array.isArray(serverCategories) && serverCategories.length > 0) {
      list = serverCategories;
    }
    const totalCategories = list.length;
    const totalSkus = list.reduce((sum, item) => sum + (item.productCount || 0), 0);
    const topCategory = list.reduce((max, item) => 
      (item.productCount || 0) > (max.productCount || 0) ? item : max
    , list[0] || { name: "None", productCount: 0 });
    
    return { totalCategories, totalSkus, topCategoryName: topCategory.name };
  }, [serverCategories, sandboxCategories]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsFormOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    const payload = { name, description };

    if (editingCategory) {
      try {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: { name, description }
        });
        toast.success("Category updated on server.");
      } catch (err) {
        setSandboxCategories(prev =>
          prev.map(cat => (cat.id === editingCategory.id ? { ...cat, ...payload } : cat))
        );
        toast.success("Category updated (Sandbox Mock).");
      }
    } else {
      try {
        await createCategoryMutation.mutateAsync({ name, description });
        toast.success("Category created on server.");
      } catch (err) {
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name,
          description,
          productCount: 0
        };
        setSandboxCategories(prev => [newCat, ...prev]);
        toast.success("Category created (Sandbox Mock).");
      }
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product category?")) return;
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast.success("Category deleted on server.");
    } catch (err) {
      setSandboxCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success("Category deleted (Sandbox Mock).");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Product Categories</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Define catalog classifications, manage taxonomy hierarchies, and review SKU association counts.
          </p>
        </div>
        <div>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Total Categories</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FolderTree className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalCategories}</p>
            <p className="mt-1 text-[12px] text-slate-400">Classified catalogs</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Assigned SKUs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Layers className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900">{metrics.totalSkus}</p>
            <p className="mt-1 text-[12px] text-slate-400">Catalog items linked</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-slate-500">Top Classification</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Tag className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-slate-900 truncate">{metrics.topCategoryName}</p>
            <p className="mt-1 text-[12px] text-slate-400">Largest product count footprint</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters row */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search categories by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Categories Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Associated Products</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No product categories matched search criteria.
                  </td>
                </tr>
              ) : (
                activeCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{cat.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{cat.description || <span className="text-slate-350 italic">No description added</span>}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {cat.productCount ?? 0} Products
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cat)}
                          className="h-8 w-8 text-slate-450 hover:text-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat.id)}
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

      {/* Create / Edit Category Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingCategory ? "Edit Product Category" : "Create Product Category"}
            </DialogTitle>
            <DialogDescription>
              Organize inventory catalogs using structured taxonomies.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-[12px] font-semibold text-slate-600">Category Name</Label>
              <Input
                id="catName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Developer Peripherals"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-[12px] font-semibold text-slate-600">Description</Label>
              <textarea
                id="catDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of product classifications inside this taxonomy..."
                className="w-full min-h-20 rounded-md border border-slate-200 bg-transparent py-2 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

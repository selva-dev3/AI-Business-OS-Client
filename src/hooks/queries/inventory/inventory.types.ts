import { Product, Warehouse, StockLevel, StockTransfer } from "@/types/inventory";

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
}

export interface ProductListParams {
  search?: string;
  status?: string;
  categoryId?: string;
}

export interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  unitPrice: number;
  costPrice: number;
  status: "active" | "inactive";
  trackInventory: boolean;
  reorderPoint?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface WarehouseListParams {
  search?: string;
}

export interface CreateWarehouseData {
  name: string;
  location: string;
  managerName?: string;
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {}

export interface StockListParams {
  search?: string;
  warehouseId?: string;
  lowStockOnly?: boolean;
}

export interface AdjustStockData {
  productId: string;
  warehouseId: string;
  quantity: number; // delta or adjustment amount
  type: "in" | "out" | "adjustment";
  reason?: string;
}

export interface TransferListParams {
  status?: string;
}

export interface CreateTransferData {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export type Product = {
  id: string;
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  unitPrice: number;
  costPrice: number;
  images?: string[];
  status: "active" | "inactive";
  trackInventory: boolean;
  reorderPoint?: number;
  createdAt: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  unitPrice: number;
  costPrice: number;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  managerId?: string;
  manager?: { id: string; name: string };
};

export type StockLevel = {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint?: number;
  isLowStock: boolean;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  type: "in" | "out" | "adjustment" | "transfer_in" | "transfer_out";
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  createdBy: { id: string; name: string };
};

export type StockTransfer = {
  id: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: "pending" | "in_transit" | "completed" | "cancelled";
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  createdAt: string;
};

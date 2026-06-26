import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Product, StockLevel } from "@/types/inventory";

// Mock products
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Enterprise Database Server",
    sku: "SRV-DB-001",
    description: "High-performance database server for enterprise use",
    unitPrice: 2499.99,
    costPrice: 1800.00,
    status: "active",
    trackInventory: true,
    reorderPoint: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "UltraWide 34\" Monitor",
    sku: "MON-UW-34",
    description: "34-inch curved ultrawide monitor for developers",
    unitPrice: 599.99,
    costPrice: 400.00,
    status: "active",
    trackInventory: true,
    reorderPoint: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    name: "Ergonomic Mechanical Keyboard",
    sku: "KEY-ERG-01",
    description: "Split ergonomic mechanical keyboard with cherry mx brown switches",
    unitPrice: 189.99,
    costPrice: 120.00,
    status: "active",
    trackInventory: true,
    reorderPoint: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-4",
    name: "Precision Laser Mouse",
    sku: "MSE-PRC-02",
    description: "High-precision wireless mouse with custom side buttons",
    unitPrice: 89.99,
    costPrice: 50.00,
    status: "active",
    trackInventory: true,
    reorderPoint: 15,
    createdAt: new Date().toISOString(),
  }
];

// Mock stock levels
const MOCK_STOCK: StockLevel[] = [
  {
    id: "stock-1",
    productId: "prod-1",
    productName: "Enterprise Database Server",
    warehouseId: "wh-1",
    warehouseName: "Main Warehouse",
    quantity: 3,
    reservedQuantity: 1,
    availableQuantity: 2,
    reorderPoint: 5,
    isLowStock: true,
  },
  {
    id: "stock-2",
    productId: "prod-2",
    productName: "UltraWide 34\" Monitor",
    warehouseId: "wh-1",
    warehouseName: "Main Warehouse",
    quantity: 12,
    reservedQuantity: 2,
    availableQuantity: 10,
    reorderPoint: 10,
    isLowStock: false,
  },
  {
    id: "stock-3",
    productId: "prod-3",
    productName: "Ergonomic Mechanical Keyboard",
    warehouseId: "wh-2",
    warehouseName: "East Coast Hub",
    quantity: 8,
    reservedQuantity: 0,
    availableQuantity: 8,
    reorderPoint: 20,
    isLowStock: true,
  },
  {
    id: "stock-4",
    productId: "prod-4",
    productName: "Precision Laser Mouse",
    warehouseId: "wh-2",
    warehouseName: "East Coast Hub",
    quantity: 35,
    reservedQuantity: 5,
    availableQuantity: 30,
    reorderPoint: 15,
    isLowStock: false,
  }
];

export const inventoryService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>(endpoints.inventory.products);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch products from API, returning mock data", error);
      return MOCK_PRODUCTS;
    }
  },

  getStock: async (): Promise<StockLevel[]> => {
    try {
      const response = await api.get<StockLevel[]>(endpoints.inventory.stock);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch stock levels from API, returning mock data", error);
      return MOCK_STOCK;
    }
  },
};

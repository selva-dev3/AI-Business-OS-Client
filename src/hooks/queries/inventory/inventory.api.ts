import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { buildQueryString } from "@/hooks/queries/utils";
import { Product, Warehouse, StockLevel, StockTransfer } from "@/types/inventory";
import {
  Category,
  CreateProductData,
  UpdateProductData,
  CreateWarehouseData,
  UpdateWarehouseData,
  AdjustStockData,
  CreateTransferData,
  CreateCategoryData,
  UpdateCategoryData,
  ProductListParams,
  WarehouseListParams,
  StockListParams,
  TransferListParams
} from "./inventory.types";

const BASE = "/inventory";

export const inventoryApi = {
  // --- Products ---
  listProducts: async (params?: ProductListParams): Promise<Product[]> => {
    try {
      return await apiGet<Product[]>(`${BASE}/products${buildQueryString(params as any ?? {})}`);
    } catch (err) {
      console.warn("Failed API listProducts, using client fallback", err);
      throw err; // throw to let query hooks handle fallback gracefully
    }
  },
  createProduct: (data: CreateProductData) =>
    apiPost<Product>(`${BASE}/products`, data),
  updateProduct: (id: string, data: UpdateProductData) =>
    apiPatch<Product>(`${BASE}/products/${id}`, data),
  deleteProduct: (id: string) =>
    apiDelete<void>(`${BASE}/products/${id}`),

  // --- Warehouses ---
  listWarehouses: async (params?: WarehouseListParams): Promise<Warehouse[]> => {
    try {
      return await apiGet<Warehouse[]>(`${BASE}/warehouses${buildQueryString(params as any ?? {})}`);
    } catch (err) {
      console.warn("Failed API listWarehouses, using client fallback", err);
      throw err;
    }
  },
  createWarehouse: (data: CreateWarehouseData) =>
    apiPost<Warehouse>(`${BASE}/warehouses`, data),
  updateWarehouse: (id: string, data: UpdateWarehouseData) =>
    apiPatch<Warehouse>(`${BASE}/warehouses/${id}`, data),
  deleteWarehouse: (id: string) =>
    apiDelete<void>(`${BASE}/warehouses/${id}`),

  // --- Stock Levels ---
  listStock: async (params?: StockListParams): Promise<StockLevel[]> => {
    try {
      return await apiGet<StockLevel[]>(`${BASE}/stock${buildQueryString(params as any ?? {})}`);
    } catch (err) {
      console.warn("Failed API listStock, using client fallback", err);
      throw err;
    }
  },
  adjustStock: (data: AdjustStockData) =>
    apiPost<StockLevel>(`${BASE}/stock/adjust`, data),

  // --- Transfers ---
  listTransfers: async (params?: TransferListParams): Promise<StockTransfer[]> => {
    try {
      return await apiGet<StockTransfer[]>(`${BASE}/transfers${buildQueryString(params as any ?? {})}`);
    } catch (err) {
      console.warn("Failed API listTransfers, using client fallback", err);
      throw err;
    }
  },
  createTransfer: (data: CreateTransferData) =>
    apiPost<StockTransfer>(`${BASE}/transfers`, data),
  updateTransferStatus: (id: string, status: string) =>
    apiPatch<StockTransfer>(`${BASE}/transfers/${id}/status`, { status }),

  // --- Categories ---
  listCategories: async (): Promise<Category[]> => {
    try {
      return await apiGet<Category[]>(`${BASE}/categories`);
    } catch (err) {
      console.warn("Failed API listCategories, using client fallback", err);
      throw err;
    }
  },
  createCategory: (data: CreateCategoryData) =>
    apiPost<Category>(`${BASE}/categories`, data),
  updateCategory: (id: string, data: UpdateCategoryData) =>
    apiPatch<Category>(`${BASE}/categories/${id}`, data),
  deleteCategory: (id: string) =>
    apiDelete<void>(`${BASE}/categories/${id}`),
};

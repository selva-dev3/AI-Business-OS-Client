import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { inventoryApi } from "./inventory.api";
import {
  ProductListParams,
  CreateProductData,
  UpdateProductData,
  WarehouseListParams,
  CreateWarehouseData,
  UpdateWarehouseData,
  StockListParams,
  AdjustStockData,
  TransferListParams,
  CreateTransferData,
  CreateCategoryData,
  UpdateCategoryData
} from "./inventory.types";

// Helper query keys for warehouse, transfers, categories
const WAREHOUSE_KEYS = {
  all: ["inventory", "warehouses"] as const,
  list: (params?: WarehouseListParams) => ["inventory", "warehouses", "list", params] as const,
};

const TRANSFER_KEYS = {
  all: ["inventory", "transfers"] as const,
  list: (params?: TransferListParams) => ["inventory", "transfers", "list", params] as const,
};

const CATEGORY_KEYS = {
  all: ["inventory", "categories"] as const,
};

// --- Products Hooks ---

export function useProductsList(params?: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => inventoryApi.listProducts(params),
    retry: 1,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// --- Warehouses Hooks ---

export function useWarehousesList(params?: WarehouseListParams) {
  return useQuery({
    queryKey: WAREHOUSE_KEYS.list(params),
    queryFn: () => inventoryApi.listWarehouses(params),
    retry: 1,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEYS.all });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseData }) =>
      inventoryApi.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEYS.all });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEYS.all });
    },
  });
}

// --- Stock Hooks ---

export function useStockList(params?: StockListParams) {
  return useQuery({
    queryKey: queryKeys.stock.list(params),
    queryFn: () => inventoryApi.listStock(params),
    retry: 1,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
    },
  });
}

// --- Transfers Hooks ---

export function useTransfersList(params?: TransferListParams) {
  return useQuery({
    queryKey: TRANSFER_KEYS.list(params),
    queryFn: () => inventoryApi.listTransfers(params),
    retry: 1,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
    },
  });
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inventoryApi.updateTransferStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all });
    },
  });
}

// --- Categories Hooks ---

export function useCategoriesList() {
  return useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: () => inventoryApi.listCategories(),
    retry: 1,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      inventoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

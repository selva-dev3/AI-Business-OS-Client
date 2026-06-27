import { apiGet, apiPost, apiPatch, apiDelete } from "@/hooks/queries/client";
import { Asset, AssetHistory, CreateAssetData, UpdateAssetData } from "./assets.types";

const BASE_ASSETS = "/hrms/assets";

export const assetsApi = {
  getAll: () =>
    apiGet<Asset[]>(BASE_ASSETS),

  getById: (id: string) =>
    apiGet<Asset>(`${BASE_ASSETS}/${id}`),

  create: (data: CreateAssetData) =>
    apiPost<Asset>(BASE_ASSETS, data),

  update: (id: string, data: UpdateAssetData) =>
    apiPatch<Asset>(`${BASE_ASSETS}/${id}`, data),

  delete: (id: string) =>
    apiDelete<void>(`${BASE_ASSETS}/${id}`),

  getHistory: (id: string) =>
    apiGet<AssetHistory[]>(`${BASE_ASSETS}/${id}/history`),
} as const;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "./assets.api";
import { assetsKeys } from "./assets.keys";
import { CreateAssetData, UpdateAssetData } from "./assets.types";

export function useAssets() {
  return useQuery({
    queryKey: assetsKeys.list(),
    queryFn: () => assetsApi.getAll(),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssetData) => assetsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assetsKeys.all });
    },
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetData }) =>
      assetsApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: assetsKeys.all });
      qc.invalidateQueries({ queryKey: assetsKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assetsKeys.all });
    },
  });
}

export function useAssetHistory(id: string) {
  return useQuery({
    queryKey: assetsKeys.history(id),
    queryFn: () => assetsApi.getHistory(id),
    enabled: !!id,
  });
}

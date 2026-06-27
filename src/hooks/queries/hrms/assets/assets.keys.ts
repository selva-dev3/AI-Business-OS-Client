export const assetsKeys = {
  all: ["assets"] as const,
  lists: () => [...assetsKeys.all, "list"] as const,
  list: () => [...assetsKeys.lists()] as const,
  details: () => [...assetsKeys.all, "detail"] as const,
  detail: (id: string) => [...assetsKeys.details(), id] as const,
  histories: () => [...assetsKeys.all, "history"] as const,
  history: (id: string) => [...assetsKeys.histories(), id] as const,
} as const;

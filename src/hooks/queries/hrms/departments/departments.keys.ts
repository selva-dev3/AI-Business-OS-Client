export const departmentsKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentsKeys.all, "list"] as const,
  list: () => [...departmentsKeys.lists()] as const,
  details: () => [...departmentsKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentsKeys.details(), id] as const,
} as const;

export const companyKeys = {
  all: ["company"] as const,
  detail: () => [...companyKeys.all, "detail"] as const,
  settings: () => [...companyKeys.all, "settings"] as const,
  branches: () => [...companyKeys.all, "branches"] as const,
} as const;

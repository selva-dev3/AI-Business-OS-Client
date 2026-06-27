export const financeKeys = {
  invoices: {
    all: ["invoices"] as const,
    list: (params?: unknown) => ["invoices", "list", params] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    list: (params?: unknown) => ["expenses", "list", params] as const,
    detail: (id: string) => ["expenses", "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (params?: unknown) => ["payments", "list", params] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },
  budgets: {
    all: ["budgets"] as const,
    list: (params?: unknown) => ["budgets", "list", params] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    list: (params?: unknown) => ["accounts", "list", params] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
  },
} as const;

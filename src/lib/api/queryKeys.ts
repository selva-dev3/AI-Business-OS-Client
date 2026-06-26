export const queryKeys = {
  dashboard: {
    dashboard: () => ["dashboard", "dashboard"] as const,
  },
  employees: {
    all: ["employees"] as const,
    list: (params?: unknown) => ["employees", "list", params] as const,
    detail: (id: string) => ["employees", "detail", id] as const,
    attendance: (id: string) => ["employees", "attendance", id] as const,
    leave: (id: string) => ["employees", "leave", id] as const,
    assets: (id: string) => ["employees", "assets", id] as const,
    payslips: (id: string) => ["employees", "payslips", id] as const,
  },
  departments: {
    all: ["departments"] as const,
    list: () => ["departments", "list"] as const,
    detail: (id: string) => ["departments", "detail", id] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    list: (params?: unknown) => ["attendance", "list", params] as const,
    summary: () => ["attendance", "summary"] as const,
  },
  leave: {
    all: ["leave"] as const,
    list: (params?: unknown) => ["leave", "list", params] as const,
    balance: () => ["leave", "balance"] as const,
    calendar: () => ["leave", "calendar"] as const,
  },
  payroll: {
    all: ["payroll"] as const,
    list: () => ["payroll", "list"] as const,
    detail: (id: string) => ["payroll", "detail", id] as const,
  },
  leads: {
    all: ["leads"] as const,
    list: (params?: unknown) => ["leads", "list", params] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
  contacts: {
    all: ["contacts"] as const,
    list: (params?: unknown) => ["contacts", "list", params] as const,
    detail: (id: string) => ["contacts", "detail", id] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    list: (params?: unknown) => ["accounts", "list", params] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
  },
  deals: {
    all: ["deals"] as const,
    list: (params?: unknown) => ["deals", "list", params] as const,
    detail: (id: string) => ["deals", "detail", id] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params?: unknown) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    stockHistory: (id: string) => ["products", "stock-history", id] as const,
  },
  stock: {
    all: ["stock"] as const,
    list: (params?: unknown) => ["stock", "list", params] as const,
  },
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
  projects: {
    all: ["projects"] as const,
    list: (params?: unknown) => ["projects", "list", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    tasks: (projectId: string) => ["projects", "tasks", projectId] as const,
    milestones: (projectId: string) => ["projects", "milestones", projectId] as const,
    timesheets: (projectId: string) => ["projects", "timesheets", projectId] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (params?: unknown) => ["tasks", "list", params] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    list: (params?: unknown) => ["tickets", "list", params] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  documents: {
    all: ["documents"] as const,
    list: (folderId?: string) => ["documents", "list", folderId] as const,
    folders: () => ["documents", "folders"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    dashboard: () => ["analytics", "dashboard"] as const,
  },
  settings: {
    profile: () => ["settings", "profile"] as const,
    company: () => ["settings", "company"] as const,
    users: () => ["settings", "users"] as const,
    roles: () => ["settings", "roles"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },
};

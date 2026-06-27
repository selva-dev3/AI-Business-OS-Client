export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  dashboard: {
    dashboard: "/dashboard",
  },
  hrms: {
    employees: "/hrms/employees",
    departments: "/hrms/departments",
    attendance: "/hrms/attendance",
    leaveRequests: "/hrms/leave-requests",
    leaveBalance: "/hrms/leave-balance",
    leaveCalendar: "/hrms/leave-calendar",
    payroll: "/hrms/payroll",
    assets: "/hrms/assets",
  },
  crm: {
    leads: "/crm/leads",
    contacts: "/crm/contacts",
    accounts: "/crm/accounts",
    deals: "/crm/deals",
    activities: "/crm/activities",
  },
  inventory: {
    products: "/inventory/products",
    stock: "/inventory/stock",
    warehouses: "/inventory/warehouses",
    transfers: "/inventory/transfers",
  },
  procurement: {
    vendors: "/procurement/vendors",
    rfq: "/procurement/rfq",
    purchaseOrders: "/procurement/purchase-orders",
  },
  finance: {
    invoices: "/finance/invoices",
    expenses: "/finance/expenses",
    payments: "/finance/payments",
    accounts: "/finance/accounts",
    budgets: "/finance/budgets",
  },
  projects: {
    projects: "/projects",
    tasks: "/projects/tasks",
    milestones: "/projects/milestones",
    timesheets: "/projects/timesheets",
  },
  support: {
    tickets: "/support/tickets",
    categories: "/support/categories",
  },
  documents: {
    folders: "/documents/folders",
    files: "/documents/files",
  },
  analytics: {
    dashboard: "/analytics/dashboard",
    reports: "/analytics/reports",
  },
  settings: {
    profile: "/settings/profile",
    company: "/settings/company",
    users: "/settings/users",
    roles: "/settings/roles",
  },
};

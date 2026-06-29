import { Badge } from "@/components/ui/badge";

export const getInitials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export const getStatusBadge = (status = "active") => {
  const labels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    terminated: "Terminated",
    on_leave: "On Leave",
    suspended: "Suspended",
  };
  const styles: Record<string, string> = {
    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    inactive:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30",
    terminated:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
    on_leave:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    suspended:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  };
  return (
    <Badge
      variant="outline"
      className={`capitalize font-bold text-[10px] tracking-wide px-2.5 py-0.5 rounded-full ${
        styles[status] || styles.active
      }`}
    >
      {labels[status] || status}
    </Badge>
  );
};

export const getEmploymentTypeLabel = (type = "full_time") => {
  const types: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
    intern: "Internship",
  };
  return types[type] || type.replace("_", "-");
};

export const getDeptName = (employee: {
  department?: { name?: string } | null;
  departmentId?: string;
}) => {
  if (typeof employee.department === "object" && employee.department?.name) {
    return employee.department.name;
  }
  const deptMap: Record<string, string> = {
    "dept-1": "Engineering",
    "dept-2": "Product & Design",
    "dept-3": "Sales & Marketing",
    "dept-4": "Human Resources",
    "dept-5": "Finance & Legal",
    "dept-6": "Customer Support",
  };
  return (employee.departmentId && deptMap[employee.departmentId]) || "Corporate";
};

export const maskAccountNumber = (val?: string) => {
  if (!val) return "Not Provided";
  const clean = val.trim();
  if (clean.length <= 4) return clean;
  return `•••• •••• ${clean.slice(-4)}`;
};

export const maskAadharNumber = (val?: string) => {
  if (!val) return "Not Provided";
  const clean = val.replace(/\D/g, "");
  if (clean.length <= 4) return val;
  return `•••• •••• ${clean.slice(-4)}`;
};

export const maskPanNumber = (val?: string) => {
  if (!val) return "Not Provided";
  const clean = val.trim().toUpperCase();
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 2)}•••••${clean.slice(-3)}`;
};
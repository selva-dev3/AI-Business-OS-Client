import { Permission, PermissionAction, PermissionScope } from "@/types/auth";

export const ALL_PERMISSIONS: Permission[] = [
  { module: "hrms", action: "create", scope: "company" },
  { module: "hrms", action: "read", scope: "company" },
  { module: "hrms", action: "update", scope: "company" },
  { module: "hrms", action: "delete", scope: "company" },
  { module: "hrms", action: "export", scope: "company" },
  { module: "hrms", action: "approve", scope: "company" },
  { module: "crm", action: "create", scope: "company" },
  { module: "crm", action: "read", scope: "company" },
  { module: "crm", action: "update", scope: "company" },
  { module: "crm", action: "delete", scope: "company" },
  { module: "crm", action: "export", scope: "company" },
  { module: "inventory", action: "create", scope: "company" },
  { module: "inventory", action: "read", scope: "company" },
  { module: "inventory", action: "update", scope: "company" },
  { module: "inventory", action: "delete", scope: "company" },
  { module: "inventory", action: "export", scope: "company" },
  { module: "procurement", action: "create", scope: "company" },
  { module: "procurement", action: "read", scope: "company" },
  { module: "procurement", action: "update", scope: "company" },
  { module: "procurement", action: "delete", scope: "company" },
  { module: "procurement", action: "approve", scope: "company" },
  { module: "finance", action: "create", scope: "company" },
  { module: "finance", action: "read", scope: "company" },
  { module: "finance", action: "update", scope: "company" },
  { module: "finance", action: "delete", scope: "company" },
  { module: "finance", action: "export", scope: "company" },
  { module: "finance", action: "approve", scope: "company" },
  { module: "projects", action: "create", scope: "company" },
  { module: "projects", action: "read", scope: "company" },
  { module: "projects", action: "update", scope: "company" },
  { module: "projects", action: "delete", scope: "company" },
  { module: "support", action: "create", scope: "company" },
  { module: "support", action: "read", scope: "company" },
  { module: "support", action: "update", scope: "company" },
  { module: "support", action: "delete", scope: "company" },
  { module: "documents", action: "create", scope: "company" },
  { module: "documents", action: "read", scope: "company" },
  { module: "documents", action: "update", scope: "company" },
  { module: "documents", action: "delete", scope: "company" },
  { module: "settings", action: "create", scope: "company" },
  { module: "settings", action: "read", scope: "company" },
  { module: "settings", action: "update", scope: "company" },
  { module: "settings", action: "delete", scope: "company" },
];

export function getDefaultRolePermissions(roleName: string): Permission[] {
  switch (roleName) {
    case "SUPER_ADMIN":
      return ALL_PERMISSIONS;
    case "ADMIN":
      return ALL_PERMISSIONS.filter(
        (p) => !(p.module === "settings" && p.action === "delete")
      );
    case "MANAGER":
      return ALL_PERMISSIONS.filter(
        (p) =>
          p.action !== "delete" && !(p.module === "settings" && ["create", "delete"].includes(p.action))
      );
    case "EMPLOYEE":
      return [
        { module: "hrms", action: "read", scope: "own" },
        { module: "projects", action: "read", scope: "own" },
        { module: "projects", action: "update", scope: "own" },
        { module: "support", action: "create", scope: "own" },
        { module: "support", action: "read", scope: "own" },
        { module: "documents", action: "read", scope: "company" },
      ];
    case "VIEWER":
      return ALL_PERMISSIONS.filter((p) => p.action === "read");
    default:
      return [];
  }
}

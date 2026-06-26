import { Permission } from "@/types/auth";

export const MODULES = [
  "hrms",
  "crm",
  "inventory",
  "procurement",
  "finance",
  "projects",
  "support",
  "documents",
  "analytics",
  "settings",
] as const;

export const ACTIONS = ["create", "read", "update", "delete", "export", "approve"] as const;

export const SCOPES = ["own", "department", "company"] as const;

export function generatePermissionMatrix(rolePermissions: Permission[]): Record<string, Record<string, boolean>> {
  const matrix: Record<string, Record<string, boolean>> = {};
  MODULES.forEach((module) => {
    matrix[module] = {};
    ACTIONS.forEach((action) => {
      matrix[module][action] = rolePermissions.some(
        (p) => p.module === module && p.action === action
      );
    });
  });
  return matrix;
}

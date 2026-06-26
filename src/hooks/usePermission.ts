"use client";

import { useAuthStore } from "@/store/authStore";

export function usePermission() {
  const { user, permissions } = useAuthStore();

  const can = (module: string, action: string, scope?: string): boolean => {
    if (user?.role === "SUPER_ADMIN") return true;

    return (
      permissions?.some(
        (p) =>
          p.module === module &&
          p.action === action &&
          (!scope || p.scope === scope || p.scope === "company")
      ) ?? false
    );
  };

  const canAny = (module: string, actions: string[]): boolean => {
    return actions.some((action) => can(module, action));
  };

  const canAnyModule = (modules: { module: string; action: string }[]): boolean => {
    return modules.some(({ module, action }) => can(module, action));
  };

  return { can, canAny, canAnyModule };
}

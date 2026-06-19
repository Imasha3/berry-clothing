import { adminModules } from "@/lib/constants";
import type { ModuleKey, Permission } from "@/types/permission";
import type { Role } from "@/types/user";

const moduleRules: Record<ModuleKey, Permission[]> = {
  dashboard: ["dashboard.view"],
  products: ["products.view"],
  categories: ["categories.view"],
  orders: ["orders.view"],
  payments: ["payments.view"],
  inventory: ["inventory.view"],
  customers: ["customers.view"],
  reports: ["reports.view"],
  promotions: ["promotions.manage"],
  reviews: ["reviews.manage"],
  users: ["users.manage"],
  roles: ["roles.manage"],
  settings: ["settings.manage"],
  "email-templates": ["email_templates.manage"]
};

export function hasPermission(role: Role, permission: Permission) {
  return role.permissions.includes(permission);
}

export function canAccessModule(role: Role, moduleKey: ModuleKey) {
  const rules = moduleRules[moduleKey];
  return rules.length === 0 || rules.some((rule) => hasPermission(role, rule));
}

export function getVisibleAdminModules(role: Role) {
  return adminModules.filter((module) => canAccessModule(role, module.key));
}

export function getAdminModuleFromPath(pathname: string): ModuleKey | null {
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const moduleSegment = segments[1];

  if (!moduleSegment || moduleSegment === "dashboard" || moduleSegment === "login") {
    return "dashboard";
  }

  const module = adminModules.find((entry) => entry.href.split("/")[2] === moduleSegment);
  return module?.key ?? null;
}

import type { Permission } from "@/types/permission";
import type { AdminUser, Role } from "@/types/user";

export const allPermissions: Permission[] = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "categories.view",
  "categories.create",
  "categories.edit",
  "categories.delete",
  "orders.view",
  "orders.update",
  "payments.view",
  "payments.verify",
  "inventory.view",
  "inventory.stock_in",
  "inventory.stock_out",
  "customers.view",
  "reports.view",
  "promotions.manage",
  "reviews.manage",  "videos.manage",  "users.manage",
  "roles.manage",
  "settings.manage",
  "email_templates.manage"
];

export const mockRoles: Role[] = [
  {
    id: "super-admin",
    key: "super-admin",
    name: "Super Admin",
    description: "Full access to all modules, roles, and destructive actions.",
    permissions: allPermissions,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-12T08:30:00.000Z"
  },
  {
    id: "admin",
    key: "admin",
    name: "Admin",
    description: "Operational access with user and permission controls delegated by Super Admin.",
    permissions: allPermissions.filter(
      (permission) => permission !== "products.delete" && permission !== "categories.delete"
    ),
    createdAt: "2026-06-01T08:05:00.000Z",
    updatedAt: "2026-06-12T08:30:00.000Z"
  },
  {
    id: "order-staff",
    key: "order-staff",
    name: "Order Staff",
    description: "Can view orders and progress them through fulfillment stages.",
    permissions: ["dashboard.view", "orders.view", "orders.update", "payments.view", "payments.verify", "customers.view"],
    createdAt: "2026-06-01T08:10:00.000Z",
    updatedAt: "2026-06-12T08:30:00.000Z"
  },
  {
    id: "inventory-staff",
    key: "inventory-staff",
    name: "Inventory Staff",
    description: "Manages stock movement and stock visibility only.",
    permissions: ["dashboard.view", "inventory.view", "inventory.stock_in", "inventory.stock_out", "products.view"],
    createdAt: "2026-06-01T08:15:00.000Z",
    updatedAt: "2026-06-12T08:30:00.000Z"
  },
  {
    id: "marketing-staff",
    key: "marketing-staff",
    name: "Marketing Staff",
    description: "Owns promotions, reviews, and campaign content modules.",
    permissions: ["dashboard.view", "promotions.manage", "reviews.manage", "products.view", "reports.view", "videos.manage"],
    createdAt: "2026-06-01T08:20:00.000Z",
    updatedAt: "2026-06-12T08:30:00.000Z"
  }
];

export const mockUsers: AdminUser[] = [];

import type { Permission } from "@/types/permission";

export type RoleKey =
  | "super-admin"
  | "admin"
  | "order-staff"
  | "inventory-staff"
  | "marketing-staff";

export interface Role {
  id: string;
  key: RoleKey;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: RoleKey;
  password: string;
  status: "Active" | "Inactive";
  canManageUsers: boolean;
  canManageRoles: boolean;
  canDeleteUsers: boolean;
  isSuperAdmin: boolean;
  avatar: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

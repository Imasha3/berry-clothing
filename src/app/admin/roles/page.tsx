"use client";

import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useAdminSession, hashPassword } from "@/components/providers/admin-session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/permission";
import type { Role, RoleKey, AdminUser } from "@/types/user";

/* ─────────────────────────────────────────────
   PERMISSION → DISPLAY MAP
   Maps technical permission keys to:
   - A human-readable, executive-friendly label
   - The module group it belongs to
   - A short action verb for visual classification
───────────────────────────────────────────── */
const PERMISSION_DISPLAY: Record<
  Permission,
  { label: string; action: string; groupKey: string; description?: string }
> = {
  "dashboard.view":        { label: "Access Control Center",        action: "View",    groupKey: "dashboard", description: "View the main operations dashboard" },
  "products.view":         { label: "View Catalogue",               action: "View",    groupKey: "products", description: "Browse all collection items" },
  "products.create":       { label: "Add to Catalogue",             action: "Create",  groupKey: "products", description: "Create new product listings" },
  "products.edit":         { label: "Update Product Details",       action: "Edit",    groupKey: "products", description: "Modify product information" },
  "products.delete":       { label: "Archive from Catalogue",       action: "Delete",  groupKey: "products", description: "Remove products from inventory" },
  "categories.view":       { label: "View Collections",             action: "View",    groupKey: "categories", description: "Access product categories" },
  "categories.create":     { label: "Create Collections",           action: "Create",  groupKey: "categories", description: "Add new product categories" },
  "categories.edit":       { label: "Manage Collections",           action: "Edit",    groupKey: "categories", description: "Edit category information" },
  "categories.delete":     { label: "Archive Collections",          action: "Delete",  groupKey: "categories", description: "Remove product categories" },
  "orders.view":           { label: "View Orders",                  action: "View",    groupKey: "orders", description: "Access customer orders" },
  "orders.update":         { label: "Process Orders",               action: "Manage",  groupKey: "orders", description: "Update order status and details" },
  "payments.view":         { label: "View Transactions",            action: "View",    groupKey: "payments", description: "Review payment records" },
  "payments.verify":       { label: "Authorize Payments",           action: "Approve", groupKey: "payments", description: "Approve and verify transactions" },
  "inventory.view":        { label: "View Stock Levels",            action: "View",    groupKey: "inventory", description: "Check inventory availability" },
  "inventory.stock_in":    { label: "Receive Shipments",            action: "Create",  groupKey: "inventory", description: "Record incoming inventory" },
  "inventory.stock_out":   { label: "Manage Stock Allocation",      action: "Edit",    groupKey: "inventory", description: "Adjust outgoing inventory" },
  "customers.view":        { label: "View Customer Profiles",       action: "View",    groupKey: "customers", description: "Access customer information" },
  "reports.view":          { label: "Access Business Analytics",    action: "View",    groupKey: "reports", description: "View performance reports" },
  "promotions.manage":     { label: "Manage Campaigns",             action: "Manage",  groupKey: "promotions", description: "Create and modify promotions" },
  "reviews.manage":        { label: "Moderate Feedback",            action: "Manage",  groupKey: "reviews", description: "Review and manage customer feedback" },
  "users.manage":          { label: "Manage Team Access",           action: "Manage",  groupKey: "users", description: "Administer team member accounts" },
  "roles.manage":          { label: "Configure Access Control",     action: "Manage",  groupKey: "roles", description: "Create and modify access roles" },
  "videos.manage":         { label: "Manage Video Library",         action: "Manage",  groupKey: "reviews", description: "Upload, preview, and remove media videos" },
  "settings.manage":       { label: "Manage Platform Settings",     action: "Manage",  groupKey: "settings", description: "Configure system preferences" },
  "email_templates.manage":{ label: "Manage Communications",        action: "Manage",  groupKey: "email-templates", description: "Edit email templates and messaging" },
};

/* ─────────────────────────────────────────────
   MODULE GROUP DISPLAY CONFIG
   Maps groupKey to business-friendly label, 
   description, elegant icon, and color palette
───────────────────────────────────────────── */
interface ModuleGroupConfig {
  label: string;
  description: string;
  icon: string;
  accentClass: string;
  iconBgClass: string;
}

const MODULE_GROUPS: Record<string, ModuleGroupConfig> = {
  dashboard:        { label: "Dashboard & Analytics",     description: "Central command center for operations",            icon: "⊙",  accentClass: "text-[#9d7d6a]",         iconBgClass: "bg-[#f7f1ed]" },
  products:         { label: "Product Management",        description: "Catalogue, inventory & listings",                 icon: "◆",  accentClass: "text-[#9d6e9d]",         iconBgClass: "bg-[#f9f4f9]" },
  categories:       { label: "Category & Collections",    description: "Organization & product grouping",                 icon: "⊡",  accentClass: "text-[#6b7fa8]",         iconBgClass: "bg-[#f0f4f9]" },
  orders:           { label: "Order Management",          description: "Fulfillment, processing & tracking",              icon: "⊞",  accentClass: "text-[#6b9d7a]",         iconBgClass: "bg-[#f1f8f4]" },
  payments:         { label: "Payment & Transactions",    description: "Revenue, refunds & financial oversight",           icon: "◈",  accentClass: "text-[#b08a6e]",         iconBgClass: "bg-[#f9f3ed]" },
  inventory:        { label: "Inventory & Warehouse",     description: "Stock management & allocation",                   icon: "⊕",  accentClass: "text-[#7a9d6b]",         iconBgClass: "bg-[#f3f8f0]" },
  customers:        { label: "Customer Relationships",    description: "Profiles, preferences & engagement",              icon: "◉",  accentClass: "text-[#c98a9e]",         iconBgClass: "bg-[#faf3f6]" },
  reports:          { label: "Reports & Insights",        description: "Business intelligence & data analysis",           icon: "◐",  accentClass: "text-[#6b8fa8]",         iconBgClass: "bg-[#f0f5f9]" },
  promotions:       { label: "Marketing & Promotions",    description: "Campaigns, offers & brand visibility",             icon: "★",  accentClass: "text-[#c49457]",         iconBgClass: "bg-[#f9f5f0]" },
  reviews:          { label: "Reviews & Feedback",        description: "Quality assurance & customer insights",            icon: "◑",  accentClass: "text-[#a88076]",         iconBgClass: "bg-[#f8f2ed]" },
  users:            { label: "Team Administration",       description: "User accounts, roles & access",                   icon: "◎",  accentClass: "text-[#717aa8]",         iconBgClass: "bg-[#f1f3f9]" },
  roles:            { label: "Access Control",            description: "Permissions, roles & security policies",          icon: "⚙",  accentClass: "text-[#b07a92]",         iconBgClass: "bg-[#faf2f6]" },
  settings:         { label: "System Configuration",      description: "Platform settings & preferences",                 icon: "◇",  accentClass: "text-[#7a7a8a]",         iconBgClass: "bg-[#f4f4f6]" },
  "email-templates":{ label: "Customer Communications",   description: "Email templates & messaging templates",           icon: "✉",  accentClass: "text-[#6b94a8]",         iconBgClass: "bg-[#f0f6f9]" },
};

/* ─────────────────────────────────────────────
   ROLE KEY → Executive-Friendly Label Map
───────────────────────────────────────────── */
const ROLE_KEY_LABELS: Record<RoleKey, string> = {
  "super-admin":       "Chief Administrator",
  "admin":             "General Administrator",
  "order-staff":       "Order & Fulfillment Specialist",
  "inventory-staff":   "Warehouse & Inventory Manager",
  "marketing-staff":   "Marketing & Brand Manager",
};

/* ─────────────────────────────────────────────
   GROUPED PERMISSIONS BUILDER
   Groups permissions by their module groupKey
───────────────────────────────────────────── */
interface PermissionGroup {
  groupKey: string;
  permissions: Permission[];
}

function buildPermissionGroups(permissions: Permission[]): PermissionGroup[] {
  const map = new Map<string, Permission[]>();
  for (const perm of permissions) {
    const display = PERMISSION_DISPLAY[perm];
    if (!display) continue;
    const group = map.get(display.groupKey) ?? [];
    group.push(perm);
    map.set(display.groupKey, group);
  }
  // Ordered list of groups
  const order = [
    "dashboard", "products", "categories", "orders", "payments",
    "inventory", "customers", "reports", "promotions", "reviews",
    "users", "roles", "settings", "email-templates",
  ];
  const result: PermissionGroup[] = [];
  for (const key of order) {
    const perms = map.get(key);
    if (perms?.length) result.push({ groupKey: key, permissions: perms });
  }
  return result;
}

/* ─────────────────────────────────────────────
   ACTION COLOR MAP
   Visual accent per action type
───────────────────────────────────────────── */
const ACTION_COLORS: Record<string, string> = {
  View:    "bg-[#eef4fb] text-[#4a6fa5] ring-[#c5d8ef]",
  Create:  "bg-[#ecf7f0] text-[#3d8a5f] ring-[#b7dfc8]",
  Edit:    "bg-[#fdf5e8] text-[#9c6b22] ring-[#e8d4a8]",
  Delete:  "bg-[#fdf0f0] text-[#b04040] ring-[#e8c5c5]",
  Approve: "bg-[#f5edfb] text-[#7b3fa8] ring-[#d5b8f0]",
  Manage:  "bg-[#f0f0f2] text-[#3d3d50] ring-[#c8c8d8]",
};

/* ─────────────────────────────────────────────
   ELEGANT PERMISSION TOGGLE
   Premium toggle switch with luxury styling
───────────────────────────────────────────── */
function PermissionToggle({
  permission,
  checked,
  onChange,
  disabled,
}: {
  permission: Permission;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const display = PERMISSION_DISPLAY[permission];
  if (!display) return null;
  const actionColor = ACTION_COLORS[display.action] ?? ACTION_COLORS.Manage;

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left transition-all duration-200",
        checked
          ? "bg-gradient-to-br from-[#faf6f2] to-[#f5f0ed] shadow-[0_4px_16px_rgba(23,18,18,0.06)]"
          : "bg-white hover:bg-[#fdfaf8] shadow-[0_1px_4px_rgba(0,0,0,0.02)]",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {/* Elegant toggle switch */}
      <span
        className={cn(
          "relative flex h-6 w-10 shrink-0 rounded-full transition-all duration-300",
          checked
            ? "bg-[#9d7d6a] shadow-inset"
            : "bg-[#e8dfd8] border border-black/5"
        )}
      >
        <span
          className={cn(
            "absolute h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(23,18,18,0.15)] transition-all duration-300",
            checked ? "translate-x-[1.1rem] top-0.5" : "translate-x-0.5 top-0.5"
          )}
        />
      </span>

      {/* Label container */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold leading-tight", checked ? "text-[#3d3d50]" : "text-[#5a4d4d]")}>
          {display.label}
        </p>
        {display.description && (
          <p className="mt-0.5 text-xs text-black/35 truncate">
            {display.description}
          </p>
        )}
      </div>

      {/* Action badge */}
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] ring-1",
          actionColor
        )}
      >
        {display.action}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   PERMISSION GROUP CARD
   Luxury module grouping with elegant styling
───────────────────────────────────────────── */
function PermissionGroupCard({
  groupKey,
  permissions,
  selectedPermissions,
  onToggle,
  disabled,
}: {
  groupKey: string;
  permissions: Permission[];
  selectedPermissions: Permission[];
  onToggle: (permission: Permission, checked: boolean) => void;
  disabled?: boolean;
}) {
  const config = MODULE_GROUPS[groupKey];
  const enabledCount = permissions.filter((p) => selectedPermissions.includes(p)).length;
  const allSelected = enabledCount === permissions.length;
  const someSelected = enabledCount > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      permissions.forEach((p) => onToggle(p, false));
    } else {
      permissions.forEach((p) => onToggle(p, true));
    }
  };

  return (
    <div className="group overflow-hidden rounded-[20px] border border-black/[0.08] bg-gradient-to-br from-white to-[#fdfaf8] shadow-[0_2px_8px_rgba(23,18,18,0.03)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(23,18,18,0.06)]">
      {/* Group header with icon and title */}
      <div className="flex items-start gap-4 border-b border-black/[0.05] px-5 py-4 bg-gradient-to-r from-white to-[#faf6f2]">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-xl transition-all duration-300", config?.iconBgClass ?? "bg-[#f5f5f5]")}>
          <span className={config?.accentClass ?? "text-black/40"}>{config?.icon ?? "◎"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold leading-tight", config?.accentClass ?? "text-black/70")}>
            {config?.label ?? groupKey}
          </p>
          <p className="mt-1 text-xs text-black/40">{config?.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-semibold", enabledCount > 0 ? config?.accentClass ?? "text-black/70" : "text-black/30")}>
              {enabledCount}
            </span>
            <span className="text-xs text-black/30">/</span>
            <span className="text-xs text-black/30">{permissions.length}</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 border-b border-black/[0.05] px-5 py-2.5 bg-[#fdfaf8] transition-colors duration-300">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-[10px] px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-150",
            allSelected
              ? "bg-[#9d7d6a]/10 text-[#9d7d6a]"
              : someSelected
                ? "bg-amber-50 text-amber-700"
                : "bg-black/5 text-black/50 hover:bg-black/8",
            disabled && "cursor-not-allowed opacity-40"
          )}
        >
          {allSelected ? "Clear All" : "Select All"}
        </button>
        <span className="text-xs text-black/30 px-1">
          {enabledCount > 0 ? `${enabledCount} selected` : "None selected"}
        </span>
      </div>

      {/* Permissions list */}
      <div className="grid gap-1 p-3">
        {permissions.map((perm) => (
          <PermissionToggle
            key={perm}
            permission={perm}
            checked={selectedPermissions.includes(perm)}
            onChange={(checked) => onToggle(perm, checked)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROLE CARD (Right Panel)
   Display role details with elegant permission grouping
───────────────────────────────────────────── */
function RoleCard({
  role,
  onEdit,
  canEdit,
  onView,
}: {
  role: Role;
  onEdit: () => void;
  canEdit: boolean;
  onView: () => void;
}) {
  return (
    <div
      onClick={onView}
      className="cursor-pointer overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_4px_16px_rgba(23,18,18,0.06)] ring-1 ring-black/[0.05] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(23,18,18,0.08)] hover:-translate-y-0.5 group"
    >
      {/* Card header with role title */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">Access Role</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-[#3d3d50]">{role.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-black/50 line-clamp-2">{role.description}</p>
        </div>
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="shrink-0 inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] bg-[#9d7d6a] text-white transition-all duration-200 hover:bg-[#8a6d5c] shadow-[0_2px_8px_rgba(157,125,106,0.25)]"
          >
            Edit
          </button>
        )}
      </div>
      
      {/* Stats footer */}
      <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-black/40">
        <p className="font-semibold text-[#9d7d6a]">
          {role.permissions.length} {role.permissions.length === 1 ? 'privilege' : 'privileges'}
        </p>
        <span className="text-black/35 group-hover:translate-x-1 transition-transform duration-200">
          Click to view privileges →
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM STATE
───────────────────────────────────────────── */
interface RoleFormState {
  id?: string;
  key: RoleKey;
  name: string;
  description: string;
  permissions: Permission[];
}

const initialFormState: RoleFormState = {
  key: "admin",
  name: "",
  description: "",
  permissions: [],
};

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function AdminRolesPage() {
  const { roles, permissions, addRole, updateRole, addActivityLog, users, addUser } = useCommerceStore();
  const { currentUser, hasPermission } = useAdminSession();
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedRoleForView, setSelectedRoleForView] = useState<Role | null>(null);
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin" as RoleKey
  });

  // Build the unique permission list from the store (typed)
  const allPermissions = useMemo(
    () => permissions.map((p) => p.key as Permission),
    [permissions]
  );

  // Build grouped permission list for the form
  const formPermissionGroups = useMemo(
    () => buildPermissionGroups(allPermissions),
    [allPermissions]
  );

  if (!currentUser) return null;

  const canManageRoles = hasPermission("roles.manage") && currentUser.canManageRoles;

  const handlePermissionToggle = (permission: Permission, checked: boolean) => {
    setFormState((current) => ({
      ...current,
      permissions: checked
        ? [...current.permissions, permission]
        : current.permissions.filter((p) => p !== permission),
    }));
  };

  const saveRole = async () => {
    if (!formState.name.trim()) {
      setFeedback({ type: "error", message: "Please provide a role name before saving." });
      return;
    }
    if (!formState.description.trim()) {
      setFeedback({ type: "error", message: "Please add a brief description for this role." });
      return;
    }
    if (!formState.permissions.length) {
      setFeedback({ type: "error", message: "Please assign at least one access privilege to this role." });
      return;
    }

    // Additional User Account validations if checkbox checked
    if (!formState.id && createUserAccount) {
      if (!userData.fullName.trim() || !userData.username.trim() || !userData.email.trim() || !userData.password) {
        setFeedback({ type: "error", message: "Please complete all user account fields." });
        return;
      }
      if (userData.password !== userData.confirmPassword) {
        setFeedback({ type: "error", message: "Password and confirm password must match." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
        setFeedback({ type: "error", message: "Please enter a valid email address." });
        return;
      }

      // Check duplicates
      const dup = users.find(
        (u) =>
          u.email.toLowerCase() === userData.email.trim().toLowerCase() ||
          u.username.toLowerCase() === userData.username.trim().toLowerCase()
      );
      if (dup) {
        setFeedback({ type: "error", message: "Username or email is already in use by another account." });
        return;
      }
    }

    const now = new Date().toISOString();

    if (formState.id) {
      await updateRole(formState.id, {
        name: formState.name,
        description: formState.description,
        permissions: formState.permissions,
        updatedAt: now,
      });
      await addActivityLog({
        user: currentUser.fullName,
        action: "Role updated",
        target: formState.name,
      });
      setFeedback({ type: "success", message: `"${formState.name}" has been updated successfully.` });
    } else {
      const role: Role = {
        id: `role-${Date.now()}`,
        key: formState.key,
        name: formState.name,
        description: formState.description,
        permissions: formState.permissions,
        createdAt: now,
        updatedAt: now,
      };
      await addRole(role);
      await addActivityLog({
        user: currentUser.fullName,
        action: "Role created",
        target: role.name,
      });

      // User account creation if toggled
      if (createUserAccount) {
        const hashed = await hashPassword(userData.password);
        const nextUserId = `usr-${Date.now()}-${userData.email.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}`;
        
        // helper to get initials for avatar
        const buildAvatar = (name: string) => {
          return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
        };

        const nextUser: AdminUser = {
          id: nextUserId,
          fullName: userData.fullName.trim(),
          username: userData.username.trim(),
          email: userData.email.trim().toLowerCase(),
          phone: "",
          role: userData.role,
          password: hashed,
          status: "Active",
          canManageUsers: userData.role === "admin",
          canManageRoles: userData.role === "admin" && currentUser?.canManageRoles === true,
          canDeleteUsers: false,
          isSuperAdmin: userData.role === "super-admin",
          avatar: buildAvatar(userData.fullName),
          createdAt: now,
          updatedAt: now
        };
        await addUser(nextUser);
        await addActivityLog({
          user: currentUser.fullName,
          action: "Admin account created during role creation",
          target: nextUser.fullName
        });
      }

      setFeedback({ type: "success", message: `"${role.name}" has been created successfully.` });
    }

    setFormState(initialFormState);
    setCreateUserAccount(false);
    setUserData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin"
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const editableRoleKeys: RoleKey[] = [
    "super-admin",
    "admin",
    "order-staff",
    "inventory-staff",
    "marketing-staff",
  ];

  return (
    <AdminPage
      eyebrow="Operations"
      title="Access Control & Roles"
      description="Define precise role-based access privileges for your team. Create custom roles with curated access to each operational area, ensuring clear security boundaries and operational efficiency."
    >
      <PermissionGuard
        permission="roles.manage"
        fallback={
          <div className="flex items-center gap-4 rounded-[22px] border border-black/[0.08] bg-gradient-to-r from-[#faf6f2] to-white p-6 shadow-[0_2px_8px_rgba(23,18,18,0.04)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9f4f9] text-xl text-[#9d6e9d]">
              ⚙
            </div>
            <div>
              <p className="font-semibold text-[#3d3d50]">Access Restricted</p>
              <p className="mt-1 text-sm text-black/50">
                Only authorized administrators may configure access roles and privileges.
              </p>
            </div>
          </div>
        }
      >
        <div className="grid gap-8 xl:grid-cols-[1fr_1.35fr]">
          {/* ── Left Panel: Role Builder ── */}
          <div className="space-y-0">
            {/* Form card */}
            <div className="rounded-[24px] bg-white shadow-[0_4px_16px_rgba(23,18,18,0.06)] ring-1 ring-black/[0.05] overflow-hidden">
              {/* Header */}
              <div className="border-b border-black/[0.05] px-6 py-5 bg-gradient-to-r from-[#fdfaf8] to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                      {formState.id ? "Editing" : "Create New"}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#3d3d50]">
                      {formState.id ? "Access Role" : "Create Role"}
                    </h2>
                  </div>
                  {formState.id && (
                    <button
                      type="button"
                      onClick={() => { setFormState(initialFormState); setFeedback(null); }}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] bg-black/5 text-black/50 hover:bg-black/10 transition-all duration-150"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-5 px-6 py-5">
                {/* Role type selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2.5">
                    Role Category
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {editableRoleKeys.map((roleKey) => (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() =>
                          setFormState((current) => ({ ...current, key: roleKey }))
                        }
                        className={cn(
                          "rounded-[14px] border-2 px-3.5 py-2.5 text-left text-xs font-semibold transition-all duration-150",
                          formState.key === roleKey
                            ? "border-[#9d7d6a] bg-[#f7f1ed] text-[#6a5d54] shadow-[0_2px_8px_rgba(157,125,106,0.15)]"
                            : "border-black/8 bg-[#fdfaf8] text-black/55 hover:border-[#9d7d6a]/30 hover:bg-white"
                        )}
                      >
                        {ROLE_KEY_LABELS[roleKey]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                    Role Name
                  </label>
                  <input
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((current) => ({ ...current, name: e.target.value }))
                    }
                    placeholder="e.g. Senior Operations Manager"
                    className="w-full rounded-[14px] border border-black/10 bg-[#fdfaf8] px-4 py-2.5 text-sm text-[#3d3d50] placeholder:text-black/30 focus:border-[#9d7d6a]/40 focus:bg-white focus:shadow-[0_2px_8px_rgba(157,125,106,0.1)] focus:ring-0 transition-all duration-150"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                    Role Description
                  </label>
                  <textarea
                    value={formState.description}
                    onChange={(e) =>
                      setFormState((current) => ({ ...current, description: e.target.value }))
                    }
                    placeholder="Describe the responsibilities and scope of this role…"
                    rows={3}
                    className="w-full rounded-[14px] border border-black/10 bg-[#fdfaf8] px-4 py-2.5 text-sm text-[#3d3d50] placeholder:text-black/30 focus:border-[#9d7d6a]/40 focus:bg-white focus:shadow-[0_2px_8px_rgba(157,125,106,0.1)] focus:ring-0 transition-all duration-150 resize-none"
                  />
                </div>

                {!formState.id && (
                  <div className="pt-2 border-t border-black/[0.05]">
                    <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createUserAccount}
                        onChange={(e) => setCreateUserAccount(e.target.checked)}
                        className="rounded border-black/10 text-[#9d7d6a] focus:ring-[#9d7d6a]"
                      />
                      Create a user account immediately
                    </label>

                    {createUserAccount && (
                      <div className="mt-4 p-4 rounded-[18px] bg-gradient-to-br from-[#faf6f2] to-[#fdfaf8] border border-black/[0.05] space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
                          New User Details
                        </p>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                              Full Name
                            </label>
                            <input
                              value={userData.fullName}
                              onChange={(e) => setUserData(c => ({ ...c, fullName: e.target.value }))}
                              placeholder="e.g. Imasha"
                              className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#3d3d50]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                              Username
                            </label>
                            <input
                              value={userData.username}
                              onChange={(e) => setUserData(c => ({ ...c, username: e.target.value }))}
                              placeholder="e.g. imasha"
                              className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#3d3d50]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={userData.email}
                              onChange={(e) => setUserData(c => ({ ...c, email: e.target.value }))}
                              placeholder="e.g. imasha@berryclothing.lk"
                              className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#3d3d50]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                              Password
                            </label>
                            <input
                              type="password"
                              value={userData.password}
                              onChange={(e) => setUserData(c => ({ ...c, password: e.target.value }))}
                              className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#3d3d50]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={userData.confirmPassword}
                              onChange={(e) => setUserData(c => ({ ...c, confirmPassword: e.target.value }))}
                              className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#3d3d50]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-2">
                              Role
                            </label>
                            <select
                              value={userData.role}
                              onChange={(e) => setUserData(c => ({ ...c, role: e.target.value as RoleKey }))}
                              className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#3d3d50]"
                            >
                              {editableRoleKeys.map((key) => (
                                <option key={key} value={key}>
                                  {ROLE_KEY_LABELS[key]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-3 px-6 py-3 bg-[#fdfaf8]">
                <div className="h-px flex-1 bg-black/[0.08]" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                  Access Privileges
                </p>
                <div className="h-px flex-1 bg-black/[0.08]" />
              </div>

              {/* Privileges counter */}
              <div className="mx-6 mt-4 flex items-center justify-between rounded-[14px] bg-gradient-to-r from-[#f7f1ed] to-[#fdfaf8] px-4 py-3 ring-1 ring-black/[0.05]">
                <p className="text-xs font-semibold text-black/50">
                  Privileges assigned
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9d7d6a] text-white px-3 py-0.5 text-xs font-bold">
                  <span className="text-sm">•</span>
                  {formState.permissions.length} of {allPermissions.length}
                </span>
              </div>

              {/* Permission groups */}
              <div className="space-y-2.5 px-6 py-5 pb-6">
                {formPermissionGroups.map(({ groupKey, permissions: groupPerms }) => (
                  <PermissionGroupCard
                    key={groupKey}
                    groupKey={groupKey}
                    permissions={groupPerms}
                    selectedPermissions={formState.permissions}
                    onToggle={handlePermissionToggle}
                    disabled={!canManageRoles}
                  />
                ))}
              </div>

              {/* Feedback messages */}
              {feedback && (
                <div
                  className={cn(
                    "mx-6 mb-4 flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-medium transition-all duration-300",
                    feedback.type === "success"
                      ? "bg-[#ebf7f2] text-[#2d7a57]"
                      : "bg-[#fdf0f0] text-[#b04040]"
                  )}
                >
                  <span className="text-sm">{feedback.type === "success" ? "✓" : "⚠"}</span>
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 border-t border-black/[0.05] px-6 py-4 bg-[#fdfaf8]">
                <button
                  onClick={() => void saveRole()}
                  disabled={!canManageRoles}
                  className={cn(
                    "flex-1 rounded-[12px] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] transition-all duration-200",
                    canManageRoles
                      ? "bg-[#9d7d6a] text-white shadow-[0_2px_8px_rgba(157,125,106,0.25)] hover:bg-[#8a6d5c] hover:shadow-[0_4px_12px_rgba(157,125,106,0.35)]"
                      : "bg-black/5 text-black/50 cursor-not-allowed"
                  )}
                >
                  {formState.id ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Panel: Existing Roles ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                Configured Roles
              </p>
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#f7f1ed] text-[#9d7d6a] text-xs font-bold">
                {roles.length}
              </span>
            </div>
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                canEdit={canManageRoles}
                onEdit={() =>
                  setFormState({
                    id: role.id,
                    key: role.key,
                    name: role.name,
                    description: role.description,
                    permissions: role.permissions,
                  })
                }
                onView={() => setSelectedRoleForView(role)}
              />
            ))}
          </div>
        </div>
      </PermissionGuard>

      {/* Modal / Detailed Panel for Role Permissions */}
      {selectedRoleForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-[28px] bg-white shadow-elevated ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="border-b border-black/[0.05] px-6 py-5 bg-gradient-to-r from-[#fdfaf8] to-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">Role Permissions</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-[#3d3d50]">{selectedRoleForView.name}</h3>
                <p className="mt-2 text-sm text-black/50">{selectedRoleForView.description}</p>
              </div>
              <button
                onClick={() => setSelectedRoleForView(null)}
                className="rounded-full p-2 text-black/40 hover:bg-black/5 hover:text-black/65 transition-colors font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {buildPermissionGroups(selectedRoleForView.permissions).length === 0 ? (
                <p className="text-sm text-black/45 py-4 text-center">No permissions assigned to this role.</p>
              ) : (
                buildPermissionGroups(selectedRoleForView.permissions).map(({ groupKey, permissions }) => {
                  const config = MODULE_GROUPS[groupKey];
                  return (
                    <div key={groupKey} className="border-l-2 pl-4 py-1" style={{ borderColor: config?.accentClass?.split('[#')[1]?.slice(0, -1) ? `#${config?.accentClass?.split('[#')[1]?.slice(0, -1)}` : '#9d7d6a' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-[8px] text-sm", config?.iconBgClass ?? "bg-[#f5f5f5]")}>
                          <span className={config?.accentClass ?? "text-black/40"}>{config?.icon}</span>
                        </span>
                        <p className="text-sm font-semibold text-[#3d3d50]">
                          {config?.label ?? groupKey}
                        </p>
                        <span className="ml-auto text-xs text-black/30">
                          {permissions.length} {permissions.length === 1 ? 'privilege' : 'privileges'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {permissions.map((perm) => {
                          const display = PERMISSION_DISPLAY[perm];
                          if (!display) return null;
                          const color = ACTION_COLORS[display.action] ?? ACTION_COLORS.Manage;
                          return (
                            <span
                              key={perm}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                                color
                              )}
                              title={display.description || display.label}
                            >
                              <span className="h-1 w-1 rounded-full bg-current opacity-70" />
                              <span>{display.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-black/[0.05] px-6 py-4 bg-[#fdfaf8] flex justify-end">
              <button
                onClick={() => setSelectedRoleForView(null)}
                className="rounded-[12px] bg-[#9d7d6a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a6d5c] shadow-[0_2px_8px_rgba(157,125,106,0.25)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

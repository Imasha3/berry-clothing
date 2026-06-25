"use client";

import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/permission";
import type { Role, RoleKey } from "@/types/user";

/* ─────────────────────────────────────────────
   PERMISSION → DISPLAY MAP
   Maps technical permission keys to:
   - A human-readable label shown in the UI
   - The module group it belongs to
   - A short action verb for chip display
───────────────────────────────────────────── */
const PERMISSION_DISPLAY: Record<
  Permission,
  { label: string; action: string; groupKey: string }
> = {
  "dashboard.view":        { label: "View Dashboard",             action: "View",    groupKey: "dashboard" },
  "products.view":         { label: "Browse Products",            action: "View",    groupKey: "products" },
  "products.create":       { label: "Add New Products",           action: "Create",  groupKey: "products" },
  "products.edit":         { label: "Edit Product Details",       action: "Edit",    groupKey: "products" },
  "products.delete":       { label: "Remove Products",            action: "Delete",  groupKey: "products" },
  "categories.view":       { label: "Browse Categories",          action: "View",    groupKey: "categories" },
  "categories.create":     { label: "Create Categories",          action: "Create",  groupKey: "categories" },
  "categories.edit":       { label: "Edit Categories",            action: "Edit",    groupKey: "categories" },
  "categories.delete":     { label: "Remove Categories",          action: "Delete",  groupKey: "categories" },
  "orders.view":           { label: "View Orders",                action: "View",    groupKey: "orders" },
  "orders.update":         { label: "Process & Update Orders",    action: "Manage",  groupKey: "orders" },
  "payments.view":         { label: "View Payments",              action: "View",    groupKey: "payments" },
  "payments.verify":       { label: "Approve Payments",           action: "Approve", groupKey: "payments" },
  "inventory.view":        { label: "View Stock Levels",          action: "View",    groupKey: "inventory" },
  "inventory.stock_in":    { label: "Receive & Add Stock",        action: "Create",  groupKey: "inventory" },
  "inventory.stock_out":   { label: "Dispatch & Adjust Stock",    action: "Edit",    groupKey: "inventory" },
  "customers.view":        { label: "View Customer Profiles",     action: "View",    groupKey: "customers" },
  "reports.view":          { label: "Access Business Reports",    action: "View",    groupKey: "reports" },
  "promotions.manage":     { label: "Manage Campaigns & Offers",  action: "Manage",  groupKey: "promotions" },
  "reviews.manage":        { label: "Moderate Customer Reviews",  action: "Manage",  groupKey: "reviews" },
  "users.manage":          { label: "Manage Team Members",        action: "Manage",  groupKey: "users" },
  "roles.manage":          { label: "Configure Access Roles",     action: "Manage",  groupKey: "roles" },
  "settings.manage":       { label: "Manage System Settings",     action: "Manage",  groupKey: "settings" },
  "email_templates.manage":{ label: "Manage Email Templates",     action: "Manage",  groupKey: "email-templates" },
};

/* ─────────────────────────────────────────────
   MODULE GROUP DISPLAY CONFIG
   Maps groupKey to label, icon, and description
───────────────────────────────────────────── */
interface ModuleGroupConfig {
  label: string;
  description: string;
  icon: string;
  accentClass: string;
  iconBgClass: string;
}

const MODULE_GROUPS: Record<string, ModuleGroupConfig> = {
  dashboard:        { label: "Overview & Dashboard",     description: "Access to the main control panel",     icon: "◈",  accentClass: "text-[#b0894e]",         iconBgClass: "bg-[#fdf3e3]" },
  products:         { label: "Product Management",       description: "Catalogue, listings & product details", icon: "◎",  accentClass: "text-[#8c5fa8]",         iconBgClass: "bg-[#f5eff9]" },
  categories:       { label: "Category Structure",       description: "Collection taxonomy & organisation",    icon: "⊞",  accentClass: "text-[#5b7fab]",         iconBgClass: "bg-[#edf3f9]" },
  orders:           { label: "Order Management",         description: "Fulfilment, dispatch & order flow",     icon: "◻",  accentClass: "text-[#5fa888]",         iconBgClass: "bg-[#ebf7f2]" },
  payments:         { label: "Payment Management",       description: "Transaction review & approval",          icon: "◇",  accentClass: "text-[#c0785a]",         iconBgClass: "bg-[#fdf0eb]" },
  inventory:        { label: "Inventory Control",        description: "Stock levels, receipts & adjustments",  icon: "▣",  accentClass: "text-[#7a8c5a]",         iconBgClass: "bg-[#f1f5ea]" },
  customers:        { label: "Customer Management",      description: "Client profiles & account overview",    icon: "◑",  accentClass: "text-[#d4728f]",         iconBgClass: "bg-[#fdf0f4]" },
  reports:          { label: "Reports & Analytics",      description: "Business intelligence & insights",      icon: "◐",  accentClass: "text-[#5a7ab0]",         iconBgClass: "bg-[#edf3fc]" },
  promotions:       { label: "Promotions & Marketing",   description: "Campaigns, discounts & brand offers",   icon: "◈",  accentClass: "text-[#c47a3c]",         iconBgClass: "bg-[#fdf4e8]" },
  reviews:          { label: "Customer Feedback",        description: "Reviews, ratings & moderation",         icon: "◉",  accentClass: "text-[#a87a5b]",         iconBgClass: "bg-[#f8f0ea]" },
  users:            { label: "User Administration",      description: "Team members, roles & staff accounts",  icon: "◑",  accentClass: "text-[#6a7ab0]",         iconBgClass: "bg-[#edf0fb]" },
  roles:            { label: "Access Control",           description: "Roles, permissions & security",         icon: "⊕",  accentClass: "text-[#b85c7a]",         iconBgClass: "bg-[#fcedf3]" },
  settings:         { label: "System Settings",          description: "Platform configuration & preferences",  icon: "◎",  accentClass: "text-[#6e6e6e]",         iconBgClass: "bg-[#f2f2f2]" },
  "email-templates":{ label: "Email Communications",     description: "Branded email templates & messaging",   icon: "◻",  accentClass: "text-[#5a8ea8]",         iconBgClass: "bg-[#eaf4f8]" },
};

/* ─────────────────────────────────────────────
   ROLE KEY → Friendly label map
───────────────────────────────────────────── */
const ROLE_KEY_LABELS: Record<RoleKey, string> = {
  "super-admin":       "Executive Administrator",
  "admin":             "Operations Administrator",
  "order-staff":       "Order & Fulfilment Staff",
  "inventory-staff":   "Inventory & Warehouse Staff",
  "marketing-staff":   "Marketing & Promotions Staff",
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
   ELEGANT TOGGLE CHECKBOX
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
        "group flex w-full items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left transition-all duration-200",
        checked
          ? "bg-[#171212] text-white shadow-sm"
          : "bg-white/60 text-[#5a4d4d] hover:bg-white hover:shadow-sm",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {/* Custom checkbox indicator */}
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          checked
            ? "border-transparent bg-[#f34078] shadow-[0_0_0_3px_rgba(243,64,120,0.15)]"
            : "border-black/20 bg-white group-hover:border-[#f34078]/40"
        )}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* Label */}
      <span className={cn("flex-1 text-sm font-medium leading-tight", checked ? "text-white" : "")}>
        {display.label}
      </span>

      {/* Action chip */}
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ring-1",
          checked ? "bg-white/15 text-white ring-white/25" : actionColor
        )}
      >
        {display.action}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   PERMISSION GROUP CARD
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
    <div className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-[#fdfaf8] shadow-[0_2px_12px_rgba(23,18,18,0.04)]">
      {/* Group header */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-[12px] text-lg", config?.iconBgClass ?? "bg-[#f5f5f5]")}>
          <span className={config?.accentClass ?? "text-black/40"}>{config?.icon ?? "◎"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold leading-tight", config?.accentClass ?? "text-black/70")}>
            {config?.label ?? groupKey}
          </p>
          <p className="mt-0.5 truncate text-xs text-black/45">{config?.description}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-black/40">
            {enabledCount}/{permissions.length}
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150",
              allSelected
                ? "bg-[#f34078]/10 text-[#f34078] hover:bg-[#f34078]/20"
                : someSelected
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-black/5 text-black/50 hover:bg-black/10",
              disabled && "cursor-not-allowed opacity-40"
            )}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      {/* Permissions list */}
      <div className="grid gap-1.5 p-3">
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
   ROLE CARD (right panel — display only)
───────────────────────────────────────────── */
function RoleCard({
  role,
  onEdit,
  canEdit,
}: {
  role: Role;
  onEdit: () => void;
  canEdit: boolean;
}) {
  const groups = buildPermissionGroups(role.permissions);

  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.06]">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 border-b border-black/[0.05] px-6 py-5">
        <div>
          <p className="font-display text-lg text-ink">{role.name}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-black/55">{role.description}</p>
        </div>
        {canEdit && (
          <Button variant="secondary" onClick={onEdit} className="shrink-0 !rounded-full !py-2 !text-xs">
            Edit Role
          </Button>
        )}
      </div>

      {/* Permission groups as elegant chips */}
      <div className="space-y-5 px-6 py-5">
        {groups.map(({ groupKey, permissions }) => {
          const config = MODULE_GROUPS[groupKey];
          return (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-[8px] text-[11px]", config?.iconBgClass ?? "bg-[#f5f5f5]")}>
                  <span className={config?.accentClass ?? "text-black/40"}>{config?.icon}</span>
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                  {config?.label ?? groupKey}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((perm) => {
                  const display = PERMISSION_DISPLAY[perm];
                  if (!display) return null;
                  const color = ACTION_COLORS[display.action] ?? ACTION_COLORS.Manage;
                  return (
                    <span
                      key={perm}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1",
                        color
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                      {display.label}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-[11px] uppercase tracking-[0.2em] text-black/30">
          {role.permissions.length} access privileges assigned
        </p>
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
  const { roles, permissions, addRole, updateRole, addActivityLog } = useCommerceStore();
  const { currentUser, hasPermission } = useAdminSession();
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
      setFeedback({ type: "success", message: `"${role.name}" has been created successfully.` });
    }

    setFormState(initialFormState);
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
      eyebrow="Access Control"
      title="Roles & Permissions"
      description="Define role-based access to each area of your platform. Assign curated privileges to each team role to maintain clear operational boundaries."
    >
      <PermissionGuard
        permission="roles.manage"
        fallback={
          <div className="flex items-center gap-4 rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fcedf3] text-lg text-[#b85c7a]">
              ⊕
            </div>
            <div>
              <p className="font-semibold text-ink">Access Restricted</p>
              <p className="mt-1 text-sm text-black/55">
                Only authorised administrators may configure roles and access privileges.
              </p>
            </div>
          </div>
        }
      >
        <div className="grid gap-8 xl:grid-cols-[1fr_1.35fr]">
          {/* ── Left Panel: Role Builder ── */}
          <div className="space-y-0">
            {/* Form card */}
            <div className="rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.06]">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 border-b border-black/[0.05] px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9225d]">
                    {formState.id ? "Editing Role" : "New Role"}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-ink">
                    {formState.id ? "Modify Access Role" : "Create Access Role"}
                  </h2>
                </div>
                {formState.id && (
                  <Button
                    variant="secondary"
                    onClick={() => { setFormState(initialFormState); setFeedback(null); }}
                    className="!rounded-full !py-2 !text-xs"
                  >
                    Discard
                  </Button>
                )}
              </div>

              {/* Basic fields */}
              <div className="space-y-5 px-6 py-5">
                {/* Role type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                    Role Type
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {editableRoleKeys.map((roleKey) => (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() =>
                          setFormState((current) => ({ ...current, key: roleKey }))
                        }
                        className={cn(
                          "rounded-[14px] border px-4 py-2.5 text-left text-sm font-medium transition-all duration-150",
                          formState.key === roleKey
                            ? "border-[#f34078]/40 bg-[#fff4f7] text-[#b61649] shadow-sm"
                            : "border-black/8 bg-[#fdfaf8] text-black/55 hover:border-black/15 hover:bg-white"
                        )}
                      >
                        {ROLE_KEY_LABELS[roleKey]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                    Role Name
                  </label>
                  <input
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((current) => ({ ...current, name: e.target.value }))
                    }
                    placeholder="e.g. Senior Operations Manager"
                    className="mt-2 w-full rounded-[16px] border border-black/10 bg-[#fdfaf8] px-4 py-3 text-sm text-ink placeholder:text-black/30 focus:border-[#f34078]/40 focus:bg-white focus:shadow-sm focus:ring-0 transition-all duration-150"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                    Role Description
                  </label>
                  <textarea
                    value={formState.description}
                    onChange={(e) =>
                      setFormState((current) => ({ ...current, description: e.target.value }))
                    }
                    placeholder="Describe the responsibilities of this role…"
                    rows={3}
                    className="mt-2 w-full rounded-[16px] border border-black/10 bg-[#fdfaf8] px-4 py-3 text-sm text-ink placeholder:text-black/30 focus:border-[#f34078]/40 focus:bg-white focus:shadow-sm focus:ring-0 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-3 px-6 pb-4">
                <div className="h-px flex-1 bg-black/[0.06]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                  Access Privileges
                </p>
                <div className="h-px flex-1 bg-black/[0.06]" />
              </div>

              {/* Summary badge */}
              <div className="mx-6 mb-4 flex items-center justify-between rounded-[14px] bg-[#fdfaf8] px-4 py-3">
                <p className="text-xs text-black/50">
                  Privileges selected
                </p>
                <span className="rounded-full bg-[#f34078] px-3 py-0.5 text-xs font-semibold text-white">
                  {formState.permissions.length} of {allPermissions.length}
                </span>
              </div>

              {/* Permission groups */}
              <div className="space-y-3 px-6 pb-6">
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

              {/* Feedback */}
              {feedback && (
                <div
                  className={cn(
                    "mx-6 mb-4 flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm",
                    feedback.type === "success"
                      ? "bg-[#ebf7f2] text-[#2d7a57]"
                      : "bg-[#fdf0f0] text-[#b04040]"
                  )}
                >
                  <span>{feedback.type === "success" ? "✓" : "!"}</span>
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 border-t border-black/[0.05] px-6 py-5">
                <Button
                  onClick={() => void saveRole()}
                  disabled={!canManageRoles}
                  className="flex-1"
                >
                  {formState.id ? "Save Changes" : "Create Role"}
                </Button>
                {!canManageRoles && (
                  <p className="flex items-center text-xs text-black/40">
                    Contact your administrator to enable editing.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Existing Roles ── */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">
                Configured Roles
              </p>
              <span className="rounded-full bg-[#f5eff9] px-2.5 py-0.5 text-xs font-semibold text-[#8c5fa8]">
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
              />
            ))}
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

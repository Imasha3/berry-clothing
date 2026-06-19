"use client";

import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/types/permission";
import type { Role, RoleKey } from "@/types/user";

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
  permissions: []
};

export default function AdminRolesPage() {
  const { roles, permissions, addRole, updateRole, addActivityLog } = useCommerceStore();
  const { currentUser, hasPermission } = useAdminSession();
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);
  const [feedback, setFeedback] = useState("");

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((accumulator, entry) => {
      const modulePermissions = accumulator[entry.module] ?? [];
      modulePermissions.push(entry.key as Permission);
      accumulator[entry.module] = modulePermissions;
      return accumulator;
    }, {});
  }, [permissions]);

  if (!currentUser) {
    return null;
  }

  const canManageRoles = hasPermission("roles.manage") && currentUser.canManageRoles;

  const saveRole = async () => {
    if (!formState.name || !formState.description || !formState.permissions.length) {
      setFeedback("Please provide role name, description, and at least one permission.");
      return;
    }

    const now = new Date().toISOString();

    if (formState.id) {
      await updateRole(formState.id, {
        name: formState.name,
        description: formState.description,
        permissions: formState.permissions,
        updatedAt: now
      });
      await addActivityLog({
        user: currentUser.fullName,
        action: "Role updated",
        target: formState.name
      });
      setFeedback("Role updated successfully.");
    } else {
      const role: Role = {
        id: `role-${Date.now()}`,
        key: formState.key,
        name: formState.name,
        description: formState.description,
        permissions: formState.permissions,
        createdAt: now,
        updatedAt: now
      };
      await addRole(role);
      await addActivityLog({
        user: currentUser.fullName,
        action: "Role created",
        target: role.name
      });
      setFeedback("Role created successfully.");
    }

    setFormState(initialFormState);
  };

  const editableRoleKeys: RoleKey[] = [
    "super-admin",
    "admin",
    "order-staff",
    "inventory-staff",
    "marketing-staff"
  ];

  return (
    <AdminPage
      eyebrow="Access Control"
      title="Roles & Permissions"
      description="Create and manage role access, assign frontend permissions, and control which modules or actions each team member can see."
    >
      <PermissionGuard
        permission="roles.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            Only authorized admin accounts can manage roles and permissions.
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
                  Role builder
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">
                  {formState.id ? "Edit role" : "Create role"}
                </h2>
              </div>
              {formState.id ? (
                <Button variant="secondary" onClick={() => setFormState(initialFormState)}>
                  Cancel
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="text-sm font-semibold text-ink">
                Role key
                <select
                  value={formState.key}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      key: event.target.value as RoleKey
                    }))
                  }
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                >
                  {editableRoleKeys.map((roleKey) => (
                    <option key={roleKey} value={roleKey}>
                      {roleKey}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-ink">
                Role name
                <input
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                />
              </label>
              <label className="text-sm font-semibold text-ink">
                Description
                <textarea
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                />
              </label>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-ink">Assign permissions</p>
              <div className="mt-4 space-y-4">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="rounded-[22px] border border-black/8 bg-[#fcf6f2] p-4">
                    <p className="text-sm font-semibold capitalize text-ink">{module}</p>
                    <div className="mt-3 grid gap-2">
                      {modulePermissions.map((permission) => (
                        <label key={permission} className="flex items-center gap-3 text-sm text-black/70">
                          <input
                            type="checkbox"
                            checked={formState.permissions.includes(permission)}
                            onChange={(event) =>
                              setFormState((current) => ({
                                ...current,
                                permissions: event.target.checked
                                  ? [...current.permissions, permission]
                                  : current.permissions.filter((entry) => entry !== permission)
                              }))
                            }
                          />
                          {permission}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {feedback ? (
              <div className="mt-4 rounded-[18px] bg-berry-50 px-4 py-3 text-sm text-berry-700">
                {feedback}
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <Button onClick={() => void saveRole()} disabled={!canManageRoles}>
                {formState.id ? "Save role" : "Create role"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{role.name}</p>
                    <p className="mt-2 text-sm leading-7 text-black/60">{role.description}</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setFormState({
                        id: role.id,
                        key: role.key,
                        name: role.name,
                        description: role.description,
                        permissions: role.permissions
                      })
                    }
                  >
                    Edit role
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <Badge key={permission}>{permission}</Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-black/45">
                  {role.permissions.length} permissions assigned
                </p>
              </div>
            ))}
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

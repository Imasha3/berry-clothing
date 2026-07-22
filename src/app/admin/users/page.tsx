"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { RoleKey } from "@/types/user";
import { useConfirm, useAlert, useToast } from "@/components/providers/dialog-provider";

interface UserFormState {
  fullName: string;
  email: string;
  username: string;
  phone: string;
  role: RoleKey;
  password: string;
  confirmPassword: string;
  status: "Active" | "Inactive";
}

const initialFormState: UserFormState = {
  fullName: "",
  email: "",
  username: "",
  phone: "",
  role: "order-staff",
  password: "",
  confirmPassword: "",
  status: "Active"
};

function buildAvatar(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AdminUsersPage() {
  const confirm = useConfirm();
  const alert = useAlert();
  const toast = useToast();
  const {
    users,
    roles,
    updateUser,
    updateUserStatus,
    deleteUser,
    addActivityLog,
    addNotification
  } = useCommerceStore();
  const { currentUser, hasPermission, createAdminAccount } = useAdminSession();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>(initialFormState);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");

  const editableRoles = useMemo(
    () =>
      roles.filter((role) =>
        currentUser?.isSuperAdmin
          ? role.key !== "super-admin"
          : role.key === "order-staff" || role.key === "inventory-staff" || role.key === "marketing-staff"
      ),
    [currentUser?.isSuperAdmin, roles]
  );

  if (!currentUser) {
    return null;
  }

  const canManageUsers = hasPermission("users.manage") && currentUser.canManageUsers;
  const canDeleteUsers = canManageUsers && currentUser.canDeleteUsers;

  const resetForm = () => {
    setEditingUserId(null);
    setFormState(initialFormState);
  };

  const setErrorFeedback = (message: string) => {
    setFeedback(message);
    setFeedbackTone("error");
  };

  const setSuccessFeedback = (message: string) => {
    setFeedback(message);
    setFeedbackTone("success");
  };

  const saveUser = async () => {
    if (editingUserId === currentUser.id && currentUser.role === "super-admin") {
      if (formState.status === "Inactive") {
        toast.error("You cannot deactivate or delete your own Super Admin account.");
        await alert({
          title: "Restriction Warning",
          message: "You cannot deactivate or delete your own Super Admin account.\n\nThis restriction protects the system from accidental lockout.",
          type: "warning"
        });
        return;
      }
      if (formState.role !== "super-admin") {
        toast.error("You cannot change your own Super Admin role to a lower privilege.");
        await alert({
          title: "Restriction Warning",
          message: "You cannot change your own Super Admin role to a lower privilege.\n\nThis restriction protects the system from accidental lockout.",
          type: "warning"
        });
        return;
      }
    }

    if (!formState.fullName || !formState.email || !formState.username || !formState.phone) {
      setErrorFeedback("Please complete all user fields before saving.");
      return;
    }

    if (!editingUserId && !formState.password) {
      setErrorFeedback("A password is required when creating a new admin account.");
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setErrorFeedback("Password and confirm password must match.");
      return;
    }

    if (!editableRoles.some((role) => role.key === formState.role)) {
      setErrorFeedback("Please select a valid account role.");
      return;
    }

    const normalizedEmail = formState.email.trim().toLowerCase();
    const normalizedUsername = formState.username.trim().toLowerCase();
    const duplicateUser = users.find(
      (user) =>
        user.id !== editingUserId &&
        (user.email.toLowerCase() === normalizedEmail || user.username.toLowerCase() === normalizedUsername)
    );

    if (duplicateUser) {
      setErrorFeedback("Username or email is already in use by another account.");
      return;
    }

    const now = new Date().toISOString();

    if (editingUserId) {
      const existingUser = users.find((user) => user.id === editingUserId);
      if (!existingUser) {
        return;
      }

      const nextRole = existingUser.isSuperAdmin ? existingUser.role : formState.role;

      await updateUser(editingUserId, {
        fullName: formState.fullName,
        email: normalizedEmail,
        username: formState.username.trim(),
        phone: formState.phone,
        role: nextRole,
        status: formState.status,
        password: formState.password || existingUser.password,
        canManageUsers: nextRole === "super-admin" || nextRole === "admin",
        canManageRoles:
          (nextRole === "super-admin" || nextRole === "admin") && currentUser.canManageRoles,
        canDeleteUsers: nextRole === "super-admin",
        isSuperAdmin: nextRole === "super-admin",
        avatar: buildAvatar(formState.fullName),
        updatedAt: now
      });
      await addActivityLog({
        user: currentUser.fullName,
        action: "User updated",
        target: formState.fullName
      });
      setSuccessFeedback("User updated successfully.");
    } else {
      const result = await createAdminAccount({
        fullName: formState.fullName,
        email: normalizedEmail,
        username: formState.username.trim(),
        phone: formState.phone,
        role: formState.role,
        password: formState.password,
        status: formState.status
      });
      if (!result.ok) {
        setErrorFeedback(result.message);
        return;
      }

      await addActivityLog({
        user: currentUser.fullName,
        action: "Admin account created",
        target: result.user.fullName
      });
      await addNotification({
        title: "New admin account added",
        message: `${result.user.fullName} was added as ${result.user.role}.`,
        type: "system",
        isRead: false
      });
      setSuccessFeedback("Admin/staff account created.");
    }

    resetForm();
  };

  return (
    <AdminPage
      eyebrow="Access Control"
      title="Users"
      description="Create and manage admin and staff accounts with role assignment, status controls, password updates, and protected delete actions."
    >
      <PermissionGuard
        permission="users.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            This signed-in account cannot manage admin users.
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
                  {editingUserId ? "Edit account" : "Add account"}
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">
                  {editingUserId ? "Update admin user" : "Create admin or staff"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/55">
                  Super Admin and permitted Admin accounts can create Admin, Order Staff, Inventory Staff, and Marketing Staff users.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {editingUserId ? (
                  <Button variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
                <Link href="/admin/users/add" className={canManageUsers ? buttonStyles("secondary") : buttonStyles("secondary", "pointer-events-none opacity-60")}>
                  Add User
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Full name", "fullName"],
                ["Email", "email"],
                ["Username", "username"],
                ["Phone number", "phone"]
              ].map(([label, key]) => (
                <label key={key} className="text-sm font-semibold text-ink">
                  {label}
                  <input
                    value={formState[key as keyof UserFormState] as string}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        [key]: event.target.value
                      }))
                    }
                    className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                  />
                </label>
              ))}
              <label className="text-sm font-semibold text-ink">
                Role
                <select
                  value={editingUserId && users.find((user) => user.id === editingUserId)?.isSuperAdmin ? "super-admin" : formState.role}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      role: event.target.value as RoleKey
                    }))
                  }
                  disabled={Boolean(editingUserId && users.find((user) => user.id === editingUserId)?.isSuperAdmin)}
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                >
                  {editingUserId && users.find((user) => user.id === editingUserId)?.isSuperAdmin ? (
                    <option value="super-admin">Super Admin</option>
                  ) : null}
                  {editableRoles.map((role) => (
                    <option key={role.id} value={role.key}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-ink">
                Account status
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value as UserFormState["status"]
                    }))
                  }
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink">
                Password
                <input
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      password: event.target.value
                    }))
                  }
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                />
                {editingUserId ? (
                  <p className="mt-2 text-xs font-normal text-black/45">
                    Leave blank to keep the current password.
                  </p>
                ) : null}
              </label>
              <label className="text-sm font-semibold text-ink">
                Confirm password
                <input
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      confirmPassword: event.target.value
                    }))
                  }
                  className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
                />
              </label>
            </div>
            {feedback ? (
              <div
                className={`mt-4 rounded-[18px] px-4 py-3 text-sm ${
                  feedbackTone === "success" ? "bg-berry-50 text-berry-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {feedback}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => void saveUser()} disabled={!canManageUsers}>
                {editingUserId ? "Save changes" : "Add account"}
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
                  User directory
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">Admin and staff accounts</h2>
              </div>
              <Badge>{users.length} accounts</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {users.map((user) => {
                const role = roles.find((entry) => entry.key === user.role);
                const hideDelete = !canDeleteUsers || user.isSuperAdmin || user.id === currentUser.id;

                return (
                  <div
                    key={user.id}
                    className="rounded-[24px] border border-black/8 bg-[#fcf6f2] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#171212] text-sm font-semibold text-white">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{user.fullName}</p>
                          <p className="mt-1 text-sm text-black/60">
                            @{user.username} / {user.email}
                          </p>
                          <p className="mt-1 text-sm text-black/55">{user.phone}</p>
                          <p className="mt-2 text-xs text-black/45">
                            Last login {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Not available"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{role?.name ?? user.role}</Badge>
                        <Badge tone={user.status === "Active" ? "success" : "warning"}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingUserId(user.id);
                          setFormState({
                            fullName: user.fullName,
                            email: user.email,
                            username: user.username,
                            phone: user.phone,
                            role: user.role,
                            password: "",
                            confirmPassword: "",
                            status: user.status
                          });
                          setFeedback("");
                        }}
                      >
                        Edit
                      </Button>

                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

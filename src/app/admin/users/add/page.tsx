"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Button, buttonStyles } from "@/components/ui/button";
import type { RoleKey } from "@/types/user";

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
  role: "admin",
  password: "",
  confirmPassword: "",
  status: "Active"
};

export default function AddAdminUserPage() {
  const router = useRouter();
  const { roles, addActivityLog, addNotification } = useCommerceStore();
  const { currentUser, createAdminAccount } = useAdminSession();
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

  const setErrorFeedback = (message: string) => {
    setFeedback(message);
    setFeedbackTone("error");
  };

  const setSuccessFeedback = (message: string) => {
    setFeedback(message);
    setFeedbackTone("success");
  };

  return (
    <AdminPage
      eyebrow="Access Control"
      title="Add User"
      description="Create a new admin or staff account with the existing Berry admin theme and role permissions."
    >
      <PermissionGuard
        permission="users.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            This signed-in account cannot create admin users.
          </div>
        }
      >
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">Create account</p>
              <h2 className="mt-2 font-display text-2xl text-ink">Add admin or staff user</h2>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Super Admin can create Admin and staff accounts. Admin can create staff accounts only when user management permission is enabled.
              </p>
            </div>
            <Link href="/admin/users" className={buttonStyles("secondary")}>
              Back to Users
            </Link>
          </div>

          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!currentUser) {
                setErrorFeedback("Admin session not found.");
                return;
              }

              if (!formState.fullName || !formState.email || !formState.username || !formState.phone) {
                setErrorFeedback("Please complete all user fields before saving.");
                return;
              }

              if (!formState.password) {
                setErrorFeedback("A password is required when creating a new admin account.");
                return;
              }

              if (formState.password !== formState.confirmPassword) {
                setErrorFeedback("Password and confirm password must match.");
                return;
              }

              const result = await createAdminAccount({
                fullName: formState.fullName,
                email: formState.email,
                username: formState.username,
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
              router.push("/admin/users");
            }}
          >
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
                value={formState.role}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    role: event.target.value as RoleKey
                  }))
                }
                className="mt-2 w-full rounded-[18px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm font-normal"
              >
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
            {feedback ? (
              <div
                className={`md:col-span-2 rounded-[18px] px-4 py-3 text-sm ${
                  feedbackTone === "success" ? "bg-berry-50 text-berry-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {feedback}
              </div>
            ) : null}
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button type="submit">Create Account</Button>
              <Link href="/admin/users" className={buttonStyles("secondary")}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

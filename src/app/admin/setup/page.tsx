"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Button } from "@/components/ui/button";

const initialForm = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: ""
};

export default function AdminSetupPage() {
  const router = useRouter();
  const { isReady, hasAdminAccounts, createInitialAdmin } = useAdminSession();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isReady && hasAdminAccounts) {
      router.replace("/admin/login");
    }
  }, [hasAdminAccounts, isReady, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#171212] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] bg-white shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[linear-gradient(180deg,#fff7f5_0%,#ffffff_100%)] p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-berry-700">Berry Clothing</p>
          <h1 className="mt-4 font-display text-5xl text-ink">Admin setup</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
            Create the first Super Admin account to unlock the Berry Clothing admin panel. After setup, return to admin login and sign in with the account you created.
          </p>

          <form
            className="mt-8 grid gap-5 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();

              if (form.password !== form.confirmPassword) {
                setErrorMessage("Password and confirm password must match.");
                return;
              }

              setIsSaving(true);
              const result = await createInitialAdmin({
                fullName: form.fullName,
                username: form.username,
                email: form.email,
                phone: form.phone,
                password: form.password
              });
              setIsSaving(false);

              if (!result.ok) {
                setErrorMessage(result.message);
                return;
              }

              setErrorMessage("");
              router.push("/admin/login");
            }}
          >
            <label className="text-sm font-semibold text-ink">
              Full Name
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Username
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Phone Number
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Confirm Password
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </label>
            {errorMessage ? (
              <div className="md:col-span-2 rounded-[18px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Button type="submit" className="w-full rounded-[20px] py-3.5" disabled={isSaving}>
                {isSaving ? "Creating account..." : "Create Super Admin"}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-[#fcf6f2] p-8 lg:p-10">
          <div className="rounded-[28px] bg-[#171212] p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/65">Setup rules</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <p>The first account is saved as an active Super Admin automatically.</p>
              <p>This account can create Admin and staff users later from the protected admin user area.</p>
              <p>No sample credentials or password hints are exposed on the admin login page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

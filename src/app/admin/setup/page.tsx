"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Button } from "@/components/ui/button";

const initialForm = {
  username: "",
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
            className="mt-8 space-y-5 max-w-md"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!form.username.trim() || !form.password.trim()) {
                setErrorMessage("Please fill in all fields.");
                return;
              }

              if (form.password !== form.confirmPassword) {
                setErrorMessage("Password and confirm password must match.");
                return;
              }

              setIsSaving(true);
              const usernameTrimmed = form.username.trim();
              const result = await createInitialAdmin({
                fullName: usernameTrimmed.charAt(0).toUpperCase() + usernameTrimmed.slice(1),
                username: usernameTrimmed,
                email: `${usernameTrimmed.toLowerCase()}@berryclothing.com`,
                phone: "0000000000",
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
            <div>
              <label className="text-sm font-semibold text-ink">Username</label>
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Enter username"
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter password"
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="Confirm password"
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            {errorMessage ? (
              <div className="rounded-[18px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
            <Button type="submit" className="w-full rounded-[20px] py-3.5" disabled={isSaving}>
              {isSaving ? "Creating account..." : "Create Super Admin"}
            </Button>
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

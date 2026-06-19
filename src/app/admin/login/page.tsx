"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isReady, isAuthenticated, hasAdminAccounts, login } = useAdminSession();
  const [redirectTarget, setRedirectTarget] = useState("/admin/dashboard");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const redirect = new URLSearchParams(globalThis.location.search).get("redirect");
    if (redirect) {
      setRedirectTarget(redirect);
    }
  }, []);

  useEffect(() => {
    if (isReady && !hasAdminAccounts) {
      router.replace("/admin/setup");
      return;
    }

    if (isReady && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [hasAdminAccounts, isAuthenticated, isReady, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#171212] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] bg-white shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[linear-gradient(180deg,#fff7f5_0%,#ffffff_100%)] p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-berry-700">Berry Clothing</p>
          <h1 className="mt-4 font-display text-5xl text-ink">Admin login</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
            Sign in with an approved admin or staff account to access dashboard controls, operations, and protected business tools.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              const result = await login({ identifier, password });
              if (!result.ok) {
                setErrorMessage(result.message);
                return;
              }
              setErrorMessage("");
              router.push(redirectTarget);
            }}
          >
            <div>
              <label className="text-sm font-semibold text-ink">Username or email</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter username or email"
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-ink">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-berry-700">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="mt-2 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            {errorMessage ? (
              <div className="rounded-[18px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
            <Button type="submit" className="w-full rounded-[20px] py-3.5">
              Login
            </Button>
          </form>
        </div>

        <div className="bg-[#fcf6f2] p-8 lg:p-10">
          <div className="rounded-[28px] bg-[#171212] p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/65">Access rules</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <p>Only approved admin and staff accounts can access the admin panel.</p>
              <p>Customer accounts are blocked from admin routes.</p>
              <p>Inactive accounts cannot sign in until reactivated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

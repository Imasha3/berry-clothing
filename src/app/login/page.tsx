"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { buttonStyles } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCustomerSession();
  const [redirectTarget, setRedirectTarget] = useState("/account");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const redirect = new URLSearchParams(globalThis.location.search).get("redirect");
    if (redirect) {
      setRedirectTarget(redirect);
    }
  }, []);

  const authQuery = useMemo(
    () => (redirectTarget && redirectTarget !== "/account" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""),
    [redirectTarget]
  );

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    const result = await login({
      email: form.email,
      password: form.password
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push(redirectTarget);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Customer Login</h1>
        <p className="mt-3 text-sm text-black/60">Login with your Berry Clothing customer email to continue shopping and manage your account.</p>
        <div className="mt-6 space-y-4">
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            className="w-full rounded-2xl border border-black/10 px-4 py-3"
          />
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            type="password"
            className="w-full rounded-2xl border border-black/10 px-4 py-3"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button onClick={handleLogin} className={buttonStyles("primary", "w-full")}>
            Login
          </button>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href={`/register${authQuery}`} className="text-berry-600">
            Create account
          </Link>
          <Link href="/forgot-password" className="text-berry-600">
            Forgot password
          </Link>
        </div>
      </div>
    </div>
  );
}

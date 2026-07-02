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
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="overflow-hidden rounded-[32px] border border-[#f3dde2] bg-white shadow-[0_30px_90px_rgba(23,18,18,0.12)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative bg-[radial-gradient(circle_at_top_left,_rgba(243,64,120,0.12),_transparent_38%),_linear-gradient(145deg,_#fffdfd,_#fff5f7)] p-6 sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-berry-700 shadow-soft">
              Sign In
            </div>
            <h1 className="mt-4 font-display text-4xl text-ink">Welcome back</h1>
            <p className="mt-3 text-sm leading-6 text-black/60">
              Sign in with your Berry Clothing customer email to continue shopping and manage your account.
            </p>
            <div className="mt-6 space-y-4">
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus:border-berry-300 focus:ring-4 focus:ring-berry-100"
              />
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                type="password"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus:border-berry-300 focus:ring-4 focus:ring-berry-100"
              />
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              <button onClick={handleLogin} className={buttonStyles("primary", "w-full")}>Sign In</button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm border-t border-black/5 pt-4">
              <div className="flex gap-3 flex-wrap">
                <Link href={`/register${authQuery}`} className="font-semibold text-berry-600">
                  Create customer account
                </Link>
                <span className="text-black/20">|</span>
                <Link href="/forgot-password" className="font-semibold text-berry-600">
                  Forgot password
                </Link>
              </div>
              <Link href="/admin/login" className="font-semibold text-berry-700 hover:text-berry-900">
                Admin Login →
              </Link>
            </div>
          </div>

          <div className="bg-[#fff7f9] p-6 sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-berry-700 shadow-sm">
              Sign Up
            </div>
            <h2 className="mt-4 font-display text-4xl text-ink">New to Berry?</h2>
            <p className="mt-3 text-sm leading-7 text-black/62">
              Create a customer account for faster checkout, order tracking, saved delivery details, and return requests.
            </p>
            <div className="mt-6 rounded-[24px] border border-[#f3dde2] bg-white p-5 text-sm leading-6 text-black/62">
              Customer sign-up creates customer accounts only. Admin accounts are created manually through the database or admin panel.
            </div>
            <div className="mt-6 space-y-3 text-sm text-black/60">
              <div className="rounded-2xl bg-white/80 p-3">✔ Faster checkout and saved addresses</div>
              <div className="rounded-2xl bg-white/80 p-3">✔ Order tracking and return requests</div>
            </div>
            <Link href={`/register${authQuery}`} className={buttonStyles("secondary", "mt-6 w-full bg-white")}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

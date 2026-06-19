"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useCustomerSession();
  const [redirectTarget, setRedirectTarget] = useState("/account");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    password: "",
    confirmPassword: ""
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

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.city.trim() || !form.address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      address: form.address,
      password: form.password
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push(redirectTarget);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Create Account</h1>
        <p className="mt-3 text-sm text-black/60">Create your Berry Clothing customer profile to manage orders and checkout details.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Full name"
            className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2"
          />
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2"
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone number"
            className="rounded-2xl border border-black/10 px-4 py-3"
          />
          <input
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            placeholder="City"
            className="rounded-2xl border border-black/10 px-4 py-3"
          />
          <textarea
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            placeholder="Address"
            className="min-h-28 rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2"
          />
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            type="password"
            className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2"
          />
          <input
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            placeholder="Confirm password"
            type="password"
            className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2"
          />
        </div>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        <Button className="mt-6 w-full" onClick={handleSubmit}>
          Create Account
        </Button>
        <p className="mt-5 text-sm text-black/60">
          Already have an account?{" "}
          <Link href={`/login${authQuery}`} className="text-berry-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

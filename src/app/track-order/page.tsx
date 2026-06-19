"use client";

import { useState } from "react";
import { AuthRequiredModal } from "@/components/common/auth-required-modal";
import { buttonStyles } from "@/components/ui/button";

export default function TrackOrderPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Track Order</h1>
        <p className="mt-4 text-sm leading-7 text-black/65">
          Customer login is required before order tracking. Please create an account or login before placing an order.
        </p>
        <button onClick={() => setOpen(true)} className={buttonStyles("primary", "mt-6")}>
          Login to Track
        </button>
      </div>
      <AuthRequiredModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

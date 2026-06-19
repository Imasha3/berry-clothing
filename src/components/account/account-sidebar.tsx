"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerAccountLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
      <p className="font-display text-2xl text-ink">My Account</p>
      <div className="mt-5 space-y-2">
        {customerAccountLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm transition",
              pathname === link.href ? "bg-berry-50 font-semibold text-berry-700" : "text-black/65 hover:bg-black/5"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteNavLinks } from "@/lib/constants";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isReady, customer } = useCustomerSession();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings().then(setSettings).catch(() => {
      setSettings(DEFAULT_STORE_SETTINGS);
    });
  }, []);

  const socialLinks = settings.socialLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-[#f1d9dd] bg-[rgba(255,250,248,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/berry-logo.jpeg"
            alt="Berry logo"
            width={500}
            height={500}
            priority
            className="h-12 w-auto rounded-full ring-1 ring-[#efc4ce] sm:h-14"
          />
          <div className="hidden sm:block">
            <p className="font-display text-xl text-ink">{settings.storeName}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-berry-700">Boutique Wear</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 rounded-full bg-white/80 p-2 shadow-soft ring-1 ring-[#f1d9dd] md:flex">
          {siteNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition hover:text-berry-700",
                pathname === link.href
                  ? "bg-[#ffe4eb] font-semibold text-berry-700"
                  : "text-black/70 hover:bg-[#fff1f5]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href={isReady && isAuthenticated ? "/account" : "/login"}
              className="font-medium text-black/70 transition hover:text-berry-700"
            >
              Sign In
            </Link>
            {isReady && isAuthenticated && customer?.name ? (
              <span className="max-w-[70px] truncate text-xs font-semibold text-berry-700 sm:max-w-none">
                {customer.name}
              </span>
            ) : null}
          </div>
          <Link
            href="/cart"
            className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-[#2b1b22] hover:text-[#ffd5e1]"
          >
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}

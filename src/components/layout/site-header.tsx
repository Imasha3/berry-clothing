"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SocialLinksRow } from "@/components/common/social-links";
import { siteNavLinks } from "@/lib/constants";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isReady, customer } = useCustomerSession();
  const { items } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchStoreSettings().then(setSettings).catch(() => {
      setSettings(DEFAULT_STORE_SETTINGS);
    });
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#f1d9dd] bg-[rgba(255,250,248,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
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
        <div className="hidden items-center gap-4 text-sm sm:flex">
          <SocialLinksRow links={settings.socialLinks} className="hidden lg:flex" iconClassName="h-9 w-9 px-2 py-2" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isReady && isAuthenticated && customer?.name ? (
              <Link
                href="/account"
                className="font-medium text-berry-700 transition hover:text-berry-900"
              >
                {customer.name.split(" ")[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="font-medium text-black/70 transition hover:text-berry-700"
              >
                Sign In
              </Link>
            )}
          </div>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition hover:bg-[#2b1b22] hover:text-[#ffd5e1] shadow-soft"
            aria-label="Shopping Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {isReady && cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-berry-600 text-[10px] font-bold text-white ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-soft ring-1 ring-[#f1d9dd] transition hover:text-berry-700"
            aria-label="Shopping Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {isReady && cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-berry-600 text-[10px] font-bold text-white ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-soft transition hover:bg-berry-700"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
            <span className="flex flex-col gap-1.5">
              <span className={cn("h-0.5 w-5 rounded-full bg-white transition", isMobileMenuOpen && "translate-y-2 rotate-45")} />
              <span className={cn("h-0.5 w-5 rounded-full bg-white transition", isMobileMenuOpen && "opacity-0")} />
              <span className={cn("h-0.5 w-5 rounded-full bg-white transition", isMobileMenuOpen && "-translate-y-2 -rotate-45")} />
            </span>
          </button>
        </div>
      </div>
      {isMobileMenuOpen ? (
        <div className="border-t border-[#f1d9dd] bg-[#fffaf8] px-4 pb-5 pt-2 shadow-[0_18px_35px_rgba(44,24,33,0.08)] md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {siteNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  pathname === link.href
                    ? "bg-[#ffe4eb] text-berry-700"
                    : "bg-white/80 text-black/70 ring-1 ring-black/5 hover:bg-[#fff1f5] hover:text-berry-700"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href={isReady && isAuthenticated ? "/account" : "/login"}
                className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black/70 ring-1 ring-black/5"
              >
                {isReady && isAuthenticated && customer?.name ? customer.name.split(" ")[0] : "Sign In"}
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                Cart
                {isReady && cartItemCount > 0 && (
                  <span className="ml-1 rounded-full bg-berry-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-50 border-b border-[#f3dee4] bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/berry-logo.jpeg"
            alt="Berry logo"
            width={500}
            height={500}
            priority
            className="h-12 w-auto rounded-none ring-1 ring-[#f5d3dd] sm:h-14"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-10 text-sm font-medium tracking-tight text-black/80 md:flex">
          {siteNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b-2 border-transparent pb-1 transition duration-200 hover:border-berry-200 hover:text-berry-700",
                pathname === link.href ? "border-berry-200 text-ink" : "text-black/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/shop"
            className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition duration-200 hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" />
            </svg>
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition duration-200 hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
            aria-label="Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          <Link
            href="/account"
            className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition duration-200 hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
            aria-label="Account"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 0115 0" />
            </svg>
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition duration-200 hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
            aria-label="Shopping Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {isReady && cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-none bg-berry-600 px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-none bg-ink text-white transition hover:bg-berry-700 md:hidden"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex flex-col gap-1.5">
            <span className={cn("h-0.5 w-5 rounded-none bg-white transition", isMobileMenuOpen && "translate-y-2 rotate-45")} />
            <span className={cn("h-0.5 w-5 rounded-none bg-white transition", isMobileMenuOpen && "opacity-0")} />
            <span className={cn("h-0.5 w-5 rounded-none bg-white transition", isMobileMenuOpen && "-translate-y-2 -rotate-45")} />
          </span>
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-[#f1d9dd] bg-[#fffaf8] px-4 pb-5 pt-3 shadow-[0_18px_35px_rgba(44,24,33,0.08)] md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/shop"
                className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z" />
                </svg>
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
                aria-label="Wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
                aria-label="Account"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 0115 0" />
                </svg>
              </Link>
              <Link
                href="/cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition hover:border-berry-200 hover:bg-[#fff1f5] hover:text-berry-700"
                aria-label="Shopping Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0 a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {isReady && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-none bg-berry-600 px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <nav className="mt-4 grid gap-2">
            {siteNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-none px-4 py-3 text-sm font-semibold transition",
                  pathname === link.href
                    ? "bg-[#ffe4eb] text-berry-700"
                    : "bg-white/80 text-black/70 ring-1 ring-black/5 hover:bg-[#fff1f5] hover:text-berry-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

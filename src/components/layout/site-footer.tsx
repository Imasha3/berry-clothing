"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SocialLinksRow } from "@/components/common/social-links";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

const shopLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop", label: "New Arrivals" },
  { href: "/shop", label: "Best Sellers" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/return-policy", label: "Returns" }
];

const customerLinks = [
  { href: "/contact", label: "Contact Us" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/account/orders", label: "Order Tracking" },
  { href: "/account/payment-history", label: "Payment Options" }
];

const aboutLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/about", label: "Press" },
  { href: "/about", label: "Careers" }
];

function mergeSettings(settings: StoreSettings): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    socialLinks: {
      ...DEFAULT_STORE_SETTINGS.socialLinks,
      ...settings.socialLinks
    },
    bankDetails: {
      ...DEFAULT_STORE_SETTINGS.bankDetails,
      ...settings.bankDetails
    }
  };
}

export function SiteFooter() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => setSettings(mergeSettings(nextSettings)))
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, []);

  const year = new Date().getFullYear();

  const socialEntries = (Object.entries(settings.socialLinks) as Array<[keyof StoreSettings["socialLinks"], string]>)
    .filter(([, href]) => Boolean(href));

  return (
    <footer className="bg-[#fff1f6] text-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/berry-logo.jpeg"
                alt="Berry logo"
                width={500}
                height={500}
                className="h-14 w-14 rounded-none object-cover ring-1 ring-[#f5d3dd]"
              />
              <div>
                <p className="font-display text-2xl text-ink">{settings.storeName}</p>
                <p className="text-xs uppercase tracking-[0.28em] text-berry-700">Boutique Wear</p>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-7 text-black/65">
              {settings.description || DEFAULT_STORE_SETTINGS.description}
            </p>
            <div className="rounded-none border border-black/10 bg-white p-1 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <label htmlFor="footer-newsletter" className="sr-only">
                    Newsletter email
                  </label>
                  <input
                    id="footer-newsletter"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent px-4 py-3 text-sm text-ink placeholder:text-black/40 outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-none bg-berry-500 px-5 text-sm font-semibold text-white transition hover:bg-berry-600"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-berry-700">Shop</p>
            <div className="space-y-3 text-sm text-black/70">
              {shopLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} className="transition hover:text-berry-700">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-berry-700">Customer Service</p>
            <div className="space-y-3 text-sm text-black/70">
              {customerLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} className="transition hover:text-berry-700">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-berry-700">About</p>
            <div className="space-y-3 text-sm text-black/70">
              {aboutLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href} className="transition hover:text-berry-700">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-berry-700">Contact</p>
            <div className="space-y-3 text-sm text-black/70">
              {settings.contactEmail ? <p>Email: <a href={`mailto:${settings.contactEmail}`} className="transition hover:text-berry-700">{settings.contactEmail}</a></p> : null}
              {settings.contactPhone ? <p>Phone: <a href={`tel:${settings.contactPhone}`} className="transition hover:text-berry-700">{settings.contactPhone}</a></p> : null}
              {settings.address ? <p>{settings.address}</p> : null}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-berry-700">Social Media</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {socialEntries.map(([key, href]) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-black/10 bg-white text-ink transition hover:border-berry-200 hover:text-berry-700"
                    aria-label={key}
                  >
                    <img
                      src={`https://cdn-icons-png.flaticon.com/512/${key === "facebook" ? "733/733547" : key === "instagram" ? "2111/2111463" : key === "tiktok" ? "3046/3046121" : key === "whatsapp" ? "733/733585" : ""}.png`}
                      alt={key}
                      className="h-5 w-5 object-contain"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-berry-200/60 pt-6 text-sm text-black/50 sm:flex sm:items-center sm:justify-between">
          <p>
            © {year} {settings.storeName}. {settings.footerText || DEFAULT_STORE_SETTINGS.footerText}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:mt-0">
            <span className="rounded-none border border-black/10 bg-white px-3 py-1">Visa</span>
            <span className="rounded-none border border-black/10 bg-white px-3 py-1">Mastercard</span>
            <span className="rounded-none border border-black/10 bg-white px-3 py-1">Amex</span>
            <span className="rounded-none border border-black/10 bg-white px-3 py-1">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

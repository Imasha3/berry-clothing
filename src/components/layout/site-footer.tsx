"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SocialLinksRow } from "@/components/common/social-links";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/return-policy", label: "Returns" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" }
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

  return (
    <footer className="bg-[#fff8fb] text-ink border-t border-white/[0.02]">
      <div className="mx-auto container grid gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-4">
            <Image
              src="/berry-logo.jpeg"
              alt="Berry logo"
              width={500}
              height={500}
              className="h-16 w-16 rounded-full object-cover ring-1 ring-white/90"
            />
            <div>
              <p className="font-display text-2xl">{settings.storeName}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb6c9]">Boutique Wear</p>
            </div>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
            {settings.description || DEFAULT_STORE_SETTINGS.description}
          </p>
          <SocialLinksRow links={settings.socialLinks} className="mt-4" iconClassName="bg-white/95" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb6c9]">Contact</p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/68">
            {settings.contactEmail ? <p>Email: {settings.contactEmail}</p> : null}
            {settings.contactPhone ? <p>Phone: {settings.contactPhone}</p> : null}
            {settings.address ? <p>Address: {settings.address}</p> : null}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb6c9]">Quick Links</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/68">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.02] px-4 py-4 text-center text-xs text-black/50 sm:px-6">
        © {year} {settings.storeName}. {settings.footerText || DEFAULT_STORE_SETTINGS.footerText}
      </div>
    </footer>
  );
}

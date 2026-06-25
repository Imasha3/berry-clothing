"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/return-policy", label: "Returns & Exchanges" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" }
];

export function SiteFooter() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => {
        setSettings({
          ...DEFAULT_STORE_SETTINGS,
          ...nextSettings,
          socialLinks: {
            ...DEFAULT_STORE_SETTINGS.socialLinks,
            ...nextSettings.socialLinks
          },
          bankDetails: {
            ...DEFAULT_STORE_SETTINGS.bankDetails,
            ...nextSettings.bankDetails
          }
        });
      })
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, []);

  const socialLinks = settings.socialLinks ?? DEFAULT_STORE_SETTINGS.socialLinks;

  return (
    <footer className="border-t border-black/5 bg-[#fff8f7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Image
            src="/berry-logo.jpeg"
            alt="Berry logo"
            width={500}
            height={500}
            className="h-20 w-auto"
          />
          <p className="mt-3 max-w-md text-sm leading-6 text-black/65">{settings.description || DEFAULT_STORE_SETTINGS.description}</p>
          <p className="mt-4 text-sm font-semibold text-berry-700">{settings.footerText || DEFAULT_STORE_SETTINGS.footerText}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-berry-700">Explore</p>
          <div className="mt-4 space-y-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block text-black/65 hover:text-berry-600">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-berry-700">Contact</p>
          <div className="mt-4 space-y-3 text-sm text-black/65">
            {settings.contactPhone ? <p>{settings.contactPhone}</p> : null}
            {settings.contactEmail ? <p>{settings.contactEmail}</p> : null}
            {settings.address ? <p>{settings.address}</p> : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {socialLinks.facebook ? (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4267b2] text-white"
                  aria-label="Facebook"
                >
                  f
                </a>
              ) : null}
              {socialLinks.instagram ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] text-white"
                  aria-label="Instagram"
                >
                  in
                </a>
              ) : null}
              {socialLinks.tiktok ? (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
                  aria-label="TikTok"
                >
                  t
                </a>
              ) : null}
              {socialLinks.youtube ? (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ff0000] text-white"
                  aria-label="YouTube"
                >
                  y
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

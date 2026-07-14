"use client";

import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

const socialIcons = {
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  tiktok: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
  ),
  whatsapp: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  )
};

const labels = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp"
};

export function FollowUs() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    let isMounted = true;
    fetchStoreSettings()
      .then((nextSettings) => {
        if (isMounted) {
          setSettings(nextSettings);
        }
      })
      .catch(() => {
        // Handled by state default
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const socialLinks = settings.socialLinks ?? DEFAULT_STORE_SETTINGS.socialLinks;
  
  const activeSocials = (["instagram", "facebook", "tiktok", "whatsapp"] as const)
    .map((key) => ({ key, href: socialLinks[key] }))
    .filter((entry) => Boolean(entry.href));

  if (activeSocials.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20 border-t border-black/[0.04] bg-gradient-to-r from-[#fff9fa] via-[#fffcfd] to-[#fff6f9]">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-berry-700">
          Stay Close
        </p>
        <h2 className="mt-3 font-display text-3xl font-light text-ink sm:text-4xl lg:text-5xl leading-tight tracking-wide">
          Follow {settings.storeName}
        </h2>
        <p className="mt-4 mx-auto max-w-xl text-sm leading-relaxed text-black/60 font-body font-light">
          Connect with us on social media for the latest collections, exclusive launches, styling notes, and behind-the-scenes stories.
        </p>
        
        <div className="mt-8 flex justify-center gap-4">
          {activeSocials.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={labels[key]}
              className="inline-flex h-12 w-12 items-center justify-center border border-black/10 bg-white text-ink transition-all duration-300 hover:scale-[1.06] hover:border-berry-500 hover:text-berry-600 hover:shadow-soft"
            >
              {socialIcons[key]}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

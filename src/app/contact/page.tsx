"use client";

import { useEffect, useState } from "react";
import { SocialLinksRow } from "@/components/common/social-links";
import { Button } from "@/components/ui/button";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import type { StoreSettings } from "@/types/settings";

const detailIcons = {
  phone: "☎",
  email: "✉",
  address: "⌖",
  website: "◎"
};

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

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => setSettings(mergeSettings(nextSettings)))
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, []);

  const details = [
    { icon: detailIcons.phone, label: "Phone", value: settings.contactPhone },
    { icon: detailIcons.email, label: "Email", value: settings.contactEmail },
    { icon: detailIcons.address, label: "Address", value: settings.address },
    { icon: detailIcons.website, label: "Website", value: "berryclothing.lk" }
  ].filter((item) => Boolean(item.value));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[8px] bg-[#171212] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#ffb6c9]">Contact</p>
          <h1 className="mt-3 font-display text-5xl">Talk to Berry Clothing</h1>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Reach us for product questions, delivery support, order updates, and new collection details.
          </p>
          <div className="mt-7 space-y-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-start gap-3 rounded-[8px] bg-white/8 px-4 py-3 text-sm text-white/78">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
                  {detail.icon}
                </span>
                <span>
                  <span className="block font-semibold text-white">{detail.label}</span>
                  <span className="mt-1 block">{detail.value}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <p className="mb-3 text-sm font-semibold text-white">Follow us online</p>
            <SocialLinksRow links={settings.socialLinks} showText iconClassName="bg-white" />
          </div>
        </div>

        <div className="rounded-[8px] bg-white p-8 shadow-soft ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-berry-700">Message Us</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Send a quick note</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input placeholder="Name" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input placeholder="Phone" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input placeholder="Email" className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2" />
            <textarea placeholder="Message" className="min-h-40 rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2" />
          </div>
          <Button className="mt-6">Send Message</Button>
        </div>
      </div>
    </div>
  );
}

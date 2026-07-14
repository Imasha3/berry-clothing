"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SocialLinksRow } from "@/components/common/social-links";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import type { StoreSettings } from "@/types/settings";

const values = [
  "High Quality Products",
  "Affordable Prices",
  "Fast Delivery",
  "Trusted Service",
  "Customer Satisfaction"
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

export default function AboutPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => setSettings(mergeSettings(nextSettings)))
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid overflow-hidden rounded-[8px] bg-[#171212] text-white shadow-soft lg:grid-cols-[0.92fr_1.08fr]">
        <div className="p-8 lg:p-12">
          <Image
            src="/berry-logo.jpeg"
            alt="Berry Clothing logo"
            width={500}
            height={500}
            className="h-20 w-20 rounded-full object-cover ring-1 ring-white/20"
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.32em] text-[#ffb6c9]">Our Story</p>
          <h1 className="mt-3 font-display text-5xl font-light leading-tight">About {settings.storeName}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/72 font-body font-light">
            Berry Clothing is a Sri Lankan fashion store built around stylish everyday pieces, customer trust,
            and a warm social shopping experience. The brand brings together trendy designs, wearable fits,
            and accessible prices for shoppers who want polished fashion without fuss.
          </p>
          <SocialLinksRow links={settings.socialLinks} showText className="mt-7" iconClassName="bg-white" />
        </div>
        <div
          className="min-h-[360px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80')"
          }}
        />
      </section>
 
      <section className="grid gap-6 py-12 md:grid-cols-2">
        <div className="rounded-[8px] bg-white p-7 shadow-soft ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-berry-700">Our Mission</p>
          <h2 className="mt-3 font-display text-4xl font-light text-ink">Fashion that feels current, comfortable, and attainable.</h2>
          <p className="mt-4 text-sm leading-7 text-black/64">
            We focus on affordable fashion, quality clothing, and trendy styles that work for real wardrobes.
            Every collection is selected to feel fresh, feminine, and easy to style.
          </p>
        </div>

        <div className="rounded-[8px] bg-white p-7 shadow-soft ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-berry-700">Why Choose Us</p>
          <div className="mt-5 grid gap-3">
            {values.map((value) => (
              <div key={value} className="flex items-center gap-3 rounded-[8px] bg-[#fff7f5] px-4 py-3 text-sm font-semibold text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-berry-500 text-xs text-white">✓</span>
                {value}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

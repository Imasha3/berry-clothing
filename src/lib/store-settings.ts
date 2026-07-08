import type { StoreSettings } from "@/types/settings";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Berry Clothing",
  logo: "Berry",
  description: "A modern Sri Lankan women’s fashion label bringing social-selling energy into a polished online shopping experience.",
  contactEmail: "hello@berryclothing.lk",
  contactPhone: "+94 77 123 4567",
  address: "Colombo, Sri Lanka",
  footerText: "Crafted with care for stylish women in Sri Lanka.",
  homepageSliderItems: [
    {
      id: "default-slider-1",
      imageUrl: "/images/homepage-slider-1.svg",
      title: "Discover Your Style",
      subtitle: "Fresh arrivals and polished essentials for every moment.",
      ctaLabel: "Shop New In",
      ctaHref: "/shop",
      isActive: true,
      order: 1
    },
    {
      id: "default-slider-2",
      imageUrl: "/images/homepage-slider-2.svg",
      title: "Seasonal Favorites",
      subtitle: "Soft silhouettes, elevated staples, and easy everyday dressing.",
      ctaLabel: "Explore Collection",
      ctaHref: "/shop",
      isActive: true,
      order: 2
    }
  ],
  socialLinks: {
    facebook: "https://www.facebook.com/share/1HJuZ2v3HU/",
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    whatsapp: "https://wa.me/94771234567",
    youtube: ""
  },
  bankDetails: {
    bankName: "",
    accountName: "",
    accountNumber: "",
    branch: ""
  },
  businessInfo: "",
  returnPolicy: "",
  exchangePolicy: ""
};

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const response = await fetch("/api/settings", { cache: "no-store" });
  if (!response.ok) {
    return DEFAULT_STORE_SETTINGS;
  }
  const settings = (await response.json()) as StoreSettings;
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
    },
    homepageSliderItems: settings.homepageSliderItems ?? DEFAULT_STORE_SETTINGS.homepageSliderItems
  };
}

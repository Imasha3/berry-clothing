import type { StoreSettings } from "@/types/settings";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Berry Clothing",
  logo: "Berry",
  description: "A modern Sri Lankan women’s fashion label bringing social-selling energy into a polished online shopping experience.",
  contactEmail: "hello@berryclothing.lk",
  contactPhone: "+94 77 123 4567",
  address: "Colombo, Sri Lanka",
  footerText: "Crafted with care for stylish women in Sri Lanka.",
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
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
    }
  };
}

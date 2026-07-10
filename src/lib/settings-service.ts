import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { StoreSettings } from "@/types/settings";
import { supabaseAdmin } from "@/lib/supabase-server";

export function normalizeStoreSettings(settings?: Partial<StoreSettings> | null): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    socialLinks: {
      ...DEFAULT_STORE_SETTINGS.socialLinks,
      ...settings?.socialLinks
    },
    bankDetails: {
      ...DEFAULT_STORE_SETTINGS.bankDetails,
      ...settings?.bankDetails
    }
  };
}

async function readLocalSettings() {
  // filesystem storage removed; kept for API compatibility if needed
  return DEFAULT_STORE_SETTINGS;
}

async function writeLocalSettings(settings: StoreSettings) {
  // filesystem storage removed; no-op
  return settings;
}

export async function getStoreSettings() {
  try {
    const { data, error } = await supabaseAdmin.from("store_settings").select("settings").eq("id", "singleton").single();
    if (error || !data) {
      return DEFAULT_STORE_SETTINGS;
    }

    return normalizeStoreSettings(data?.settings as Partial<StoreSettings>);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(payload: Partial<StoreSettings>) {
  const nextSettings = normalizeStoreSettings(payload);

  try {
    const payloadRow = { id: "singleton", settings: nextSettings };
    await supabaseAdmin.from("store_settings").upsert(payloadRow);
    return nextSettings;
  } catch {
    return nextSettings;
  }
}

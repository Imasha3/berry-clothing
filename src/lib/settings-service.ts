import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { HomepageSliderItem } from "@/types/homepage-slider";
import type { StoreSettings } from "@/types/settings";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

function normalizeHomepageSlides(slides?: Partial<HomepageSliderItem>[] | null): HomepageSliderItem[] {
  return (slides ?? [])
    .map((slide, index) => ({
      id: slide.id ?? `slide-${index + 1}`,
      imageUrl: slide.imageUrl ?? "",
      title: slide.title ?? "",
      subtitle: slide.subtitle ?? "",
      ctaLabel: slide.ctaLabel ?? "",
      ctaHref: slide.ctaHref ?? "/shop",
      isActive: slide.isActive ?? true,
      order: slide.order ?? index + 1,
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt
    }))
    .filter((slide) => slide.imageUrl && !slide.imageUrl.startsWith("blob:"))
    .sort((left, right) => left.order - right.order)
    .map((slide, index) => ({ ...slide, order: index + 1 }));
}

export function normalizeStoreSettings(settings?: Partial<StoreSettings> | null): StoreSettings {
  const homepageSliderItems = normalizeHomepageSlides(
    settings?.homepageSliderItems ?? DEFAULT_STORE_SETTINGS.homepageSliderItems
  );

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
    },
    homepageSliderItems
  };
}

function isMissingRowError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" || error?.code === "PGRST204" || error?.message?.includes("schema cache");
}

export async function getStoreSettings(client: SupabaseClient = supabaseAdmin) {
  let settings = DEFAULT_STORE_SETTINGS;

  try {
    const { data, error } = await client
      .from("store_settings")
      .select("settings")
      .eq("id", "singleton")
      .single();

    if (!error && data?.settings) {
      settings = normalizeStoreSettings(data.settings as Partial<StoreSettings>);
    } else if (error && !isMissingRowError(error) && !isMissingColumnError(error)) {
      console.error("Unable to load store settings from Supabase:", error.message);
    }
  } catch (error) {
    console.error("Unable to load store settings from Supabase:", error);
  }

  if (settings === DEFAULT_STORE_SETTINGS) {
    try {
      const { data, error } = await client
        .from("homepage_slider")
        .select("data")
        .eq("id", "store-settings")
        .single();

      if (!error && data?.data) {
        settings = normalizeStoreSettings(data.data as Partial<StoreSettings>);
      } else if (error && !isMissingRowError(error) && !isMissingColumnError(error)) {
        console.error("Unable to load fallback store settings from Supabase:", error.message);
      }
    } catch (error) {
      console.error("Unable to load fallback store settings from Supabase:", error);
    }
  }

  try {
    const { data, error } = await client
      .from("homepage_slider")
      .select("slides")
      .eq("id", "singleton")
      .single();

    if (!error && Array.isArray(data?.slides)) {
      const homepageSliderItems = normalizeHomepageSlides(data.slides as Partial<HomepageSliderItem>[]);
      if (homepageSliderItems.length) {
        settings = normalizeStoreSettings({ ...settings, homepageSliderItems });
      }
    } else if (error && !isMissingRowError(error) && !isMissingColumnError(error)) {
      console.error("Unable to load homepage slider from Supabase:", error.message);
    }
  } catch (error) {
    console.error("Unable to load homepage slider from Supabase:", error);
  }

  try {
    const { data, error } = await client
      .from("homepage_slider")
      .select("data")
      .eq("id", "singleton")
      .single();

    if (!error && Array.isArray(data?.data)) {
      const homepageSliderItems = normalizeHomepageSlides(data.data as Partial<HomepageSliderItem>[]);
      if (homepageSliderItems.length) {
        settings = normalizeStoreSettings({ ...settings, homepageSliderItems });
      }
    } else if (error && !isMissingRowError(error) && !isMissingColumnError(error)) {
      console.error("Unable to load fallback homepage slider from Supabase:", error.message);
    }
  } catch (error) {
    console.error("Unable to load fallback homepage slider from Supabase:", error);
  }

  return settings;
}

export async function updateStoreSettings(payload: Partial<StoreSettings>, client: SupabaseClient = supabaseAdmin) {
  const nextSettings = normalizeStoreSettings(payload);
  const now = new Date().toISOString();

  const { error: settingsError } = await client
    .from("store_settings")
    .upsert({ id: "singleton", settings: nextSettings, updated_at: now }, { onConflict: "id" });

  if (settingsError && isMissingColumnError(settingsError)) {
    const { error: fallbackSettingsError } = await client
      .from("homepage_slider")
      .upsert({ id: "store-settings", data: nextSettings, updated_at: now }, { onConflict: "id" });

    if (fallbackSettingsError) {
      throw new Error(`Unable to save store settings: ${fallbackSettingsError.message}`);
    }
  } else if (settingsError) {
    throw new Error(`Unable to save store settings: ${settingsError.message}`);
  }

  const { error: sliderError } = await client
    .from("homepage_slider")
    .upsert(
      { id: "singleton", slides: nextSettings.homepageSliderItems ?? [], updated_at: now },
      { onConflict: "id" }
    );

  if (sliderError && isMissingColumnError(sliderError)) {
    const { error: fallbackSliderError } = await client
      .from("homepage_slider")
      .upsert(
        { id: "singleton", data: nextSettings.homepageSliderItems ?? [], updated_at: now },
        { onConflict: "id" }
      );

    if (fallbackSliderError) {
      throw new Error(`Unable to save homepage slider: ${fallbackSliderError.message}`);
    }
  } else if (sliderError) {
    throw new Error(`Unable to save homepage slider: ${sliderError.message}`);
  }

  return nextSettings;
}

import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { HomepageSliderItem } from "@/types/homepage-slider";
import type { StoreSettings } from "@/types/settings";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getStoreSettings, updateStoreSettings } from "@/lib/settings-service";

const defaultSlides: HomepageSliderItem[] = [
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
];

function normalizeSlides(slides?: Partial<HomepageSliderItem>[] | null): HomepageSliderItem[] {
  const nextSlides = (slides ?? []).map((slide, index) => ({
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
  }));

  return nextSlides.filter((slide) => slide.imageUrl).sort((left, right) => left.order - right.order);
}

function isMissingRowError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" || error?.code === "PGRST204" || error?.message?.includes("schema cache");
}

async function readSupabaseSlides(): Promise<HomepageSliderItem[]> {
  try {
    const { data, error } = await supabaseAdmin.from("homepage_slider").select("slides").eq("id", "singleton").single();
    if (!error && Array.isArray(data?.slides)) {
      return normalizeSlides(data.slides as Partial<HomepageSliderItem>[]);
    }

    if (error && !isMissingRowError(error) && !isMissingColumnError(error)) {
      console.error("Unable to load homepage slider:", error.message);
    }
  } catch (error) {
    console.error("Unable to load homepage slider:", error);
  }

  try {
    const { data, error } = await supabaseAdmin.from("homepage_slider").select("data").eq("id", "singleton").single();
    if (!error && Array.isArray(data?.data)) {
      return normalizeSlides(data.data as Partial<HomepageSliderItem>[]);
    }

    if (error && !isMissingRowError(error) && !isMissingColumnError(error)) {
      console.error("Unable to load fallback homepage slider:", error.message);
    }
  } catch (error) {
    console.error("Unable to load fallback homepage slider:", error);
  }

  const settings = await getStoreSettings();
  return normalizeSlides(settings.homepageSliderItems ?? defaultSlides);
}

async function writeSupabaseSlides(slides: HomepageSliderItem[]) {
  const normalizedSlides = normalizeSlides(slides);
  const settings = await getStoreSettings();

  await updateStoreSettings({
    ...settings,
    homepageSliderItems: normalizedSlides
  });

  return normalizedSlides;
}

export async function getHomepageSliderItems(): Promise<HomepageSliderItem[]> {
  try {
    return await readSupabaseSlides();
  } catch (error) {
    console.error("Unable to get homepage slider items:", error);
    return defaultSlides;
  }
}

export async function updateHomepageSliderItems(slides: HomepageSliderItem[]) {
  return writeSupabaseSlides(slides);
}

export async function getHomepageSliderSettings(): Promise<StoreSettings> {
  return DEFAULT_STORE_SETTINGS;
}

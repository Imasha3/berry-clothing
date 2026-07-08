import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { HomepageSliderItem } from "@/types/homepage-slider";
import type { StoreSettings } from "@/types/settings";

const localHomepageSliderPath = path.join(process.cwd(), ".next-cache", "homepage-slider.json");

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

async function readLocalSlides(): Promise<HomepageSliderItem[]> {
  try {
    const content = await fs.readFile(localHomepageSliderPath, "utf8");
    return normalizeSlides(JSON.parse(content) as Partial<HomepageSliderItem>[]);
  } catch {
    return defaultSlides;
  }
}

async function writeLocalSlides(slides: HomepageSliderItem[]) {
  await fs.mkdir(path.dirname(localHomepageSliderPath), { recursive: true });
  await fs.writeFile(localHomepageSliderPath, JSON.stringify(slides, null, 2), "utf8");
  return slides;
}

export async function getHomepageSliderItems(): Promise<HomepageSliderItem[]> {
  try {
    return await readLocalSlides();
  } catch {
    return defaultSlides;
  }
}

export async function updateHomepageSliderItems(slides: HomepageSliderItem[]) {
  const normalizedSlides = normalizeSlides(slides);
  return writeLocalSlides(normalizedSlides);
}

export async function getHomepageSliderSettings(): Promise<StoreSettings> {
  return DEFAULT_STORE_SETTINGS;
}

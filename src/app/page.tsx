"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/common/section-heading";
import { TestimonialSlider } from "@/components/common/testimonial-slider";
import { ProductGrid } from "@/components/product/product-grid";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { buttonStyles } from "@/components/ui/button";
import { getProductPricing } from "@/lib/product";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";
import type { HomepageSliderItem } from "@/types/homepage-slider";
import type { StoreSettings } from "@/types/settings";

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

const categoryImages: Record<string, string> = {
  "Tops": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  "T-shirts": "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80",
  "Frocks": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  "Full dress": "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=800&q=80"
};

export default function HomePage() {
  const { products, activeCategories } = useCommerceStore();
  const featuredCategories = useMemo(
    () =>
      ["Tops", "T-shirts", "Frocks", "Full dress"]
        .map((name) => activeCategories.find((category) => category.name === name))
        .filter((category): category is NonNullable<(typeof activeCategories)[number]> => Boolean(category)),
    [activeCategories]
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [slides, setSlides] = useState<HomepageSliderItem[]>([]);

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => {
        const merged = mergeSettings(nextSettings);
        setSettings(merged);
        const nextSlides = (merged.homepageSliderItems ?? [])
          .filter((slide) => slide?.isActive && slide?.imageUrl)
          .sort((left, right) => left.order - right.order);
        setSlides(nextSlides);
        setActiveSlide(0);
      })
      .catch(() => {
        setSettings(DEFAULT_STORE_SETTINGS);
        setSlides([]);
      });
  }, []);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const latestProducts = useMemo(
    () => products.filter((product) => product.isNewArrival).slice(0, 4),
    [products]
  );
  const featuredProducts = useMemo(
    () => products.filter((product) => product.isSaleItem || product.featuredReview).slice(0, 4),
    [products]
  );
  const bestSellers = useMemo(
    () => products.filter((product) => product.isBestSeller).slice(0, 4),
    [products]
  );
  const trendingDeals = useMemo(
    () => products.filter((product) => getProductPricing(product).isDiscounted).slice(0, 4),
    [products]
  );
  const seasonCollection = useMemo(
    () => products.filter((product) => product.isNewArrival || product.isBestSeller).slice(0, 4),
    [products]
  );
  const heroProducts = useMemo(
    () => (trendingDeals.length ? trendingDeals : products).slice(0, 3),
    [products, trendingDeals]
  );
  const currentSlide = slides[activeSlide];
  const reviews = useMemo(
    () =>
      products
        .map((product) => product.featuredReview)
        .filter((review): review is NonNullable<(typeof products)[number]["featuredReview"]> => Boolean(review))
        .slice(0, 3),
    [products]
  );

  const socialLinks = settings.socialLinks ?? DEFAULT_STORE_SETTINGS.socialLinks;

  return (
    <div className="overflow-hidden pb-20">
      <section className="relative overflow-hidden w-full h-[60vh] sm:h-[75vh] lg:h-[88vh] bg-ink">
        {slides.length ? (
          <>
            <div className="relative w-full h-full">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    index === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  )}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || "Berry Clothing slider"}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6 sm:px-12 lg:px-20 text-white max-w-4xl">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90">
                        Berry Clothing
                      </p>
                      <h1 className="mt-4 font-display text-4xl leading-tight font-light tracking-wide sm:text-5xl lg:text-7xl">
                        {slide.title || "Discover a fresh edit"}
                      </h1>
                      <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base font-body font-light">
                        {slide.subtitle || "A clean boutique experience with new arrivals and elevated essentials."}
                      </p>
                      {slide.ctaLabel ? (
                        <div className="mt-8 flex flex-wrap gap-4">
                          <Link
                            href={slide.ctaHref || "/shop"}
                            className="inline-flex items-center justify-center border border-white bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-all duration-300 hover:bg-transparent hover:text-white"
                          >
                            {slide.ctaLabel}
                          </Link>
                          <Link
                            href="#season-collection"
                            className="inline-flex items-center justify-center border border-white bg-transparent px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-ink"
                          >
                            Explore Collection
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}

              {slides.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
                    aria-label="Previous slide"
                    className="absolute left-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/10 text-white transition hover:bg-white hover:text-ink hover:border-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                    aria-label="Next slide"
                    className="absolute right-6 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/10 text-white transition hover:bg-white hover:text-ink hover:border-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
                    {slides.map((entry, index) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Show slide ${index + 1}`}
                        className={cn(
                          "h-[2px] transition-all duration-300",
                          index === activeSlide ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white"
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(243,64,120,0.16),_transparent_42%),linear-gradient(135deg,_#fff6f6_0%,_#ffe8e0_100%)]" />
        )}
      </section>

      {/* Featured Categories removed per request */}

      {trendingDeals.length ? (
        <section className="container px-4 section-compact sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trending Deals"
            title="Limited time offers worth noticing"
            description="Discounted fashion picks with clean sale badges, dynamic pricing, and automatic savings."
          />
          <div className="mt-8">
            <ProductGrid products={trendingDeals} />
          </div>
        </section>
      ) : null}

        <section id="season-collection" className="container px-4 section-compact sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Season Collection"
          title="Fresh fashion picks styled for now"
          description="The latest Berry Clothing edit for modern wardrobes, easy gifting, and polished everyday outfits."
        />
        <div className="mt-8">
          <ProductGrid products={seasonCollection.length ? seasonCollection : latestProducts} />
        </div>
      </section>

      {featuredProducts.length ? (
        <section className="container px-4 section-compact sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Featured Products"
            title="Boutique pieces with extra Berry attention"
            description="A focused edit of standout styles, sale finds, and reviewed favorites without crowding the homepage."
          />
          <div className="mt-8">
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      ) : null}

      {bestSellers.length ? (
        <section className="container px-4 section-compact sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Best Sellers"
            title="The styles shoppers keep reaching for"
            description="Customer-loved Berry pieces with flattering fits, soft details, and dependable everyday styling."
          />
          <div className="mt-8">
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <Link href="/shop" className={buttonStyles("dark", "px-8")}>
          View All Products
        </Link>
      </section>

      {reviews.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Customer Love"
            title="Trusted by shoppers who found Berry online"
            description="A few real product notes that support the polished, social-first Berry storefront."
          />
          <TestimonialSlider reviews={reviews} />
        </section>
      ) : null}
    </div>
  );
}

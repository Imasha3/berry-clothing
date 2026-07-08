"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/common/section-heading";
import { SocialLinksRow } from "@/components/common/social-links";
import { ProductGrid } from "@/components/product/product-grid";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { buttonStyles } from "@/components/ui/button";
import { LatestFashionVideos } from "@/components/video/latest-fashion-videos";
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

export default function HomePage() {
  const { products } = useCommerceStore();
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
      <section className="relative overflow-hidden bg-[#fff7f6]">
        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="relative overflow-hidden rounded-[28px] border border-[#f6dfe4] bg-[#fffaf9] shadow-[0_28px_70px_rgba(23,18,18,0.12)]">
            {slides.length ? (
              <>
                <div className="relative aspect-[16/9] min-h-[320px] sm:min-h-[420px] lg:min-h-[560px]">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title || "Berry Clothing slider"}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(23,18,18,0.78)] via-[rgba(23,18,18,0.3)] to-transparent" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-xl px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-14 lg:py-12">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/80">Berry Clothing</p>
                      <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-6xl">
                        {currentSlide.title || "Discover a fresh edit"}
                      </h1>
                      <p className="mt-4 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                        {currentSlide.subtitle || "A clean boutique experience with new arrivals and elevated essentials."}
                      </p>
                      {currentSlide.ctaLabel ? (
                        <div className="mt-7 flex flex-wrap gap-3">
                          <Link href={currentSlide.ctaHref || "/shop"} className={buttonStyles("primary", "px-6 shadow-[0_22px_45px_rgba(243,64,120,0.34)]")}>
                            {currentSlide.ctaLabel}
                          </Link>
                          <Link href="#season-collection" className={buttonStyles("secondary", "bg-white/95 px-6 text-ink")}>Explore Collection</Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {slides.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
                        aria-label="Previous slide"
                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-lg transition hover:bg-white"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                        aria-label="Next slide"
                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-lg transition hover:bg-white"
                      >
                        →
                      </button>
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
                        {slides.map((entry, index) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => setActiveSlide(index)}
                            aria-label={`Show slide ${index + 1}`}
                            className={cn(
                              "h-2.5 rounded-full transition-all duration-300",
                              index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="relative aspect-[16/9] min-h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(243,64,120,0.16),_transparent_42%),linear-gradient(135deg,_#fff6f6_0%,_#ffe8e0_100%)] sm:min-h-[420px] lg:min-h-[560px]" />
            )}
          </div>
        </div>
      </section>

      {trendingDeals.length ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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

      <section id="season-collection" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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

      <LatestFashionVideos />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[28px] border border-[#ead4d8] bg-white p-7 shadow-[0_24px_60px_rgba(23,18,18,0.08)] md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-berry-700">Follow Us</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Stay close to Berry drops, videos, offers, and outfit inspiration.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/62">
              Connect with {settings.storeName} on social media for the latest launches and customer updates.
            </p>
          </div>
          <div className="flex items-center md:justify-end">
            <SocialLinksRow links={socialLinks} showText />
          </div>
        </div>
      </section>

      {reviews.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Customer Love"
            title="Trusted by shoppers who found Berry online"
            description="A few real product notes that support the polished, social-first Berry storefront."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-[8px] border border-[#ead4d8] bg-white p-6 shadow-soft">
                <p className="text-berry-600">{Array.from({ length: review.rating }).map(() => "*").join(" ")}</p>
                <p className="mt-4 text-sm leading-7 text-black/65">&quot;{review.comment}&quot;</p>
                <p className="mt-5 text-sm font-semibold text-ink">{review.customerName}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

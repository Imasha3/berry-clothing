"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/common/section-heading";
import { SocialLinksRow } from "@/components/common/social-links";
import { ProductImage } from "@/components/product/product-image";
import { ProductGrid } from "@/components/product/product-grid";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { buttonStyles } from "@/components/ui/button";
import { LatestFashionVideos } from "@/components/video/latest-fashion-videos";
import { getProductMainImage, getProductPricing } from "@/lib/product";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types/settings";

const heroSlides = [
  {
    eyebrow: "Berry Clothing",
    title: "Discover Your Style",
    description:
      "New arrivals, season sale styles, and premium everyday fashion curated with a clean boutique feel."
  },
  {
    eyebrow: "Season Sale",
    title: "Shop Premium Fashion",
    description:
      "Elegant clothing picks with modern silhouettes, soft colors, and easy styling for every plan."
  },
  {
    eyebrow: "Limited Offers",
    title: "Trending Deals Are Live",
    description:
      "Browse sale favorites, best sellers, and new discounts before they move out of stock."
  }
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

export default function HomePage() {
  const { products } = useCommerceStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => setSettings(mergeSettings(nextSettings)))
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

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
  const reviews = useMemo(
    () =>
      products
        .map((product) => product.featuredReview)
        .filter((review): review is NonNullable<(typeof products)[number]["featuredReview"]> => Boolean(review))
        .slice(0, 3),
    [products]
  );

  const slide = heroSlides[activeSlide];
  const socialLinks = settings.socialLinks ?? DEFAULT_STORE_SETTINGS.socialLinks;

  return (
    <div className="overflow-hidden pb-20">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,_#fffdfa_0%,_#fff5f4_45%,_#fef1f4_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(243,64,120,0.14),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.6),_transparent_24%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-soft ring-1 ring-black/5">
              <img src="/berry-logo.jpeg" alt="" className="h-9 w-9 rounded-full object-cover" />
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-berry-700">
                {slide.eyebrow}
              </span>
            </div>
            <h1 className="max-w-2xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-black/68 sm:text-lg">{slide.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className={buttonStyles("primary", "px-7 shadow-[0_22px_45px_rgba(243,64,120,0.34)]")}>
                Shop Now
              </Link>
              <Link href="#season-collection" className={buttonStyles("secondary", "bg-white px-7")}>
                View Collection
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              {heroSlides.map((entry, index) => (
                <button
                  key={entry.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show banner ${index + 1}`}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    index === activeSlide ? "w-12 bg-ink" : "w-2.5 bg-black/20 hover:bg-black/40"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {heroProducts.map((product, index) => {
              const pricing = getProductPricing(product);
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={cn(
                    "group relative overflow-hidden rounded-[24px] border border-[#f3dde2] bg-white shadow-[0_24px_55px_rgba(23,18,18,0.12)]",
                    index === 0 && "col-span-2"
                  )}
                >
                  <div className={cn("relative", index === 0 ? "aspect-[16/9]" : "aspect-[4/5]")}>
                    <ProductImage
                      source={getProductMainImage(product)}
                      alt={product.productName}
                      fallbackLabel={product.productName}
                      imageClassName="transition duration-[350ms] ease-out group-hover:scale-[1.08]"
                    />
                    {pricing.isDiscounted ? (
                      <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-black text-white">
                        {pricing.discountPercentage}% OFF
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-black/45">{product.category}</p>
                    <p className="mt-1 font-semibold text-ink">{product.productName}</p>
                  </div>
                </Link>
              );
            })}
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

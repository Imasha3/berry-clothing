"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { SectionHeading } from "@/components/common/section-heading";
import { StatCard } from "@/components/common/stat-card";
import { ProductGrid } from "@/components/product/product-grid";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { buttonStyles } from "@/components/ui/button";
import { LatestFashionVideos } from "@/components/video/latest-fashion-videos";
import { berryFacebookPageUrl, paymentOptionsMessage } from "@/lib/constants";

export default function HomePage() {
  const { products, activeCategories } = useCommerceStore();
  const newArrivals = useMemo(() => products.filter((product) => product.isNewArrival).slice(0, 4), [products]);
  const bestSellers = useMemo(() => products.filter((product) => product.isBestSeller).slice(0, 4), [products]);
  const featuredCategories = useMemo(
    () =>
      ["Tops", "T-shirts", "Frocks", "Full dress"]
        .map((name) => activeCategories.find((category) => category.name === name))
        .filter((category): category is NonNullable<(typeof activeCategories)[number]> => Boolean(category)),
    [activeCategories]
  );
  const reviews = useMemo(
    () =>
      products
        .map((product) => product.featuredReview)
        .filter((review): review is NonNullable<(typeof products)[number]["featuredReview"]> => Boolean(review))
        .slice(0, 3),
    [products]
  );

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top_left,_rgba(234,97,140,0.26),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(245,204,213,0.32),_transparent_28%),linear-gradient(135deg,#fff8f6_0%,#fff1f4_56%,#fdf4ec_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div className="relative z-10 self-center">
            <p className="inline-flex rounded-full bg-[#ffe4eb] px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-berry-700">
              Berry Clothing
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] text-ink md:text-6xl">
              Trendy Styles for Every Moment
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 md:text-lg">
              Discover dresses, tops, full kits, bottoms, and gift items designed for everyday elegance and special occasions.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className={buttonStyles("primary", "shadow-[0_18px_36px_rgba(227,76,125,0.28)]")}>
                Shop Collection
              </Link>
              <Link href="/shop" className={buttonStyles("secondary", "bg-white/90 hover:bg-[#fff0f4]")}>
                View New Arrivals
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard label="Community" value="12k+" helpText="Social Shoppers" />
              <StatCard label="Shipping" value="2-4 Days" helpText="Delivery Islandwide" />
              <StatCard label="Checkout" value="3 Options" helpText="Payment Options" />
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[40px] border border-[#f0d7dc] bg-[linear-gradient(145deg,#fff9f7_0%,#ffecef_56%,#f7eadf_100%)] p-6 shadow-[0_30px_60px_rgba(70,29,44,0.12)]">
            <div className="absolute -right-12 top-10 h-44 w-44 rounded-full bg-[#f8c8d2]/60 blur-3xl" />
            <div className="absolute -left-10 bottom-8 h-40 w-40 rounded-full bg-[#f9e0d2]/80 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between rounded-[32px] border border-white/70 bg-white/55 p-6 backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-berry-700">
                    Signature Berry Edit
                  </p>
                  <p className="mt-2 text-sm text-black/60">A softer, more elegant fashion story for every day and every event.</p>
                </div>
                <div className="w-fit rounded-full bg-[#fff3f6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-berry-700">
                  Boutique Style
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
                <div className="relative mx-auto flex w-full max-w-[290px] items-center justify-center rounded-[32px] bg-[linear-gradient(180deg,#fff8f8_0%,#ffe9ee_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Image
                    src="/berry-logo.jpeg"
                    alt="Berry Clothing brand visual"
                    width={460}
                    height={460}
                    priority
                    className="h-auto w-full rounded-[28px] object-contain"
                  />
                </div>

                <div className="space-y-4 rounded-[28px] bg-[#24171d] p-6 text-white shadow-[0_16px_36px_rgba(25,12,17,0.24)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ffb7ca]">Berry Signature</p>
                  <h2 className="font-display text-3xl leading-tight">Polished fashion picks with a feminine Berry finish.</h2>
                  <p className="text-sm leading-7 text-white/72">
                    Discover clean silhouettes, flattering essentials, coordinated looks, and gift-ready pieces wrapped in a stronger boutique identity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Categories"
          title="Shop the Berry collections you love most"
          description="Browse the current Berry Clothing categories through a cleaner, more polished boutique experience."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group overflow-hidden rounded-[30px] border border-[#eed8dc] bg-white/90 p-6 shadow-[0_22px_45px_rgba(44,24,33,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(44,24,33,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex rounded-full bg-[#ffe8ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-berry-700">
                  {category.name}
                </span>
                <span className="text-lg font-semibold text-berry-500">0{index + 1}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl text-ink">{category.name}</h3>
              <p className="mt-3 text-sm leading-7 text-black/60">
                {category.description || "Berry Clothing essentials curated for easier browsing and everyday styling."}
              </p>
              <p className="mt-6 text-sm font-semibold text-berry-700">Explore Collection</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="New Arrivals"
          title="Fresh fashion picks styled for now"
          description="The latest Berry pieces selected to feel elegant, wearable, and suitable for everyday plans or special occasions."
        />
        <div className="mt-8">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Best Sellers"
          title="The pieces shoppers keep reaching for"
          description="Berry favorites that combine soft femininity, boutique appeal, and styling ease."
        />
        <div className="mt-8">
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[36px] border border-[#efd7dc] bg-[linear-gradient(135deg,#fffaf8_0%,#ffeef2_55%,#fff4ea_100%)] p-8 shadow-[0_28px_55px_rgba(44,24,33,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/85 px-4 py-1 text-sm font-semibold uppercase tracking-[0.26em] text-berry-700">
              Facebook Community
            </p>
            <h2 className="mt-4 font-display text-4xl text-ink">
              Follow Berry Clothing on Facebook for new arrivals, offers, and latest updates.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/65">
              Stay close to the brand on Facebook for fresh product drops, seasonal promotions, and the updates customers trust before they shop.
            </p>
            <a
              href={berryFacebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles("primary", "mt-6")}
            >
              Follow on Facebook
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Follow us on Facebook" value="Daily" helpText="See the latest Berry updates first" />
            <StatCard label="New arrivals updates" value="Fresh" helpText="Catch every new collection launch" />
            <StatCard label="Offers and promotions" value="Active" helpText="Stay ready for limited-time deals" />
            <StatCard label="Customer reviews" value="Trusted" helpText="Read feedback before you order" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Customer Love"
          title="Trusted by shoppers who first found Berry online"
          description="A warmer testimonial layer that supports the boutique and social-first feel of the refreshed Berry storefront."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-[28px] border border-[#f0d7dc] bg-white/90 p-6 shadow-soft ring-1 ring-white/70">
              <p className="text-berry-600">{Array.from({ length: review.rating }).map(() => "★").join("")}</p>
              <p className="mt-4 text-sm leading-7 text-black/65">&quot;{review.comment}&quot;</p>
              <p className="mt-5 text-sm font-semibold text-ink">{review.customerName}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[36px] border border-[#edd4da] bg-[linear-gradient(135deg,#fff5f6_0%,#fff0ee_60%,#fbefe5_100%)] p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-berry-700">
              Berry Promise
            </p>
            <h2 className="mt-4 font-display text-4xl text-ink">Fashion that feels social, polished, and easy to shop.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/65">
              This refreshed storefront keeps the warm Berry Clothing energy customers already love while giving them a smoother, more elegant way to browse and order.
            </p>
            <p className="mt-4 text-sm font-semibold text-berry-700">{paymentOptionsMessage}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Style Updates" value="Fresh" helpText="New looks presented with a cleaner Berry identity" />
            <StatCard label="Mobile Shopping" value="Smooth" helpText="Responsive browsing across phone, tablet, and desktop" />
            <StatCard label="Flexible Payments" value="Ready" helpText="Built around the checkout options Berry shoppers use most" />
            <StatCard label="Boutique Feel" value="Elevated" helpText="A softer premium finish throughout the public storefront" />
          </div>
        </div>
      </section>

      <LatestFashionVideos />
    </div>
  );
}

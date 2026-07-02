"use client";

import { useEffect, useMemo, useState } from "react";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductColorNames, hasProductColor } from "@/lib/product";

const priceOptions = [
  { label: "All prices", value: "All" },
  { label: "Under Rs. 3,000", value: "under-3000" },
  { label: "Rs. 3,000 - Rs. 5,000", value: "3000-5000" },
  { label: "Above Rs. 5,000", value: "above-5000" }
];

const collectionFilters = ["New Arrivals", "Sale", "Best Sellers"];

export default function ShopPage() {
  const { products: storeProducts, activeCategories } = useCommerceStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [price, setPrice] = useState("All");
  const [sort, setSort] = useState("newest");
  const categoryOptions = useMemo(
    () => ["All", ...activeCategories.map((item) => item.name), ...collectionFilters],
    [activeCategories]
  );
  const colorOptions = useMemo(
    () => ["All", ...new Set(storeProducts.flatMap((product) => getProductColorNames(product.colors)))],
    [storeProducts]
  );

  useEffect(() => {
    const requestedCategory = new URLSearchParams(globalThis.location.search).get("category");
    if (!requestedCategory) {
      return;
    }

    const categoryExists = activeCategories.some((item) => item.name === requestedCategory);
    setCategory(categoryExists ? requestedCategory : "All");
  }, [activeCategories]);

  const products = useMemo(() => {
    const filtered = storeProducts.filter((product) => {
      const productPrice = product.discountPrice ?? product.price;
      const activePrice =
        price === "All"
          ? true
          : price === "under-3000"
            ? productPrice < 3000
            : price === "3000-5000"
              ? productPrice >= 3000 && productPrice <= 5000
              : productPrice > 5000;

      return (
        product.productName.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All" ||
          product.category === category ||
          (category === "New Arrivals" && product.isNewArrival) ||
          (category === "Sale" && product.isSaleItem) ||
          (category === "Best Sellers" && product.isBestSeller)) &&
        (size === "All" || product.sizes.includes(size)) &&
        (color === "All" || hasProductColor(product.colors, color)) &&
        activePrice
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "price-low") return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
      if (sort === "price-high") return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
      if (sort === "best-sellers") return Number(b.isBestSeller) - Number(a.isBestSeller);
      return Number(b.isNewArrival) - Number(a.isNewArrival);
    });
  }, [category, color, price, search, size, sort, storeProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Shop Berry"
        title="Browse the latest ladies' fashion drops"
        description="Filter by category, size, color, and price with a cleaner boutique shopping experience."
      />
      <div className="mt-8 rounded-[24px] border border-[#f3dde2] bg-white p-3 shadow-[0_18px_42px_rgba(23,18,18,0.08)]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                category === option
                  ? "bg-berry-500 text-white shadow-[0_12px_24px_rgba(243,64,120,0.24)]"
                  : "bg-berry-50 text-ink hover:bg-berry-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4 rounded-[24px] border border-[#f3dde2] bg-white p-5 shadow-[0_18px_42px_rgba(23,18,18,0.08)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-berry-700">Refine your edit</p>
            <p className="mt-1 text-sm text-black/60">Out-of-stock pieces are clearly marked and remain visible for reference.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-2xl border border-black/10 bg-[#fff8fa] px-4 py-3 text-sm transition focus:border-berry-300 focus:ring-4 focus:ring-berry-100"
          />
          <select value={size} onChange={(event) => setSize(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#fff8fa] px-4 py-3 text-sm transition focus:border-berry-300 focus:ring-4 focus:ring-berry-100">
            {["All", "XS", "S", "M", "L", "XL"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={color} onChange={(event) => setColor(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[#fff8fa] px-4 py-3 text-sm transition focus:border-berry-300 focus:ring-4 focus:ring-berry-100">
            {colorOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <div className="rounded-[20px] border border-[#f3dde2] bg-[#fff8fa] p-3">
            <p className="mb-2 text-sm font-semibold text-ink">Price range</p>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((option) => {
                const active = price === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrice(option.value)}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition duration-200 ${
                      active
                        ? "bg-berry-500 text-white shadow-[0_10px_22px_rgba(243,64,120,0.22)]"
                        : "bg-white text-black/70 ring-1 ring-black/5 hover:bg-berry-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-[#f3dde2] bg-white p-5 shadow-[0_18px_42px_rgba(23,18,18,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/60">{products.length} products found</p>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-black/10 bg-[#fff8fa] px-4 py-3 text-sm transition focus:border-berry-300 focus:ring-4 focus:ring-berry-100">
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="best-sellers">Best Sellers</option>
            </select>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}

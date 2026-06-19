"use client";

import { useEffect, useMemo, useState } from "react";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductColorNames, hasProductColor } from "@/lib/product";

export default function ShopPage() {
  const { products: storeProducts, activeCategories } = useCommerceStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [price, setPrice] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [sort, setSort] = useState("newest");
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
      const activePrice =
        price === "All"
          ? true
          : price === "Under 5000"
            ? (product.discountPrice ?? product.price) < 5000
            : price === "5000-9000"
              ? (product.discountPrice ?? product.price) >= 5000 &&
                (product.discountPrice ?? product.price) <= 9000
              : (product.discountPrice ?? product.price) > 9000;

      return (
        product.productName.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All" || product.category === category) &&
        (size === "All" || product.sizes.includes(size)) &&
        (color === "All" || hasProductColor(product.colors, color)) &&
        activePrice &&
        (availability === "All" || product.availabilityStatus === availability)
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "price-low") return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
      if (sort === "price-high") return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
      if (sort === "best-sellers") return Number(b.isBestSeller) - Number(a.isBestSeller);
      return Number(b.isNewArrival) - Number(a.isNewArrival);
    });
  }, [availability, category, color, price, search, size, sort, storeProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Shop Berry"
        title="A cleaner way to browse the latest boutique drops"
        description="Mock storefront filters for category, size, color, price, availability, and product search."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-4 rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm">
            <option>All</option>
            {activeCategories.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
          <select value={size} onChange={(event) => setSize(event.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm">
            {["All", "S", "M", "L", "XL"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={color} onChange={(event) => setColor(event.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm">
            {colorOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm">
            {["All", "Under 5000", "5000-9000", "Above 9000"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm">
            {["All", "In Stock", "Low Stock", "Out of Stock"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </aside>

        <div>
          <div className="mb-5 flex flex-col gap-4 rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/60">{products.length} products found</p>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-black/10 px-4 py-3 text-sm">
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

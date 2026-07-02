import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { getProductMainImage, getProductPricing } from "@/lib/product";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const pricing = getProductPricing(product);
  const isOutOfStock = product.availabilityStatus === "Out of Stock";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#f4dde2] bg-white/90 shadow-[0_18px_42px_rgba(23,18,18,0.08)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_58px_rgba(243,64,120,0.16)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#fdf4f5]">
        <ProductImage
          source={getProductMainImage(product)}
          alt={product.productName}
          fallbackLabel={product.productName}
          imageClassName={`transition duration-[350ms] ease-out group-hover:scale-[1.08] ${isOutOfStock ? "grayscale" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isNewArrival ? <Badge>New</Badge> : null}
          {product.isSaleItem ? <Badge tone="warning">Sale</Badge> : null}
          {isOutOfStock ? <Badge tone="danger">Out of Stock</Badge> : null}
        </div>
        {pricing.isDiscounted ? (
          <div className="absolute right-3 top-3 rounded-full bg-[#171212] px-3 py-1 text-xs font-black text-white shadow-soft">
            {pricing.discountPercentage}% OFF
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">{product.category}</p>
            <Link href={`/product/${product.id}`} className="mt-1 block text-base font-semibold leading-snug text-ink transition hover:text-berry-700">
              {product.productName}
            </Link>
          </div>
          {pricing.isDiscounted ? (
            <span className="rounded-full bg-berry-50 px-2.5 py-1 text-[11px] font-semibold text-berry-700">
              Save {pricing.discountPercentage}%
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-berry-700">{formatCurrency(pricing.discountedPrice)}</span>
          {pricing.isDiscounted ? (
            <span className="text-sm text-black/40 line-through">{formatCurrency(pricing.originalPrice)}</span>
          ) : null}
        </div>

        {pricing.isDiscounted ? (
          <p className="mt-1 text-xs font-semibold text-emerald-700">You save {formatCurrency(pricing.savings)}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.04] pt-4">
          <p className="truncate text-sm text-black/55">{product.material}</p>
          {isOutOfStock ? (
            <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
              Out of Stock
            </span>
          ) : (
            <Link
              href={`/product/${product.id}`}
              className={buttonStyles("primary", "px-4 py-2 text-xs shadow-[0_14px_28px_rgba(243,64,120,0.22)]")}
            >
              Buy Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

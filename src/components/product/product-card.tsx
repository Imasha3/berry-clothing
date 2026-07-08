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
    <div className="group flex h-full flex-col overflow-hidden border border-[#f4dde2] bg-white/95 shadow-[0_16px_36px_rgba(23,18,18,0.08)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(243,64,120,0.14)]">
      <div className="relative aspect-[4/4.2] overflow-hidden bg-[#fdf4f5]">
        <ProductImage
          source={getProductMainImage(product)}
          alt={product.productName}
          fallbackLabel={product.productName}
          loading="lazy"
          className="rounded-none"
          imageClassName={`transition duration-[350ms] ease-out group-hover:scale-[1.05] ${isOutOfStock ? "grayscale" : ""}`}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isNewArrival ? <Badge>New</Badge> : null}
          {product.isSaleItem ? <Badge tone="warning">Sale</Badge> : null}
          {isOutOfStock ? <Badge tone="danger">Out of Stock</Badge> : null}
        </div>
        {pricing.isDiscounted ? (
          <div className="absolute right-3 top-3 rounded-full bg-[#171212] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-soft">
            {pricing.discountPercentage}% OFF
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">{product.category}</p>
            <Link href={`/product/${product.id}`} className="mt-1 block text-[14px] font-semibold leading-snug text-ink transition hover:text-berry-700">
              {product.productName}
            </Link>
          </div>
          {pricing.isDiscounted ? (
            <span className="bg-berry-50 px-2 py-1 text-[10px] font-semibold text-berry-700">
              Save {pricing.discountPercentage}%
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-berry-700">{formatCurrency(pricing.discountedPrice)}</span>
          {pricing.isDiscounted ? (
            <span className="text-[12px] text-black/40 line-through">{formatCurrency(pricing.originalPrice)}</span>
          ) : null}
        </div>

        {pricing.isDiscounted ? (
          <p className="mt-1 text-[11px] font-semibold text-emerald-700">You save {formatCurrency(pricing.savings)}</p>
        ) : null}

        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-black/[0.04] pt-2.5">
          <p className="truncate text-[12px] text-black/55">{product.material}</p>
          {isOutOfStock ? (
            <span className="shrink-0 border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600">
              Out of Stock
            </span>
          ) : (
            <Link
              href={`/product/${product.id}`}
              className={buttonStyles("primary", "px-4 py-2 text-[11px] shadow-[0_12px_24px_rgba(243,64,120,0.2)]")}
            >
              Buy Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

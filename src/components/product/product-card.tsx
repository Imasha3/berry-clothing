import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { getProductMainImage, getProductPricing } from "@/lib/product";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const pricing = getProductPricing(product);
  const isOutOfStock = product.availabilityStatus === "Out of Stock";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-none bg-white card-elevated transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <Link
        href={`/product/${product.id}`}
        className="relative block h-[340px] overflow-hidden bg-[#fff8fb] sm:h-[380px] lg:h-[440px]"
      >
        <ProductImage
          source={getProductMainImage(product)}
          alt={product.productName}
          fallbackLabel={product.productName}
          loading="lazy"
          className="h-full w-full"
          imageClassName={`transition duration-[350ms] ease-out group-hover:scale-[1.05] ${
            isOutOfStock ? "grayscale" : ""
          }`}
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isNewArrival && <Badge>New</Badge>}
          {product.isSaleItem && <Badge tone="warning">Sale</Badge>}
          {isOutOfStock && <Badge tone="danger">Out of Stock</Badge>}
        </div>

        {pricing.isDiscounted && (
          <div className="absolute right-3 top-3 rounded-full bg-[#171212] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-soft">
            {pricing.discountPercentage}% OFF
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-black/45">
          {product.category}
        </p>

        <Link
          href={`/product/${product.id}`}
          className="mt-2 block font-display text-[18px] leading-snug text-ink transition hover:text-berry-700"
        >
          {product.productName}
        </Link>

        <div className="mt-auto border-t border-black/5 pt-4">
          {isOutOfStock ? (
            <span className="block w-full rounded-md border border-rose-200 bg-rose-50 py-3 text-center text-sm font-semibold text-rose-600">
              Out of Stock
            </span>
          ) : (
            <Link
              href={`/product/${product.id}`}
              className={buttonStyles(
                "primary",
                "block w-full py-3 text-center text-sm"
              )}
            >
              Buy Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
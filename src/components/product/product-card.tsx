import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import { getProductMainImage } from "@/lib/product";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/5">
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductImage
          source={getProductMainImage(product)}
          alt={product.productName}
          fallbackLabel={product.productName}
          imageClassName="transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {product.isNewArrival ? <Badge>New</Badge> : null}
          {product.isSaleItem ? <Badge tone="warning">Sale</Badge> : null}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">{product.category}</p>
          <Link href={`/product/${product.id}`} className="mt-1 block text-lg font-semibold text-ink">
            {product.productName}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-ink">
            {formatCurrency(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice ? (
            <span className="text-sm text-black/40 line-through">{formatCurrency(product.price)}</span>
          ) : null}
        </div>
        <p className="text-sm text-black/60">{product.material}</p>
      </div>
    </div>
  );
}

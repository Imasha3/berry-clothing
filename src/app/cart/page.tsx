"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthRequiredModal } from "@/components/common/auth-required-modal";
import { EmptyState } from "@/components/common/empty-state";
import { CartSummary } from "@/components/cart/cart-summary";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { buttonStyles } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const { isAuthenticated, isReady } = useCustomerSession();
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Your Cart</h1>
        <p className="mt-3 text-sm text-black/60">Review your selected items before checkout.</p>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="Your cart is still empty"
          description="Add products from the shop to test the mock checkout flow."
          ctaLabel="Continue Shopping"
          ctaHref="/shop"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="grid gap-4 rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5 sm:grid-cols-[110px_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-3xl">
                  <ProductImage source={item.image} alt={item.productName} fallbackLabel={item.productName} />
                </div>
                <div>
                  <p className="font-semibold text-ink">{item.productName}</p>
                  <p className="mt-2 text-sm text-black/60">
                    {item.size} / {item.color}
                  </p>
                  <p className="mt-2 text-sm text-black/60">SKU: {item.sku}</p>
                  <p className="mt-2 font-semibold text-ink">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center rounded-full border border-black/10">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="px-4 py-2"
                    >
                      -
                    </button>
                    <span className="min-w-12 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="px-4 py-2"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-sm text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <CartSummary subtotal={subtotal} />
            {isReady && isAuthenticated ? (
              <Link href="/checkout" className={buttonStyles("primary", "w-full")}>
                Proceed to Checkout
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthRequired(true)}
                className={buttonStyles("primary", "w-full")}
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      )}
      <AuthRequiredModal
        open={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
        redirectTo="/checkout"
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";
import { AuthRequiredModal } from "@/components/common/auth-required-modal";
import { ProductImage } from "@/components/product/product-image";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductImageSources, getProductMainImage, getProductPricing } from "@/lib/product";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isReady: storeReady, products, updateProduct } = useCommerceStore();
  const { addItem } = useCart();
  const { isAuthenticated, isReady, customer } = useCustomerSession();
  const product = products.find((item) => item.id === id);
  const productImages = product ? getProductImageSources(product) : [];
  const pricing = product ? getProductPricing(product) : null;
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(product?.featuredReview?.rating ?? 5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  if (!storeReady) {
    return null;
  }

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.availabilityStatus === "Out of Stock";

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    if (!isReady || !isAuthenticated) {
      setShowAuthRequired(true);
      return;
    }

    addItem({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      return;
    }

    if (!isReady || !isAuthenticated) {
      setShowAuthRequired(true);
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  const handleSubmitFeedback = async () => {
    if (!isReady || !isAuthenticated || !customer) {
      setShowAuthRequired(true);
      return;
    }

    if (!feedbackComment.trim()) {
      setFeedbackError("Please enter your feedback comment.");
      setFeedbackMessage("");
      return;
    }

    await updateProduct(product.id, {
      ...product,
      featuredReview: {
        id: `review-${Date.now()}`,
        customerName: customer.name,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
        approved: true
      }
    });

    setFeedbackError("");
    setFeedbackMessage("Feedback submitted successfully.");
    setFeedbackComment("");
    setFeedbackRating(5);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {(productImages.length > 0 ? productImages : [null]).map((image, index) => (
            <div
              key={image?.previewUrl || image?.url || `placeholder-${index}`}
              className="relative h-[320px] overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/5 sm:h-[380px] lg:h-[440px]"
            >
              <ProductImage
                source={image}
                alt={image?.alt || product.productName}
                fallbackLabel={product.productName}
                className="h-full w-full"
              />
              {image && getProductMainImage(product) === (image.previewUrl || image.url) ? (
                <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                  Main
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {product.isNewArrival ? <Badge>New Arrival</Badge> : null}
            {product.isBestSeller ? <Badge tone="success">Best Seller</Badge> : null}
            {product.isSaleItem ? <Badge tone="warning">Sale</Badge> : null}
            {isOutOfStock ? <Badge tone="danger">Out of Stock</Badge> : null}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-black/45">{product.category}</p>
            <h1 className="mt-2 font-display text-4xl text-ink">{product.productName}</h1>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-semibold text-berry-700">
                {formatCurrency(pricing?.discountedPrice ?? product.price)}
              </span>
              {pricing?.isDiscounted ? (
                <>
                  <span className="text-base text-black/40 line-through">{formatCurrency(pricing.originalPrice)}</span>
                  <span className="rounded-full bg-[#171212] px-3 py-1 text-xs font-black text-white">
                    {pricing.discountPercentage}% OFF
                  </span>
                </>
              ) : null}
            </div>
            {pricing?.isDiscounted ? (
              <span className="block text-sm font-semibold text-emerald-700">
                You Save {formatCurrency(pricing.savings)}
              </span>
            ) : null}
          </div>
          <p className="leading-7 text-black/65">{product.description}</p>
          <div className="rounded-[28px] border border-[#f3dde2] bg-white p-5 shadow-[0_18px_42px_rgba(23,18,18,0.08)]">
            <div>
              <p className="text-sm font-semibold text-ink">Select Size</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-4 py-2 text-sm transition ${selectedSize === size ? "bg-berry-500 text-white shadow-[0_12px_24px_rgba(243,64,120,0.22)]" : "bg-berry-50 text-ink hover:bg-berry-100"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Select Color</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`rounded-full px-4 py-2 text-sm transition ${selectedColor === color.name ? "bg-ink text-white" : "bg-black/5 text-ink hover:bg-black/10"}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: color.code || "#f6d7d4" }}
                      />
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Quantity</p>
              <div className="mt-3 flex w-fit items-center rounded-full border border-black/10 bg-[#fff8fa]">
                <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="px-4 py-2 text-lg text-ink">
                  -
                </button>
                <span className="min-w-12 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((current) => current + 1)} className="px-4 py-2 text-lg text-ink">
                  +
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-black/65 sm:grid-cols-2">
              <p className={isOutOfStock ? "font-semibold text-rose-600" : ""}>Stock status: {product.availabilityStatus}</p>
              <p>Material: {product.material}</p>
            </div>
            <Link href="/size-guide" className="mt-4 inline-block text-sm font-semibold text-berry-600">
              View size guide
            </Link>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button onClick={handleAddToCart} disabled={isOutOfStock} className={isOutOfStock ? "cursor-not-allowed opacity-55" : ""}>
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button onClick={handleBuyNow} variant="dark" disabled={isOutOfStock} className={isOutOfStock ? "cursor-not-allowed opacity-55" : ""}>
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-berry-700">Customer Feedback</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Share your review</h2>
          <p className="mt-3 text-sm leading-7 text-black/60">
            Add your comment and star rating to help other Berry Clothing shoppers.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, index) => {
              const starValue = index + 1;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setFeedbackRating(starValue)}
                  className={`rounded-full px-4 py-2 text-lg ${
                    feedbackRating >= starValue ? "bg-berry-500 text-white" : "bg-berry-50 text-berry-700"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
          <textarea
            value={feedbackComment}
            onChange={(event) => setFeedbackComment(event.target.value)}
            placeholder="Write your feedback here"
            className="mt-5 min-h-32 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
          {feedbackError ? <p className="mt-3 text-sm text-rose-600">{feedbackError}</p> : null}
          {feedbackMessage ? <p className="mt-3 text-sm text-emerald-600">{feedbackMessage}</p> : null}
          <div className="mt-5">
            <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-berry-700">Latest Review</p>
          {product.featuredReview ? (
            <div className="mt-4 rounded-[24px] bg-[#fff5f4] p-5">
              <p className="text-berry-600">{Array.from({ length: product.featuredReview.rating }).map(() => "★").join("")}</p>
              <p className="mt-4 text-sm leading-7 text-black/65">&quot;{product.featuredReview.comment}&quot;</p>
              <p className="mt-4 text-sm font-semibold text-ink">{product.featuredReview.customerName}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/60">
              No customer feedback yet. Be the first to leave a comment and star rating.
            </div>
          )}
        </div>
      </div>
      <AuthRequiredModal
        open={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
        redirectTo={`/product/${product.id}`}
      />
    </div>
  );
}

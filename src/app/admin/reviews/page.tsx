"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";

export default function AdminReviewsPage() {
  const { products } = useCommerceStore();
  const reviews = products
    .map((product) => ({
      product: product.productName,
      review: product.featuredReview
    }))
    .filter((entry) => entry.review);

  return (
    <AdminPage
      eyebrow="Reputation"
      title="Reviews"
      description="Approve, reject, and manage testimonials before they appear on the storefront."
    >
      <div className="space-y-4">
        {reviews.map((entry) => (
          <div key={entry.review?.id} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="font-semibold text-ink">{entry.product}</p>
            <p className="mt-3 text-sm text-black/60">{entry.review?.comment}</p>
            <div className="mt-4 flex gap-3 text-sm">
              <button className="text-emerald-600">Approve</button>
              <button className="text-rose-600">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

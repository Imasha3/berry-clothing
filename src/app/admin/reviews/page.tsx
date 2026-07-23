"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useConfirm, useToast } from "@/components/providers/dialog-provider";

export default function AdminReviewsPage() {
  const { products, updateProduct } = useCommerceStore();
  const confirm = useConfirm();
  const toast = useToast();

  const reviews = products
    .map((product) => ({
      productId: product.id,
      productName: product.productName,
      review: product.featuredReview,
      productObj: product
    }))
    .filter((entry) => entry.review);

  const handleApprove = async (productId: string, product: any, review: any) => {
    try {
      await updateProduct(productId, {
        ...product,
        featuredReview: {
          ...review,
          approved: true
        }
      });
      toast.success("✅ Review approved successfully.");
    } catch (err: any) {
      toast.error("❌ Failed to approve review.");
    }
  };

  const handleReject = async (productId: string, product: any, review: any) => {
    const confirmed = await confirm({
      title: "Reject Review",
      message: "Are you sure you want to reject this review? It will be hidden from customer-facing displays.",
      confirmText: "Reject",
      type: "danger"
    });
    if (confirmed) {
      try {
        await updateProduct(productId, {
          ...product,
          featuredReview: {
            ...review,
            approved: false
          }
        });
        toast.success("✅ Review rejected successfully.");
      } catch (err: any) {
        toast.error("❌ Failed to reject review.");
      }
    }
  };

  return (
    <AdminPage
      eyebrow="Reputation"
      title="Reviews"
      description="Approve, reject, and manage testimonials before they appear on the storefront."
    >
      <div className="space-y-4">
        {reviews.map((entry) => (
          <div key={entry.review?.id} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-ink">{entry.productName}</p>
                <p className="text-xs text-black/45 mt-0.5">
                  By {entry.review?.customerName} • {entry.review ? "★".repeat(entry.review.rating) : ""}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                entry.review?.approved
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
              }`}>
                {entry.review?.approved ? "Approved" : "Rejected"}
              </span>
            </div>
            <p className="mt-3 text-sm text-black/60 italic">"{entry.review?.comment}"</p>
            <div className="mt-4 flex gap-3 text-sm">
              <button
                onClick={() => handleApprove(entry.productId, entry.productObj, entry.review)}
                disabled={entry.review?.approved === true}
                className="text-emerald-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(entry.productId, entry.productObj, entry.review)}
                disabled={entry.review?.approved === false}
                className="text-rose-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

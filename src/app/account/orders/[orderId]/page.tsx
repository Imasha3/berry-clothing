"use client";

import { notFound, useParams } from "next/navigation";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { isReady, orders } = useCommerceStore();

  if (!isReady) {
    return null;
  }

  const order = orders.find((item) => item.id === params.orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Order {order.id}</h1>
        <p className="mt-3 text-sm text-black/60">Placed on {formatDate(order.createdAt)}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">Status</p>
            <p className="mt-2">{order.status}</p>
            <p className="mt-4 font-semibold text-ink">Delivery Status</p>
            <p className="mt-2">{order.deliveryStatus}</p>
            <p className="mt-4 font-semibold text-ink">Estimated Delivery</p>
            <p className="mt-2">{order.estimatedDeliveryTime}</p>
            <p className="mt-4 font-semibold text-ink">Tracking</p>
            <p className="mt-2">{order.trackingNumber ?? "Will appear after dispatch"}</p>
          </div>
          <div className="rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">Payment</p>
            <p className="mt-2">{order.paymentMethod}</p>
            <p className="mt-4 font-semibold text-ink">Payment Status</p>
            <p className="mt-2">{order.paymentStatus}</p>
            <p className="mt-4 font-semibold text-ink">Invoice</p>
            <p className="mt-2">{order.invoice.invoiceId}</p>
            <p className="mt-4 font-semibold text-ink">Total</p>
            <p className="mt-2">{formatCurrency(order.total)}</p>
          </div>
        </div>
      </div>
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h2 className="font-display text-3xl text-ink">Ordered Products</h2>
        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="rounded-[24px] border border-black/8 p-4 text-sm text-black/60">
              <p className="font-semibold text-ink">{item.productName}</p>
              <p className="mt-2">
                {item.size} / {item.color} / Qty {item.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface StoredOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  deliveryFee: number;
  total: number;
  status: string;
  deliveryStatus: string;
  estimatedDeliveryTime: string;
  paymentMethod: string;
  paymentStatus?: string;
  transactionId?: string;
  paidAt?: string;
  receiptFileName?: string;
  receiptPreviewUrl?: string;
  items: Array<{
    productName: string;
    size: string;
    color: string;
    quantity: number;
  }>;
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const stored = globalThis.localStorage.getItem("berry-last-order");
    if (stored) {
      setOrder(JSON.parse(stored) as StoredOrder);
    }
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-white p-8 shadow-soft ring-1 ring-black/5">
          <h1 className="font-display text-4xl text-ink">Order Confirmation</h1>
          <p className="mt-4 text-sm text-black/60">
            No recent order was found in local storage. Place an order through checkout first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-berry-700">Order Confirmed</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Thank you for shopping with Berry Clothing</h1>
        <p className="mt-4 text-sm leading-7 text-black/65">
          Your order has been placed successfully. Payment updates, delivery milestones, and confirmation records are now ready to support live integration.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">Order ID</p>
            <p className="mt-2">{order.id}</p>
            <p className="mt-4 font-semibold text-ink">Status</p>
            <p className="mt-2">{order.status}</p>
            <p className="mt-4 font-semibold text-ink">Delivery</p>
            <p className="mt-2">{order.deliveryStatus}</p>
            <p className="mt-2">{order.estimatedDeliveryTime}</p>
          </div>
          <div className="rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">Customer Details</p>
            <p className="mt-2">{order.customerName}</p>
            <p>{order.phone}</p>
            <p>{order.email}</p>
            <p className="mt-2">{order.address}</p>
            <p>{order.city}</p>
            <p className="mt-4 font-semibold text-ink">Payment</p>
            <p className="mt-2">{order.paymentMethod}</p>
            <p>{order.paymentStatus}</p>
            {order.transactionId ? <p className="mt-2">Transaction ID: {order.transactionId}</p> : null}
            {order.paidAt ? <p>Paid on: {order.paidAt}</p> : null}
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
          <p className="font-semibold text-ink">Invoice Summary</p>
          <p className="mt-2">Delivery Fee: {formatCurrency(order.deliveryFee)}</p>
          <p className="mt-2 font-semibold text-ink">Total: {formatCurrency(order.total)}</p>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-2xl text-ink">Ordered Products</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={`${item.productName}-${item.size}-${item.color}`} className="rounded-[24px] border border-black/8 p-4 text-sm text-black/65">
                <p className="font-semibold text-ink">{item.productName}</p>
                <p className="mt-2">
                  {item.size} / {item.color} / Qty {item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/track-order" className={buttonStyles()}>
            Track Order
          </Link>
          <Link href="/account/orders" className={buttonStyles("secondary")}>
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

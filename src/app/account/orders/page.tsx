 "use client";

import Link from "next/link";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountOrdersPage() {
  const { orders: storeOrders } = useCommerceStore();
  const { customer } = useCustomerSession();
  if (!customer) {
    return null;
  }

  const orders = storeOrders.filter((order) => order.customerId === customer.id);

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Order History</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-[24px] border border-black/8 p-5 transition hover:border-berry-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-ink">{order.id}</p>
              <p className="text-sm text-black/55">{formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-black/60">
              <span>Status: {order.status}</span>
              <span>Delivery: {order.deliveryStatus}</span>
              <span>Payment: {order.paymentMethod}</span>
              <span>Total: {formatCurrency(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

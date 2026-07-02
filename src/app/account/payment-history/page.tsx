"use client";

import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPaymentHistoryPage() {
  const { orders } = useCommerceStore();
  const { customer } = useCustomerSession();
  const router = useRouter();

  const customerOrders = customer ? orders.filter((order) => order.customerId === customer.id) : [];
  const hasPurchases = customerOrders.length > 0;

  useEffect(() => {
    if (customer && !hasPurchases) {
      router.replace("/account");
    }
  }, [customer, hasPurchases, router]);

  if (!customer || !hasPurchases) {
    return null;
  }

  // Construct payment list dynamically from the customer's actual orders
  const payments = customerOrders.map((order) => ({
    id: `pay-${order.id}`,
    orderId: order.id,
    method: order.paymentMethod,
    status: order.paymentStatus,
    amount: order.total,
    createdAt: order.createdAt
  }));

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Payment History</h1>
      <div className="mt-6 space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="rounded-[24px] border border-black/8 p-5 text-sm text-black/65">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-ink">{payment.orderId}</p>
              <p>{formatDate(payment.createdAt)}</p>
            </div>
            <p className="mt-2">Method: {payment.method}</p>
            <p className="mt-2">Status: {payment.status}</p>
            <p className="mt-2">Amount: {formatCurrency(payment.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

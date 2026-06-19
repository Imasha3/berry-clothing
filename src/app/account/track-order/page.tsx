"use client";

import { useMemo, useState } from "react";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { orderWorkflow } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function AccountTrackOrderPage() {
  const { orders } = useCommerceStore();
  const { customer } = useCustomerSession();
  const customerOrders = orders.filter((item) => item.customerId === customer?.id);
  const [orderId, setOrderId] = useState(customerOrders[0]?.id ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");

  if (!customer) {
    return null;
  }

  const order = useMemo(
    () =>
      customerOrders.find(
        (item) => item.id.toLowerCase() === orderId.toLowerCase() && item.phone === phone
      ),
    [customerOrders, orderId, phone]
  );

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Track My Order</h1>
      <p className="mt-3 text-sm text-black/60">
        Order tracking is available inside the logged-in customer area using your order ID and phone number.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          placeholder="Order ID"
          className="rounded-2xl border border-black/10 px-4 py-3"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone Number"
          className="rounded-2xl border border-black/10 px-4 py-3"
        />
      </div>
      {order ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">{order.id}</p>
            <p className="mt-2">Placed on {formatDate(order.createdAt)}</p>
            <p className="mt-2">Current status: {order.status}</p>
            <p className="mt-2">Delivery to: {order.address}</p>
          </div>
          <div className="grid gap-3">
            {orderWorkflow.map((status, index) => {
              const active = orderWorkflow.indexOf(order.status) >= index;
              return (
                <div
                  key={status}
                  className={`rounded-[20px] px-4 py-3 text-sm ${active ? "bg-berry-500 text-white" : "bg-black/5 text-black/55"}`}
                >
                  {status}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-rose-600">
          No matching order was found in this account for that order ID and phone number.
        </p>
      )}
    </div>
  );
}

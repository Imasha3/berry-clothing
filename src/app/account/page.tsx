"use client";

import Link from "next/link";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { buttonStyles } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function AccountOverviewPage() {
  const { orders } = useCommerceStore();
  const { customer, logout } = useCustomerSession();
  if (!customer) {
    return null;
  }

  const customerOrders = orders.filter((order) => order.customerId === customer.id);
  const totalSpending = customerOrders.reduce((sum, order) => sum + order.total, 0);

  const cards = [
    {
      title: "My Profile",
      description: "Update personal details and customer contact information.",
      href: "/account/profile"
    },
    {
      title: "My Orders",
      description: `View ${customerOrders.length} order record(s), invoices, and status history.`,
      href: "/account/orders"
    },
    {
      title: "Payment History",
      description: "Review COD, bank deposit, and card payment activity.",
      href: "/account/payment-history"
    },
    {
      title: "Delivery Addresses",
      description: `Manage ${customer.addresses.length} saved delivery address(es).`,
      href: "/account/delivery-addresses"
    },
    {
      title: "Return Requests",
      description: "Track return approvals and processing states.",
      href: "/account/return-requests"
    },
    {
      title: "Exchange Requests",
      description: "Track exchange approvals and size-change requests.",
      href: "/account/exchange-requests"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Welcome back, {customer.name}</h1>
        <p className="mt-3 text-sm text-black/60">
          Review your current Berry Clothing customer details, orders, and account activity from one place.
        </p>
        <div className="mt-5 grid gap-3 text-sm text-black/65 sm:grid-cols-2">
          <p>Email: {customer.email}</p>
          <p>Phone: {customer.phone}</p>
          <p>City: {customer.city}</p>
          <p>Address: {customer.address}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-berry-200"
          >
            <p className="font-display text-2xl text-ink">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-black/60">{card.description}</p>
          </Link>
        ))}
        <button
          onClick={logout}
          className="rounded-[28px] bg-[#171212] p-6 text-left text-white shadow-soft transition hover:bg-black"
        >
          <p className="font-display text-2xl">Logout</p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Clear the mock customer session and return to the public shopping experience.
          </p>
        </button>
      </div>
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-ink">Account Snapshot</h2>
            <p className="mt-3 text-sm text-black/60">
              Total orders: {customerOrders.length} | Total spending: {formatCurrency(totalSpending)}
            </p>
          </div>
          <Link href="/account/orders" className={buttonStyles("secondary")}>
            View All Orders
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-[#fff5f4] p-4 text-sm text-black/60">
            <p className="font-semibold text-ink">Notifications</p>
            <p className="mt-2">{customer.notifications.length} items</p>
          </div>
          <div className="rounded-[24px] bg-[#fff5f4] p-4 text-sm text-black/60">
            <p className="font-semibold text-ink">Payment Methods Used</p>
            <p className="mt-2">COD, Deposit, Card</p>
          </div>
          <div className="rounded-[24px] bg-[#fff5f4] p-4 text-sm text-black/60">
            <p className="font-semibold text-ink">Return Requests</p>
            <p className="mt-2">{customer.returnRequests.length} active</p>
          </div>
          <div className="rounded-[24px] bg-[#fff5f4] p-4 text-sm text-black/60">
            <p className="font-semibold text-ink">Exchange Requests</p>
            <p className="mt-2">{customer.exchangeRequests.length} active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

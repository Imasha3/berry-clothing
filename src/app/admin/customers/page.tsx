 "use client";

import { AdminPage } from "@/components/admin/admin-page";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { customers } = useCommerceStore();
  return (
    <AdminPage
      eyebrow="Relationships"
      title="Customers"
      description="Customer list with lifetime value, order history summary, and contact data."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
            <p className="font-semibold text-ink">{customer.name}</p>
            <p className="mt-2 text-sm text-black/60">{customer.email}</p>
            <p className="mt-2 text-sm text-black/60">{customer.phone}</p>
            <p className="mt-4 text-sm text-black/60">Orders: {customer.totalOrders}</p>
            <p className="mt-2 text-sm text-black/60">Spent: {formatCurrency(customer.totalSpending)}</p>
            <p className="mt-2 text-sm text-black/60">Joined: {formatDate(customer.joinedAt)}</p>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

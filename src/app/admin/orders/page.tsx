 "use client";

import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { orders } = useCommerceStore();
  return (
    <AdminPage
      eyebrow="Fulfillment"
      title="Orders"
      description="Order management with workflow status, courier assignment, tracking data, payment state, and invoice-ready records."
    >
      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fff6f5]">
            <tr>
              {["Order ID", "Customer", "Status", "Delivery", "Payment", "Date", "Total", "Action"].map((head) => (
                <th key={head} className="px-4 py-4 font-semibold text-ink">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-black/8">
                <td className="px-4 py-4">{order.id}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-ink">{order.customerName}</p>
                  <p className="text-xs text-black/50">{order.city}</p>
                </td>
                <td className="px-4 py-4">{order.status}</td>
                <td className="px-4 py-4">
                  <p>{order.deliveryStatus}</p>
                  <p className="text-xs text-black/50">{order.estimatedDeliveryTime}</p>
                </td>
                <td className="px-4 py-4">
                  <p>{order.paymentMethod}</p>
                  <p className="text-xs text-black/50">{order.paymentStatus}</p>
                </td>
                <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-4">{formatCurrency(order.total)}</td>
                <td className="px-4 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-berry-600">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}

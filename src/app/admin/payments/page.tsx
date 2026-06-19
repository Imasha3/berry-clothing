"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { orders, paymentReceipts } = useCommerceStore();

  return (
    <AdminPage
      eyebrow="Finance"
      title="Payments"
      description="Review payment methods, manual verification queue, and uploaded payment receipts."
    >
      <PermissionGuard
        permission="payments.view"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            This account does not have permission to view payments.
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
              Verification Queue
            </p>
            <div className="mt-5 space-y-3">
              {orders
                .filter((order) => order.paymentStatus === "Pending")
                .slice(0, 6)
                .map((order) => (
                  <div key={order.id} className="rounded-[20px] bg-[#fcf6f2] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink">{order.id}</p>
                      <Badge tone="warning">Pending</Badge>
                    </div>
                    <p className="mt-2 text-sm text-black/60">{order.customerName}</p>
                    <p className="mt-1 text-sm text-black/60">{order.paymentMethod}</p>
                    <p className="mt-1 text-sm text-black/60">{formatCurrency(order.total)}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
              Uploaded Receipts
            </p>
            <div className="mt-5 overflow-hidden rounded-[20px] border border-black/8">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-3 bg-[#fcf6f2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
                <p>Receipt</p>
                <p>Order</p>
                <p>Customer</p>
                <p>Status</p>
                <p>Uploaded</p>
              </div>
              {paymentReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-3 border-t border-black/5 px-4 py-4 text-sm"
                >
                  <p className="font-semibold text-ink">{receipt.fileName}</p>
                  <p className="text-black/60">{receipt.orderId}</p>
                  <p className="text-black/60">{receipt.customerId}</p>
                  <Badge tone={receipt.status === "Verified" ? "success" : "warning"}>
                    {receipt.status}
                  </Badge>
                  <p className="text-black/60">{formatDate(receipt.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

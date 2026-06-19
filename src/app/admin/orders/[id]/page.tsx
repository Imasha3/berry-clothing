"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Button } from "@/components/ui/button";
import { mockDeliverySettings } from "@/data/mockBusiness";
import { orderWorkflow } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order";

const deliveryStatusOptions: DeliveryStatus[] = [
  "Pending",
  "Ready for Dispatch",
  "Dispatched",
  "Out for Delivery",
  "Delivered"
];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders } = useCommerceStore();
  const order = orders.find((item) => item.id === id);
  const [status, setStatus] = useState(order?.status ?? "Pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order?.paymentStatus ?? "Pending");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(order?.deliveryStatus ?? "Pending");
  const [courier, setCourier] = useState(order?.courierService ?? mockDeliverySettings.couriers[0]);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber ?? "");

  if (!order) notFound();

  return (
    <AdminPage
      eyebrow="Fulfillment"
      title={`Order ${order.id}`}
      description="Order management with customer delivery data, status progression, courier assignment, tracking, payment review, and invoice controls."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{order.customerName}</p>
                <p className="mt-2 text-sm text-black/60">{formatDate(order.createdAt)}</p>
              </div>
              <PermissionGuard permission="orders.update">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as OrderStatus)}
                    className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
                  >
                    {orderWorkflow.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                  <Button>Status Update</Button>
                </div>
              </PermissionGuard>
            </div>
            <div className="mt-6 grid gap-3">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="rounded-[20px] bg-[#fff6f5] p-4 text-sm">
                  <p className="font-semibold text-ink">{item.productName}</p>
                  <p className="mt-2 text-black/60">
                    SKU {item.sku} / {item.size} / {item.color} / Qty {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Invoice View</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-black/65">
              <div className="rounded-[24px] bg-[#fff6f5] p-5">
                <p className="font-semibold text-ink">Invoice ID</p>
                <p className="mt-2">{order.invoice.invoiceId}</p>
                <p className="mt-4 font-semibold text-ink">Generated</p>
                <p className="mt-2">{formatDate(order.invoice.generatedAt)}</p>
              </div>
              <div className="rounded-[24px] bg-[#fff6f5] p-5">
                <p className="font-semibold text-ink">Amounts</p>
                <p className="mt-2">Subtotal: {formatCurrency(order.subtotal)}</p>
                <p className="mt-2">Delivery Fee: {formatCurrency(order.deliveryFee)}</p>
                <p className="mt-2 font-semibold text-ink">Total: {formatCurrency(order.total)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary">Print Invoice</Button>
              <Button variant="secondary">Download Invoice</Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 text-sm text-black/65">
            <p className="font-semibold text-ink">Delivery Details</p>
            <p className="mt-3">{order.address}</p>
            <p>{order.city}</p>
            <p className="mt-2">{order.phone}</p>
            <p>{order.email}</p>
            <p className="mt-4 font-semibold text-ink">Estimated delivery time</p>
            <p className="mt-2">{order.estimatedDeliveryTime}</p>
            <p className="mt-4 font-semibold text-ink">Delivery fee</p>
            <p className="mt-2">{formatCurrency(order.deliveryFee)}</p>
            <div className="mt-4 space-y-3">
              <select
                value={deliveryStatus}
                onChange={(event) => setDeliveryStatus(event.target.value as DeliveryStatus)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
              >
                {deliveryStatusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={courier}
                onChange={(event) => setCourier(event.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
              >
                {mockDeliverySettings.couriers.map((courierOption: string) => (
                  <option key={courierOption}>{courierOption}</option>
                ))}
              </select>
              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Courier tracking number"
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 text-sm text-black/65">
            <p className="font-semibold text-ink">Payment Details</p>
            <p className="mt-3">Method: {order.paymentMethod}</p>
            <p className="mt-2">Status: {paymentStatus}</p>
            <p className="mt-2">Transaction ID: {order.transactionId ?? "Generated after gateway connection"}</p>
            <p className="mt-2">Paid date: {order.paidAt ? formatDate(order.paidAt) : "Not paid yet"}</p>
            <div className="mt-4 space-y-2">
              {order.paymentTimeline.map((event) => (
                <div key={event.id} className="rounded-[20px] bg-[#fff6f5] px-4 py-3">
                  <p className="font-medium text-ink">{event.label}</p>
                  <p className="mt-1 text-xs text-black/50">{formatDate(event.createdAt)}</p>
                </div>
              ))}
            </div>
            {order.paymentMethod === "Bank Deposit" ? (
              <>
                <p className="mt-4">Receipt: {order.receiptFileName ?? "Receipt uploaded"}</p>
                {order.receiptPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.receiptPreviewUrl}
                    alt={order.receiptFileName ?? "Receipt preview"}
                    className="mt-4 h-40 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="mt-4 rounded-2xl bg-black/5 p-5">Receipt image preview placeholder</div>
                )}
              </>
            ) : null}
            <PermissionGuard permission="payments.verify">
              <div className="mt-4 flex flex-wrap gap-3">
                {order.paymentMethod === "Bank Deposit" ? (
                  <>
                    <Button onClick={() => setPaymentStatus("Paid")}>Verify Receipt</Button>
                    <Button variant="secondary" onClick={() => setPaymentStatus("Failed")}>
                      Reject Receipt
                    </Button>
                  </>
                ) : null}
                {order.paymentMethod === "Online Card Payment" ? (
                  <Button variant="secondary" onClick={() => setPaymentStatus("Refunded")}>
                    Refund Placeholder
                  </Button>
                ) : null}
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

"use client";

import { notFound } from "next/navigation";
import { use, useState, useEffect } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Button } from "@/components/ui/button";
import { mockDeliverySettings } from "@/data/mockBusiness";
import { orderWorkflow } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order";
import { useConfirm, useToast } from "@/components/providers/dialog-provider";

const deliveryStatusOptions: DeliveryStatus[] = [
  "Pending",
  "Ready for Dispatch",
  "Dispatched",
  "Out for Delivery",
  "Delivered"
];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const confirm = useConfirm();
  const toast = useToast();
  const { orders, updateOrder } = useCommerceStore();
  const order = orders.find((item) => item.id === id);

  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("Pending");
  const [courier, setCourier] = useState(mockDeliverySettings.couriers[0]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updating, setUpdating] = useState(false);

  // Sync state with order changes (e.g. initial load or updates from store/db)
  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
      setDeliveryStatus(order.deliveryStatus);
      setCourier(order.courierService ?? mockDeliverySettings.couriers[0]);
      setTrackingNumber(order.trackingNumber ?? "");
    }
  }, [order]);

  if (!order) notFound();

  const handleStatusUpdate = async () => {
    if (status === "Cancelled" && order.status !== "Cancelled") {
      const confirmed = await confirm({
        title: "Cancel Order",
        message: "Are you sure you want to cancel this order? This action cannot be undone.",
        confirmText: "Cancel Order",
        type: "danger"
      });
      if (!confirmed) {
        setStatus(order.status);
        return;
      }
    }

    try {
      setUpdating(true);
      await updateOrder(order.id, {
        status,
        deliveryStatus,
        courierService: courier,
        trackingNumber
      });
      toast.success("✅ Order status updated successfully.");
    } catch (err: any) {
      toast.error("❌ " + (err.message || "Failed to update order status."));
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (nextPaymentStatus: PaymentStatus) => {
    if (nextPaymentStatus === "Failed") {
      const confirmed = await confirm({
        title: "Reject Payment Receipt",
        message: "Are you sure you want to reject this payment receipt? This will set payment status to Failed.",
        confirmText: "Reject",
        type: "danger"
      });
      if (!confirmed) return;
    }

    try {
      setUpdating(true);
      const nowStr = new Date().toISOString();
      await updateOrder(order.id, {
        paymentStatus: nextPaymentStatus,
        paidAt: nextPaymentStatus === "Paid" ? nowStr : undefined,
        paymentTimeline: [
          ...order.paymentTimeline,
          {
            id: `pay-evt-${Date.now()}`,
            label: `Payment status updated to ${nextPaymentStatus}`,
            createdAt: nowStr
          }
        ]
      });
      toast.success(`✅ Payment status updated to ${nextPaymentStatus}.`);
    } catch (err: any) {
      toast.error("❌ " + (err.message || "Failed to update payment status."));
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("❌ Popup blocked! Please allow popups to print the invoice.");
      return;
    }

    const itemsRows = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.sku}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.size} / ${item.color}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">LKR ${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">LKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
      )
      .join("");

    const discountRow = order.discountTotal && order.discountTotal > 0
      ? `<tr>
          <td colspan="5" style="text-align: right; padding: 5px 10px;">Discount:</td>
          <td style="text-align: right; padding: 5px 10px; font-weight: bold; color: #b91c1c;">- LKR ${order.discountTotal.toLocaleString()}</td>
        </tr>`
      : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #171212; line-height: 1.6; padding: 30px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #171212; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; font-family: Georgia, serif; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #fff6f5; padding: 10px; text-align: left; font-weight: bold; font-size: 13px; border-bottom: 2px solid #ddd; }
            .totals { float: right; width: 300px; margin-top: 10px; }
            .totals table { margin-bottom: 0; }
            .footer { text-align: center; font-style: italic; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 50px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">BERRY CLOTHING</div>
              <div style="font-size: 12px; color: #666;">Premium Apparel & Accessories Store</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">INVOICE</h2>
              <div style="font-size: 14px;">Invoice #: ${order.invoice.invoiceId}</div>
            </div>
          </div>
          
          <div class="meta-info">
            <div>
              <div class="section-title">Order Info</div>
              <strong>Order ID:</strong> ${order.id}<br>
              <strong>Order Date:</strong> ${formatDate(order.createdAt)}<br>
              <strong>Order Status:</strong> ${order.status}<br>
              <strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})
            </div>
            <div style="text-align: right;">
              <div class="section-title" style="text-align: right;">Shipping Details</div>
              <strong>Customer:</strong> ${order.customerName}<br>
              <strong>Phone:</strong> ${order.phone}<br>
              <strong>Email:</strong> ${order.email}<br>
              <strong>Address:</strong> ${order.address}, ${order.city}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th style="text-align: center;">Size / Color</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <tr>
                <td colspan="4" style="border-top: 2px solid #ddd;"></td>
                <td style="text-align: right; padding: 15px 10px 5px 10px; border-top: 2px solid #ddd;">Subtotal:</td>
                <td style="text-align: right; padding: 15px 10px 5px 10px; border-top: 2px solid #ddd; font-weight: bold;">LKR ${order.subtotal.toLocaleString()}</td>
              </tr>
              ${discountRow}
              <tr>
                <td colspan="4"></td>
                <td style="text-align: right; padding: 5px 10px;">Delivery Fee:</td>
                <td style="text-align: right; padding: 5px 10px; font-weight: bold;">LKR ${order.deliveryFee.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="4"></td>
                <td style="text-align: right; padding: 5px 10px; border-top: 1px solid #171212; border-bottom: 2px double #171212; font-weight: bold; font-size: 16px;">Total Amount:</td>
                <td style="text-align: right; padding: 5px 10px; border-top: 1px solid #171212; border-bottom: 2px double #171212; font-weight: bold; font-size: 16px;">LKR ${order.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Thank you for shopping with Berry Clothing! We appreciate your business.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownloadInvoice = async () => {
    try {
      const loadJsPDF = () => {
        return new Promise<any>((resolve, reject) => {
          if ((window as any).jspdf) {
            resolve((window as any).jspdf.jsPDF);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = () => {
            resolve((window as any).jspdf.jsPDF);
          };
          script.onerror = () => reject(new Error("Failed to load PDF library"));
          document.body.appendChild(script);
        });
      };

      toast.warning("Generating PDF invoice...");
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();

      // Title & Brand Identity
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(23, 18, 18); // #171212
      doc.text("BERRY CLOTHING", 20, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Premium Apparel & Accessories Store", 20, 30);
      doc.text("Colombo, Sri Lanka | info@berryclothing.com", 20, 35);

      // Line separator
      doc.setDrawColor(230, 230, 230);
      doc.line(20, 42, 190, 42);

      // Invoice info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(23, 18, 18);
      doc.text("INVOICE SUMMARY", 20, 52);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Invoice No: ${order.invoice.invoiceId}`, 20, 60);
      doc.text(`Order Ref: ${order.id}`, 20, 66);
      doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 72);
      doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 20, 78);
      doc.text(`Status: ${order.status}`, 20, 84);

      // Shipping info
      doc.setFont("helvetica", "bold");
      doc.text("SHIPPING DETAILS", 110, 52);

      doc.setFont("helvetica", "normal");
      doc.text(`Customer: ${order.customerName}`, 110, 60);
      doc.text(`Phone: ${order.phone}`, 110, 66);
      doc.text(`Email: ${order.email}`, 110, 72);
      doc.text(`Address: ${order.address}`, 110, 78);
      doc.text(`City: ${order.city}`, 110, 84);

      // Items Table Header
      doc.setFillColor(255, 246, 245); // light pinkish
      doc.rect(20, 95, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(23, 18, 18);
      doc.text("Item Description", 22, 100);
      doc.text("SKU", 95, 100);
      doc.text("Size/Color", 125, 100);
      doc.text("Qty", 155, 100);
      doc.text("Total", 175, 100);

      // Items Table Rows
      let y = 108;
      doc.setFont("helvetica", "normal");
      order.items.forEach((item) => {
        doc.text(item.productName, 22, y);
        doc.text(item.sku, 95, y);
        doc.text(`${item.size} / ${item.color}`, 125, y);
        doc.text(String(item.quantity), 157, y);
        doc.text(`LKR ${(item.price * item.quantity).toLocaleString()}`, 175, y);
        y += 8;
      });

      // Price summary totals
      y += 4;
      doc.line(20, y, 190, y);
      y += 8;
      doc.text("Subtotal:", 130, y);
      doc.text(`LKR ${order.subtotal.toLocaleString()}`, 175, y);

      if (order.discountTotal && order.discountTotal > 0) {
        y += 6;
        doc.text("Discount:", 130, y);
        doc.text(`- LKR ${order.discountTotal.toLocaleString()}`, 175, y);
      }

      y += 6;
      doc.text("Delivery Fee:", 130, y);
      doc.text(`LKR ${order.deliveryFee.toLocaleString()}`, 175, y);

      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Final Total:", 130, y);
      doc.text(`LKR ${order.total.toLocaleString()}`, 175, y);

      // Thank you Footer
      y = 270;
      doc.line(20, y, 190, y);
      y += 8;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for shopping with Berry Clothing! We appreciate your business.", 105, y, { align: "center" });

      doc.save(`Invoice-${order.id}.pdf`);
      toast.success("✅ Invoice PDF downloaded successfully.");
    } catch (err: any) {
      toast.error("❌ " + (err.message || "Failed to download invoice."));
    }
  };

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
                    disabled={updating}
                    className="rounded-2xl border border-black/10 px-4 py-3 text-sm disabled:opacity-50"
                  >
                    {orderWorkflow.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                  <Button onClick={handleStatusUpdate} disabled={updating}>
                    {updating ? "Saving..." : "Status Update"}
                  </Button>
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
                {order.discountTotal && order.discountTotal > 0 ? (
                  <p className="mt-2 text-rose-700">Discount: -{formatCurrency(order.discountTotal)}</p>
                ) : null}
                <p className="mt-2">Delivery Fee: {formatCurrency(order.deliveryFee)}</p>
                <p className="mt-2 font-semibold text-ink">Total: {formatCurrency(order.total)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handlePrintInvoice}>Print Invoice</Button>
              <Button variant="secondary" onClick={handleDownloadInvoice}>Download Invoice</Button>
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
                disabled={updating}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm disabled:opacity-50"
              >
                {deliveryStatusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={courier}
                onChange={(event) => setCourier(event.target.value)}
                disabled={updating}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm disabled:opacity-50"
              >
                {mockDeliverySettings.couriers.map((courierOption: string) => (
                  <option key={courierOption}>{courierOption}</option>
                ))}
              </select>
              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Courier tracking number"
                disabled={updating}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm disabled:opacity-50"
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
                    <Button onClick={() => handlePaymentStatusUpdate("Paid")} disabled={updating}>Verify Receipt</Button>
                    <Button variant="secondary" onClick={() => handlePaymentStatusUpdate("Failed")} disabled={updating}>
                      Reject Receipt
                    </Button>
                  </>
                ) : null}
                {order.paymentMethod === "Online Card Payment" ? (
                  <Button variant="secondary" onClick={() => handlePaymentStatusUpdate("Refunded")} disabled={updating}>
                    Refund Order
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

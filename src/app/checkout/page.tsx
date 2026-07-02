"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthRequiredModal } from "@/components/common/auth-required-modal";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/common/empty-state";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { Button } from "@/components/ui/button";
import { mockDeliverySettings, mockPaymentArchitecture } from "@/data/mockBusiness";
import { mockBankDetails, paymentMethods, paymentOptionsMessage } from "@/lib/constants";
import type { Order, PaymentMethod } from "@/types/order";

interface CardPaymentFormState {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingEmail: string;
  billingPhone: string;
}

interface PaymentAttemptState {
  status: "success" | "failed";
  message: string;
}

function sanitizeStoredOrder(order: Order): Order {
  const isEphemeralPreview = (value?: string) => Boolean(value && value.startsWith("blob:"));

  return {
    ...order,
    receiptPreviewUrl: isEphemeralPreview(order.receiptPreviewUrl) ? undefined : order.receiptPreviewUrl,
    paymentReceipt: order.paymentReceipt
      ? {
          ...order.paymentReceipt,
          previewUrl: isEphemeralPreview(order.paymentReceipt.previewUrl) ? undefined : order.paymentReceipt.previewUrl
        }
      : undefined
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { addOrder } = useCommerceStore();
  const { items, subtotal, originalSubtotal, discountTotal, clearCart } = useCart();
  const { isAuthenticated, customer, isReady } = useCustomerSession();
  const [form, setForm] = useState({
    customerName: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    district: customer?.district ?? "",
    notes: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [receipt, setReceipt] = useState<{ fileName: string; previewUrl?: string; fileType: string } | null>(null);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [cardFields, setCardFields] = useState<CardPaymentFormState>({
    cardholderName: customer?.name ?? "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingEmail: customer?.email ?? "",
    billingPhone: customer?.phone ?? ""
  });
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardPaymentFormState, string>>>({});
  const [paymentAttempt, setPaymentAttempt] = useState<PaymentAttemptState | null>(null);

  useEffect(() => {
    if (!customer) {
      return;
    }

    setForm((current) => ({
      ...current,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      district: customer.district
    }));
    setCardFields((current) => ({
      ...current,
      cardholderName: current.cardholderName || customer.name,
      billingEmail: current.billingEmail || customer.email,
      billingPhone: current.billingPhone || customer.phone
    }));
  }, [customer]);

  const deliveryFee =
    mockDeliverySettings.cityFees.find((item) => item.city === form.city)?.fee ??
    mockDeliverySettings.defaultDeliveryFee;
  const estimatedDeliveryTime =
    mockDeliverySettings.estimatedDeliveryTimes[form.city as keyof typeof mockDeliverySettings.estimatedDeliveryTimes] ??
    mockDeliverySettings.estimatedDeliveryTimes.default;

  const checkoutInformation = useMemo(
    () => ({
      "Cash on Delivery": "Pay with cash when your order is delivered.",
      "Bank Deposit": "Upload your bank deposit receipt so the admin team can verify it.",
      "Online Card Payment":
        "Enter your card details in the secure payment section. Production processing should use a PCI-compliant payment gateway."
    }),
    []
  );

  const validateCardFields = () => {
    const errors: Partial<Record<keyof CardPaymentFormState, string>> = {};
    const cleanedCardNumber = cardFields.cardNumber.replace(/\s+/g, "");
    const cleanedExpiry = cardFields.expiryDate.trim();
    const cleanedCvv = cardFields.cvv.trim();

    if (!cardFields.cardholderName.trim()) {
      errors.cardholderName = "Cardholder name is required.";
    }

    if (!/^\d{16}$/.test(cleanedCardNumber)) {
      errors.cardNumber = "Enter a valid 16-digit card number.";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cleanedExpiry)) {
      errors.expiryDate = "Use MM/YY format.";
    }

    if (!/^\d{3,4}$/.test(cleanedCvv)) {
      errors.cvv = "Enter a valid CVV.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardFields.billingEmail.trim())) {
      errors.billingEmail = "Enter a valid billing email.";
    }

    if (!cardFields.billingPhone.trim()) {
      errors.billingPhone = "Billing phone is required.";
    }

    setCardErrors(errors);
    return { isValid: Object.keys(errors).length === 0, cleanedCardNumber };
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="No items ready for checkout"
          description="Add products to your cart first so we can continue to payment."
          ctaLabel="Go to Shop"
          ctaHref="/shop"
        />
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
          <h1 className="font-display text-4xl text-ink">Checkout</h1>
          <p className="mt-4 text-sm leading-7 text-black/65">
            Please create an account or login before placing an order.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setShowAuthRequired(true)} className="rounded-full bg-berry-500 px-5 py-3 text-sm font-semibold text-white">
              Continue
            </button>
          </div>
        </div>
        <AuthRequiredModal open={showAuthRequired} onClose={() => setShowAuthRequired(false)} redirectTo="/checkout" />
      </div>
    );
  }

  const handleSubmit = () => {
    const orderId = `BC-${Math.floor(10000 + Math.random() * 90000)}`;
    const createdAt = new Date().toISOString();
    let paymentStatus: Order["paymentStatus"] = "Pending";
    let transactionId: string | undefined;
    let paidAt: string | undefined;
    let paymentTimeline: Order["paymentTimeline"] = [
      { id: `pt-${Date.now()}`, label: "Order placed", createdAt }
    ];

    if (paymentMethod === "Bank Deposit" && !receipt) {
      setPaymentAttempt({
        status: "failed",
        message: "Please upload your bank deposit receipt before placing the order."
      });
      return;
    }

    if (paymentMethod === "Online Card Payment") {
      const { isValid, cleanedCardNumber } = validateCardFields();
      if (!isValid) {
        setPaymentAttempt({
          status: "failed",
          message: "Please correct the card details and try again."
        });
        return;
      }

      // Real card payments must go through a PCI-compliant gateway such as PayHere or Stripe.
      // Never persist raw card numbers or CVV values to localStorage, Firestore, or application logs.
      paymentStatus = "Paid";
      transactionId = `TXN-${orderId}-${cleanedCardNumber.slice(-4)}`;
      paidAt = createdAt;
      paymentTimeline = [
        { id: `pt-${Date.now()}`, label: "Order placed", createdAt },
        { id: `pt-${Date.now() + 1}`, label: "Payment integration ready", createdAt },
        { id: `pt-${Date.now() + 2}`, label: "Payment authorized", createdAt }
      ];
      setPaymentAttempt({
        status: "success",
        message: "Payment authorized successfully. Your order will be confirmed with a transaction reference."
      });
    }

    if (paymentMethod === "Cash on Delivery") {
      paymentTimeline = [
        { id: `pt-${Date.now()}`, label: "Order placed", createdAt },
        { id: `pt-${Date.now() + 1}`, label: "Payment pending collection on delivery", createdAt }
      ];
    }

    if (paymentMethod === "Bank Deposit") {
      paymentTimeline = [
        { id: `pt-${Date.now()}`, label: "Order placed", createdAt },
        { id: `pt-${Date.now() + 1}`, label: "Receipt uploaded for verification", createdAt }
      ];
      setPaymentAttempt({
        status: "success",
        message: "Your deposit receipt was attached successfully. The payment team will verify it shortly."
      });
    }

    const lastOrder: Order = {
      id: orderId,
      customerId: customer?.id ?? "cus-1",
      ...form,
      items,
      subtotal,
      originalSubtotal,
      discountTotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: "Pending",
      deliveryStatus: "Pending",
      estimatedDeliveryTime,
      paymentMethod,
      paymentStatus,
      paymentTimeline,
      transactionId,
      paidAt,
      receiptFileName: receipt?.fileName,
      receiptPreviewUrl: receipt?.previewUrl,
      paymentReceipt: receipt
        ? {
            fileName: receipt.fileName,
            fileType: receipt.fileType,
            previewUrl: receipt.previewUrl,
            uploadedAt: createdAt
          }
        : undefined,
      invoice: {
        invoiceId: `INV-${orderId.replace("BC-", "")}`,
        generatedAt: createdAt,
        printable: true,
        downloadable: true
      },
      returnRequestStatus: "Not Requested",
      exchangeRequestStatus: "Not Requested",
      createdAt
    };

    addOrder(lastOrder);
    globalThis.localStorage.setItem("berry-last-order", JSON.stringify(sanitizeStoredOrder(lastOrder)));
    clearCart();
    router.push("/order-confirmation");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Checkout</h1>
        <p className="mt-3 text-sm text-black/60">
          Logged-in customer checkout with delivery pricing, receipt upload, and payment integration-ready card flow.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "customerName", label: "Customer name", type: "text" },
              { key: "phone", label: "Phone number", type: "tel" },
              { key: "email", label: "Email", type: "email" },
              { key: "city", label: "City", type: "text" },
              { key: "district", label: "District", type: "text" }
            ].map((field) => (
              <label key={field.key} className="text-sm text-black/65">
                {field.label}
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
            ))}
            <label className="sm:col-span-2 text-sm text-black/65">
              Delivery address
              <textarea
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                className="mt-2 min-h-28 w-full rounded-2xl border border-black/10 px-4 py-3"
              />
            </label>
            <label className="sm:col-span-2 text-sm text-black/65">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="mt-2 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3"
              />
            </label>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#fff6f6] p-5 text-sm text-black/60">
            <p className="font-semibold text-ink">Delivery Information</p>
            <p className="mt-2">Delivery fee: LKR {deliveryFee}</p>
            <p className="mt-2">Estimated delivery time: {estimatedDeliveryTime}</p>
          </div>

          <div className="mt-8 rounded-[24px] bg-[#fff6f6] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-700">Payment Method</p>
            <div className="mt-4 grid gap-3">
              {paymentMethods.map((method) => (
                <label key={method} className="flex items-start gap-3 rounded-[20px] border border-black/10 bg-white px-4 py-4 text-sm text-black/65">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method}
                    onChange={() => {
                      setPaymentMethod(method);
                      setPaymentAttempt(null);
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-ink">{method}</span>
                    <span className="mt-1 block">{checkoutInformation[method]}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-berry-700">{paymentOptionsMessage}</p>
          </div>

          {paymentMethod === "Bank Deposit" ? (
            <div className="mt-6 rounded-[24px] bg-[#fff6f6] p-5 text-sm text-black/60">
              <p className="font-semibold text-ink">Bank Deposit Instructions</p>
              <div className="mt-3 space-y-2">
                <p>Bank: {mockBankDetails.bankName}</p>
                <p>Account Name: {mockBankDetails.accountName}</p>
                <p>Account Number: {mockBankDetails.accountNumber}</p>
                <p>Branch: {mockBankDetails.branch}</p>
              </div>
              <label className="mt-4 block">
                <span className="font-semibold text-ink">Upload Bank Deposit Receipt</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setReceipt(null);
                      return;
                    }
                    const previewUrl = file.type === "application/pdf" ? undefined : URL.createObjectURL(file);
                    setReceipt({
                      fileName: file.name,
                      previewUrl,
                      fileType: file.type
                    });
                    setPaymentAttempt(null);
                  }}
                  className="mt-3 block w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                />
              </label>
            </div>
          ) : null}

          {paymentMethod === "Online Card Payment" ? (
            <div className="mt-6 rounded-[24px] bg-[#fff6f6] p-5 text-sm text-black/60">
              <p className="font-semibold text-ink">Secure Card Payment</p>
              <p className="mt-2 leading-7">
                Payment integration ready. In production, this section should hand off to PayHere, Stripe, or another PCI-compliant gateway for tokenized card processing.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Cardholder Name", "cardholderName"],
                  ["Card Number", "cardNumber"],
                  ["Expiry Date (MM/YY)", "expiryDate"],
                  ["CVV", "cvv"],
                  ["Billing Email", "billingEmail"],
                  ["Billing Phone", "billingPhone"]
                ].map(([label, key]) => (
                  <label key={key} className="text-sm font-semibold text-ink">
                    {label}
                    <input
                      type={key === "billingEmail" ? "email" : key === "cvv" ? "password" : "text"}
                      inputMode={key === "cardNumber" || key === "cvv" || key === "billingPhone" ? "numeric" : undefined}
                      value={cardFields[key as keyof CardPaymentFormState]}
                      onChange={(event) => {
                        setCardFields((current) => ({ ...current, [key]: event.target.value }));
                        setCardErrors((current) => ({ ...current, [key]: undefined }));
                        setPaymentAttempt(null);
                      }}
                      placeholder={
                        key === "cardNumber"
                          ? "1234123412341234"
                          : key === "expiryDate"
                            ? "MM/YY"
                            : ""
                      }
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal"
                    />
                    {cardErrors[key as keyof CardPaymentFormState] ? (
                      <span className="mt-2 block text-xs font-normal text-rose-700">
                        {cardErrors[key as keyof CardPaymentFormState]}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
              <div className="mt-5 rounded-[20px] bg-white px-4 py-4">
                <p className="font-semibold text-ink">Gateway Preparation</p>
                <div className="mt-3 space-y-3">
                  {mockPaymentArchitecture.map((provider) => (
                    <div key={provider.provider} className="rounded-[18px] bg-[#fff6f6] px-4 py-3">
                      <p className="font-medium text-ink">{provider.provider}</p>
                      <p className="mt-1">{provider.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {paymentAttempt ? (
            <div
              className={`mt-6 rounded-[20px] px-4 py-4 text-sm ${
                paymentAttempt.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {paymentAttempt.message}
            </div>
          ) : null}

          <Button onClick={handleSubmit} className="mt-8">
            {paymentMethod === "Online Card Payment" ? "Pay and Place Order" : "Place Order"}
          </Button>
        </div>
        <CartSummary
          subtotal={subtotal}
          originalSubtotal={originalSubtotal}
          discountTotal={discountTotal}
          deliveryFee={deliveryFee}
        />
      </div>
      <AuthRequiredModal open={showAuthRequired} onClose={() => setShowAuthRequired(false)} redirectTo="/checkout" />
    </div>
  );
}

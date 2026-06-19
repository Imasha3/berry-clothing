"use client";

import { mockPaymentArchitecture } from "@/data/mockBusiness";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { paymentOptionsMessage, mockBankDetails } from "@/lib/constants";

export default function AccountPaymentMethodsPage() {
  const { customer } = useCustomerSession();
  const { orders } = useCommerceStore();
  const customerOrders = orders.filter((order) => order.customerId === customer?.id);
  const lastPaymentMethod = customerOrders[0]?.paymentMethod ?? "Cash on Delivery";

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-4xl text-ink">Payment Methods</h1>
        <p className="mt-3 text-sm text-black/60">{paymentOptionsMessage}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Cash on Delivery", "Bank Deposit", "Online Card Payment"].map((method) => (
          <div key={method} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="font-display text-2xl text-ink">{method}</p>
            <p className="mt-3 text-sm leading-7 text-black/60">
              {method === "Cash on Delivery" && "Pay with cash when your order is delivered."}
              {method === "Bank Deposit" && "Upload your deposit receipt during checkout so the payment team can verify it."}
              {method === "Online Card Payment" && "Payment integration ready for future PayHere, Stripe, Dialog Genie, and Commercial Bank gateway connection."}
            </p>
            {lastPaymentMethod === method ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-berry-600">Last used method</p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h2 className="font-display text-3xl text-ink">Bank Deposit Details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm text-black/65">
          <p>Bank: {mockBankDetails.bankName}</p>
          <p>Account Name: {mockBankDetails.accountName}</p>
          <p>Account Number: {mockBankDetails.accountNumber}</p>
          <p>Branch: {mockBankDetails.branch}</p>
        </div>
      </div>
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h2 className="font-display text-3xl text-ink">Online Card Integration</h2>
        <div className="mt-5 space-y-3">
          {mockPaymentArchitecture.map((provider) => (
            <div key={provider.provider} className="rounded-[24px] bg-[#fff5f4] p-4 text-sm text-black/65">
              <p className="font-semibold text-ink">{provider.provider}</p>
              <p className="mt-2">{provider.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const trackingSteps = [
  { label: "Order Placed", description: "Your order has been successfully placed." },
  { label: "Processing", description: "We are preparing and packing your items." },
  { label: "Shipped", description: "Your order has been dispatched from our boutique." },
  { label: "Out for Delivery", description: "Our courier partner is delivering your order today." },
  { label: "Delivered", description: "Order has been successfully delivered." }
];

function getTrackingStepIndex(status: string): number {
  switch (status) {
    case "Pending":
    case "Confirmed":
      return 0; // Order Placed
    case "Processing":
    case "Packed":
      return 1; // Processing
    case "Dispatched":
      return 2; // Shipped
    case "Out for Delivery":
      return 3; // Out for Delivery
    case "Delivered":
    case "Completed":
      return 4; // Delivered
    default:
      return 0;
  }
}

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

  const activeStep = order ? getTrackingStepIndex(order.status) : 0;

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
        <div className="mt-8 space-y-8">
          <div className="rounded-[24px] bg-[#fff5f4] p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">{order.id}</p>
            <p className="mt-2">Placed on {formatDate(order.createdAt)}</p>
            <p className="mt-2">Current status: <span className="font-semibold text-berry-700">{order.status}</span></p>
            <p className="mt-2">Delivery to: {order.address}</p>
          </div>

          <div className="rounded-[28px] border border-black/5 p-6 md:p-8 bg-white">
            {/* Desktop Stepper */}
            <div className="hidden md:block">
              <div className="relative flex justify-between">
                {/* Background line */}
                <div className="absolute left-[8%] right-[8%] top-5 h-0.5 bg-black/10" />
                {/* Active line */}
                <div
                  className="absolute left-[8%] top-5 h-0.5 bg-berry-600 transition-all duration-500"
                  style={{ width: `${(activeStep / 4) * 84}%` }}
                />
                
                {trackingSteps.map((step, index) => {
                  const isCompleted = index < activeStep;
                  const isActive = index === activeStep;
                  return (
                    <div key={step.label} className="relative flex flex-col items-center flex-1 text-center">
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ring-4 ring-white shadow-sm",
                          isCompleted && "bg-berry-600 text-white",
                          isActive && "bg-berry-700 text-white ring-berry-100",
                          !isCompleted && !isActive && "bg-gray-100 text-gray-400 border border-black/10"
                        )}
                      >
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={cn("mt-3 text-sm font-semibold", isActive ? "text-berry-700 font-bold" : isCompleted ? "text-ink" : "text-black/40")}>
                        {step.label}
                      </p>
                      <p className="mt-1 max-w-[150px] text-xs text-black/40">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Stepper */}
            <div className="space-y-6 md:hidden">
              {trackingSteps.map((step, index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;
                return (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ring-4 ring-white shadow-sm",
                          isCompleted && "bg-berry-600 text-white",
                          isActive && "bg-berry-700 text-white ring-berry-100",
                          !isCompleted && !isActive && "bg-gray-100 text-gray-400 border border-black/10"
                        )}
                      >
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < 4 && (
                        <div className={cn("my-1 w-0.5 grow rounded-full min-h-[40px]", isCompleted ? "bg-berry-600" : "bg-black/10")} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={cn("text-sm font-semibold", isActive ? "text-berry-700 font-bold" : isCompleted ? "text-ink" : "text-black/40")}>
                        {step.label}
                      </p>
                      <p className="mt-1 text-xs text-black/50 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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

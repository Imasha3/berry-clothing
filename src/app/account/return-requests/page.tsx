 "use client";

import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { formatDate } from "@/lib/utils";

export default function AccountReturnRequestsPage() {
  const { customer } = useCustomerSession();
  if (!customer) {
    return null;
  }

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Return Requests</h1>
      <div className="mt-6 space-y-4">
        {customer.returnRequests.map((request) => (
          <div key={request.id} className="rounded-[24px] border border-black/8 p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">{request.orderId}</p>
            <p className="mt-2">Status: {request.status}</p>
            <p className="mt-2">{request.reason}</p>
            <p className="mt-2">{formatDate(request.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

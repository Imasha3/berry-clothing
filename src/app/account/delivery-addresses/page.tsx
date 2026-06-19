 "use client";

import { useCustomerSession } from "@/components/providers/customer-session-provider";

export default function AccountDeliveryAddressesPage() {
  const { customer } = useCustomerSession();
  if (!customer) {
    return null;
  }

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Delivery Addresses</h1>
      <div className="mt-6 space-y-4">
        {customer.addresses.map((address) => (
          <div key={address.id} className="rounded-[24px] border border-black/8 p-5 text-sm text-black/65">
            <p className="font-semibold text-ink">
              {address.label} {address.isDefault ? "(Default)" : ""}
            </p>
            <p className="mt-2">{address.recipientName}</p>
            <p>{address.addressLine}</p>
            <p>
              {address.city}, {address.district}
            </p>
            <p className="mt-2">{address.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

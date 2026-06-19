 "use client";

import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { formatDate } from "@/lib/utils";

export default function AccountNotificationsPage() {
  const { customer } = useCustomerSession();
  if (!customer) {
    return null;
  }

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Notifications</h1>
      <div className="mt-6 space-y-4">
        {customer.notifications.map((notification) => (
          <div key={notification.id} className="rounded-[24px] border border-black/8 p-5 text-sm text-black/65">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-ink">{notification.title}</p>
              <p>{notification.isRead ? "Read" : "Unread"}</p>
            </div>
            <p className="mt-2">{notification.message}</p>
            <p className="mt-2 text-xs text-black/45">{formatDate(notification.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

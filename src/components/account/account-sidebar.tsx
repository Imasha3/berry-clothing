"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerAccountLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { useCustomerSession } from "@/components/providers/customer-session-provider";

export function AccountSidebar() {
  const pathname = usePathname();
  const { orders } = useCommerceStore();
  const { customer } = useCustomerSession();

  const customerOrders = customer ? orders.filter((order) => order.customerId === customer.id) : [];
  const hasPurchases = customerOrders.length > 0;

  const filteredLinks = customerAccountLinks.filter((link) => {
    if (link.href === "/account/payment-history") {
      return hasPurchases;
    }
    return true;
  });

  return (
    <aside className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
      <p className="font-display text-2xl text-ink">My Account</p>
      <div className="mt-5 space-y-2">
        {filteredLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm transition",
              pathname === link.href ? "bg-berry-50 font-semibold text-berry-700" : "text-black/65 hover:bg-black/5"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

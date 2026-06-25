import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AdminSessionProvider } from "@/components/providers/admin-session-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { CommerceStoreProvider } from "@/components/providers/commerce-store-provider";
import { CustomerSessionProvider } from "@/components/providers/customer-session-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Berry Clothing",
  description: "Modern fashion ecommerce storefront and admin system for Berry Clothing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-white font-body text-ink">
        <CommerceStoreProvider>
          <AdminSessionProvider>
            <CustomerSessionProvider>
              <CartProvider>
                <AppShell>{children}</AppShell>
              </CartProvider>
            </CustomerSessionProvider>
          </AdminSessionProvider>
        </CommerceStoreProvider>
      </body>
    </html>
  );
}

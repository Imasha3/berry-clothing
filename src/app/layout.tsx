import type { Metadata } from "next";
import { Playfair_Display, Manrope, Cormorant_Garamond, Bodoni_Moda } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { AdminSessionProvider } from "@/components/providers/admin-session-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { CommerceStoreProvider } from "@/components/providers/commerce-store-provider";
import { CustomerSessionProvider } from "@/components/providers/customer-session-provider";
import { DialogProvider } from "@/components/providers/dialog-provider";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

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
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${manrope.variable} ${cormorant.variable} ${bodoni.variable} bg-white font-body text-ink`}
      >
        <CommerceStoreProvider>
          <AdminSessionProvider>
            <CustomerSessionProvider>
              <DialogProvider>
                <CartProvider>
                  <AppShell>{children}</AppShell>
                </CartProvider>
              </DialogProvider>
            </CustomerSessionProvider>
          </AdminSessionProvider>
        </CommerceStoreProvider>
      </body>
    </html>
  );
}

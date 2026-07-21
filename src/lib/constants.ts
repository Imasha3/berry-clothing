import type { ModuleKey } from "@/types/permission";
import type { OrderStatus } from "@/types/order";

export const siteNavLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/videos", label: "Videos" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const customerAccountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/track-order", label: "Track Order" },
  { href: "/account/payment-history", label: "Payment History" },
  { href: "/account/delivery-addresses", label: "Delivery Addresses" },
  { href: "/account/return-requests", label: "Return Requests" },
  { href: "/account/exchange-requests", label: "Exchange Requests" },
  { href: "/account/notifications", label: "Notifications" }
];

export const paymentOptionsMessage =
  "Available Payment Options: Cash on Delivery, Bank Deposit, Online Card Payment";

export const berryFacebookPageUrl = "https://www.facebook.com/share/1HJuZ2v3HU/";

export const paymentMethods = [
  "Cash on Delivery",
  "Bank Deposit",
  "Online Card Payment"
] as const;

export const mockBankDetails = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "Berry Clothing (Pvt) Ltd",
  accountNumber: "1234567890",
  branch: "Colombo 03 Branch"
};

export const adminModules: Array<{
  key: ModuleKey;
  href: string;
  label: string;
  icon: string;
}> = [
  { key: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: "⌂" },
  { key: "products", href: "/admin/products", label: "Products", icon: "◈" },
  { key: "categories", href: "/admin/categories", label: "Categories", icon: "▦" },
  { key: "orders", href: "/admin/orders", label: "Orders", icon: "◷" },
  { key: "payments", href: "/admin/payments", label: "Payments", icon: "₨" },
  { key: "inventory", href: "/admin/inventory", label: "Inventory", icon: "▣" },
  { key: "customers", href: "/admin/customers", label: "Customers", icon: "♡" },
  { key: "reports", href: "/admin/reports", label: "Reports", icon: "▤" },
  { key: "promotions", href: "/admin/promotions", label: "Promotions", icon: "✦" },
  { key: "reviews", href: "/admin/reviews", label: "Reviews", icon: "★" },
  { key: "videos", href: "/admin/videos", label: "Video Management", icon: "▶" },
  { key: "users", href: "/admin/users", label: "Users & Permissions", icon: "◎" },
  { key: "roles", href: "/admin/roles", label: "Roles", icon: "◇" },
  { key: "contact-settings", href: "/admin/contact-settings", label: "Contact Settings", icon: "@" },
  { key: "settings", href: "/admin/settings", label: "Settings", icon: "⚙" }
];

export const orderWorkflow: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
  "Completed"
];

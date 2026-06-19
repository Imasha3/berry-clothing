import type { ModuleKey } from "@/types/permission";
import type { OrderStatus } from "@/types/order";

export const siteNavLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export const customerAccountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/track-order", label: "Track Order" },
  { href: "/account/payment-methods", label: "Payment Methods" },
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
}> = [
  { key: "dashboard", href: "/admin/dashboard", label: "Dashboard" },
  { key: "products", href: "/admin/products", label: "Products" },
  { key: "categories", href: "/admin/categories", label: "Categories" },
  { key: "orders", href: "/admin/orders", label: "Orders" },
  { key: "payments", href: "/admin/payments", label: "Payments" },
  { key: "inventory", href: "/admin/inventory", label: "Inventory" },
  { key: "customers", href: "/admin/customers", label: "Customers" },
  { key: "reports", href: "/admin/reports", label: "Reports" },
  { key: "promotions", href: "/admin/promotions", label: "Promotions" },
  { key: "reviews", href: "/admin/reviews", label: "Reviews" },
  { key: "users", href: "/admin/users", label: "Users & Permissions" },
  { key: "roles", href: "/admin/roles", label: "Roles" },
  { key: "settings", href: "/admin/settings", label: "Settings" }
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

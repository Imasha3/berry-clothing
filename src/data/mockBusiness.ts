import type { AdminActivityLogEntry, AdminNotification } from "@/types/admin";
import type { CustomerNotification, CustomerServiceRequest } from "@/types/customer";
import type { PaymentMethod, PaymentStatus } from "@/types/order";

export const mockDeliverySettings = {
  defaultDeliveryFee: 450,
  estimatedDeliveryTimes: {
    Colombo: "1-2 business days",
    Kandy: "2-3 business days",
    Galle: "2-4 business days",
    default: "3-5 business days"
  },
  districtFees: [
    { district: "Colombo", fee: 350 },
    { district: "Kandy", fee: 450 },
    { district: "Galle", fee: 500 }
  ],
  cityFees: [
    { city: "Colombo", district: "Colombo", fee: 350 },
    { city: "Dehiwala", district: "Colombo", fee: 375 },
    { city: "Kandy", district: "Kandy", fee: 450 },
    { city: "Galle", district: "Galle", fee: 500 }
  ],
  couriers: ["Pronto Lanka", "Domex", "Koombiyo", "Prompt Xpress"]
};

export const mockStoreSettings = {
  storeName: "Berry Clothing",
  logo: "Berry",
  contactEmail: "hello@berryclothing.lk",
  contactPhone: "+94 77 123 4567",
  address: "Colombo, Sri Lanka",
  socialLinks: {
    instagram: "https://instagram.com/berryclothing",
    facebook: "https://facebook.com/berryclothing",
    tiktok: "https://tiktok.com/@berryclothing"
  },
  bankDetails: {
    bankName: "Commercial Bank of Ceylon",
    accountName: "Berry Clothing (Pvt) Ltd",
    accountNumber: "1234567890",
    branch: "Colombo 03 Branch"
  },
  returnPolicy:
    "Returns are accepted for eligible products within 7 days in original condition after admin approval.",
  exchangePolicy:
    "Exchanges can be requested for size or color changes subject to stock availability and approval."
};

export const mockPaymentArchitecture = [
  {
    provider: "PayHere",
    status: "Future-ready",
    notes: "Prepare redirect + webhook flow in the backend phase."
  },
  {
    provider: "Stripe",
    status: "Future-ready",
    notes: "Prepare payment intent and post-payment verification flow."
  },
  {
    provider: "Dialog Genie Payment Solutions",
    status: "Future-ready",
    notes: "Prepare gateway adapter abstraction before live integration."
  },
  {
    provider: "Commercial Bank Payment Gateway",
    status: "Future-ready",
    notes: "Prepare bank gateway adapter and callback verification flow."
  }
];

export const mockMediaBuckets = [
  {
    label: "Product Images",
    provider: "Cloudinary planned",
    description: "Multiple product images and main image mapping."
  },
  {
    label: "Category Images",
    provider: "Cloudinary planned",
    description: "Category thumbnails and collection cover assets."
  },
  {
    label: "Banner Images",
    provider: "Cloudinary planned",
    description: "Homepage banners, campaign visuals, and landing sections."
  },
  {
    label: "Promotional Images",
    provider: "Cloudinary planned",
    description: "Sale graphics, social ad assets, and featured campaign art."
  }
];

export const mockEmailTemplates = [
  {
    key: "order_confirmation",
    name: "Order Confirmation",
    subject: "Your Berry Clothing order has been placed",
    body: "Sent after checkout with order summary, delivery fee, and account order link."
  },
  {
    key: "payment_received",
    name: "Payment Received",
    subject: "We received your payment proof",
    body: "Sent after a bank deposit receipt is submitted."
  },
  {
    key: "payment_verified",
    name: "Payment Verified",
    subject: "Your payment has been verified",
    body: "Sent when admin verifies a customer payment."
  },
  {
    key: "payment_rejected",
    name: "Payment Rejected",
    subject: "Your payment needs attention",
    body: "Sent if a payment receipt is rejected and the customer must re-upload proof."
  },
  {
    key: "order_processing",
    name: "Order Processing",
    subject: "Your order is being prepared",
    body: "Sent when an order moves into processing."
  },
  {
    key: "order_shipped",
    name: "Order Shipped",
    subject: "Your Berry order is on the way",
    body: "Includes courier service and tracking number."
  },
  {
    key: "order_delivered",
    name: "Order Delivered",
    subject: "Your Berry order was delivered",
    body: "Sent when the order reaches the delivered stage."
  },
  {
    key: "return_approved",
    name: "Return Approved",
    subject: "Your return request was approved",
    body: "Sent after admin approves a return request."
  },
  {
    key: "exchange_approved",
    name: "Exchange Approved",
    subject: "Your exchange request was approved",
    body: "Sent after admin approves an exchange request."
  }
];

export const mockActivityLog: AdminActivityLogEntry[] = [
  {
    id: "act-1",
    user: "Sashini Jayasuriya",
    action: "Product added",
    target: "Rosette Linen Midi Dress",
    createdAt: "2026-06-16T02:45:00.000Z"
  },
  {
    id: "act-2",
    user: "Imesha Silva",
    action: "Stock updated",
    target: "BC-CO-002 / Soft Beige / L",
    createdAt: "2026-06-16T03:10:00.000Z"
  },
  {
    id: "act-3",
    user: "Kavindi Fernando",
    action: "Order confirmed",
    target: "BC-24003 for H. Perera",
    createdAt: "2026-06-16T03:30:00.000Z"
  },
  {
    id: "act-4",
    user: "Sashini Jayasuriya",
    action: "Payment verified",
    target: "Online card payment for BC-24004",
    createdAt: "2026-06-16T04:05:00.000Z"
  },
  {
    id: "act-5",
    user: "Sashini Jayasuriya",
    action: "User role changed",
    target: "Inventory Staff permissions updated",
    createdAt: "2026-06-11T08:35:00.000Z"
  }
];

export const mockNotificationCenter: AdminNotification[] = [
  {
    id: "not-1",
    title: "New order received",
    message: "BC-24012 was placed with online card payment.",
    type: "order",
    createdAt: "2026-06-16T05:10:00.000Z",
    isRead: false
  },
  {
    id: "not-2",
    title: "Low stock alert",
    message: "Pearl Button Blouse is below minimum stock.",
    type: "payment",
    createdAt: "2026-06-16T05:00:00.000Z",
    isRead: false
  },
  {
    id: "not-3",
    title: "Deposit receipt uploaded",
    message: "Customer uploaded proof for order BC-24009.",
    type: "payment",
    createdAt: "2026-06-16T04:35:00.000Z",
    isRead: false
  },
  {
    id: "not-4",
    title: "Return request pending",
    message: "BC-24006 has a new return request awaiting review.",
    type: "return",
    createdAt: "2026-06-16T03:50:00.000Z",
    isRead: false
  },
  {
    id: "not-5",
    title: "Payment verification needed",
    message: "2 bank deposit orders need manual approval.",
    type: "payment",
    createdAt: "2026-06-16T03:25:00.000Z",
    isRead: true
  }
];

export const mockCustomerNotifications: CustomerNotification[] = mockNotificationCenter
  .filter((notification): notification is CustomerNotification => notification.type !== "system")
  .map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    createdAt: notification.createdAt,
    isRead: notification.isRead
  }));

export const mockReturnRequests: CustomerServiceRequest[] = [
  {
    id: "ret-1",
    orderId: "BC-24002",
    type: "Return",
    reason: "Requested a different fit after delivery.",
    status: "Pending",
    createdAt: "2026-06-11T10:15:00.000Z"
  }
];

export const mockExchangeRequests: CustomerServiceRequest[] = [
  {
    id: "exc-1",
    orderId: "BC-24001",
    type: "Exchange",
    reason: "Need to exchange size M to L.",
    status: "Approved",
    createdAt: "2026-06-10T14:10:00.000Z"
  }
];

export const mockPaymentHistory: Array<{
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
}> = [
  {
    id: "pay-1",
    orderId: "BC-24001",
    method: "Cash on Delivery",
    status: "Pending",
    amount: 12930,
    createdAt: "2026-06-09T06:25:00.000Z"
  },
  {
    id: "pay-2",
    orderId: "BC-24002",
    method: "Bank Deposit",
    status: "Pending",
    amount: 11440,
    createdAt: "2026-06-10T11:10:00.000Z"
  },
  {
    id: "pay-3",
    orderId: "BC-24003",
    method: "Online Card Payment",
    status: "Paid",
    amount: 11940,
    createdAt: "2026-06-08T15:00:00.000Z"
  }
];

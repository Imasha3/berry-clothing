import type { Product } from "@/types/product";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Dispatched"
  | "Out for Delivery"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export type PaymentMethod =
  | "Cash on Delivery"
  | "Bank Deposit"
  | "Online Card Payment";
export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded";
export type DeliveryStatus =
  | "Pending"
  | "Ready for Dispatch"
  | "Dispatched"
  | "Out for Delivery"
  | "Delivered";

export interface PaymentReceipt {
  fileName: string;
  fileType: string;
  previewUrl?: string;
  uploadedAt: string;
}

export interface PaymentTimelineEvent {
  id: string;
  label: string;
  createdAt: string;
}

export interface InvoiceSummary {
  invoiceId: string;
  generatedAt: string;
  printable: boolean;
  downloadable: boolean;
}

export interface OrderItem {
  productId: Product["id"];
  productName: string;
  image: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  variantId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  originalSubtotal?: number;
  discountTotal?: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTimeline: PaymentTimelineEvent[];
  transactionId?: string;
  paidAt?: string;
  receiptFileName?: string;
  receiptPreviewUrl?: string;
  paymentReceipt?: PaymentReceipt;
  district: string;
  estimatedDeliveryTime: string;
  deliveryStatus: DeliveryStatus;
  courierService?: string;
  trackingNumber?: string;
  status: OrderStatus;
  invoice: InvoiceSummary;
  returnRequestStatus?: "Not Requested" | "Pending" | "Approved" | "Rejected" | "Processing";
  exchangeRequestStatus?: "Not Requested" | "Pending" | "Approved" | "Rejected" | "Processing";
  createdAt: string;
}

import type { Permission } from "@/types/permission";

export type FirebaseAuthUserType = "customer" | "admin";

export type AppRoleKey =
  | "super-admin"
  | "admin"
  | "staff"
  | "order-staff"
  | "inventory-staff"
  | "marketing-staff"
  | "customer";

export interface FirebaseTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseUserProfile extends FirebaseTimestamps {
  id: string;
  authUid: string;
  fullName: string;
  email: string;
  phone?: string;
  roleIds: string[];
  primaryRole: AppRoleKey;
  userType: FirebaseAuthUserType;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface FirestoreProduct extends FirebaseTimestamps {
  id: string;
  productName: string;
  sku: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  discountPrice?: number;
  sizes: string[];
  colors: string[];
  material: string;
  imageUrls: string[];
  stockQuantity: number;
  availabilityStatus: "In Stock" | "Low Stock" | "Out of Stock";
  isNewArrival: boolean;
  isBestSeller: boolean;
  isSaleItem: boolean;
  isPublished: boolean;
}

export interface FirestoreCategory extends FirebaseTimestamps {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
}

export interface FirestoreOrderItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface FirestoreOrder extends FirebaseTimestamps {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "Cash on Delivery" | "Bank Deposit" | "Online Card Payment";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  status:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Packed"
    | "Dispatched"
    | "Out for Delivery"
    | "Delivered"
    | "Completed";
  receiptId?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface FirestoreCustomer extends FirebaseTimestamps {
  id: string;
  authUid: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpending: number;
  isActive: boolean;
}

export interface FirestoreInventoryMovement extends FirebaseTimestamps {
  id: string;
  productId: string;
  sku: string;
  type: "Stock In" | "Stock Out";
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  updatedByUserId: string;
}

export interface FirestoreRole extends FirebaseTimestamps {
  id: string;
  key: AppRoleKey;
  name: string;
  description: string;
  permissionIds: string[];
  isSystemRole: boolean;
}

export interface FirestorePermission extends FirebaseTimestamps {
  id: string;
  key: Permission;
  module: string;
  description: string;
}

export interface FirestoreEmailTemplate extends FirebaseTimestamps {
  id: string;
  key: string;
  name: string;
  subject: string;
  html: string;
  isActive: boolean;
}

export interface FirestorePaymentReceipt extends FirebaseTimestamps {
  id: string;
  orderId: string;
  customerId: string;
  fileName: string;
  fileUrl: string;
  status: "Pending" | "Verified" | "Rejected";
  reviewedByUserId?: string;
  reviewedAt?: string;
}

export type FirestoreCollectionName =
  | "users"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "inventoryMovements"
  | "roles"
  | "permissions"
  | "emailTemplates"
  | "paymentReceipts";

export interface FirestoreCollectionPlanItem {
  name: FirestoreCollectionName;
  purpose: string;
  documentIdStrategy: string;
  requiredFields: string[];
  notes?: string[];
}

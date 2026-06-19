import {
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  type CollectionReference,
  type DocumentReference,
  type Firestore
} from "firebase/firestore";
import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";
import type {
  FirestoreCategory,
  FirestoreCollectionName,
  FirestoreCollectionPlanItem,
  FirestoreCustomer,
  FirestoreEmailTemplate,
  FirestoreInventoryMovement,
  FirestoreOrder,
  FirestorePaymentReceipt,
  FirestorePermission,
  FirestoreProduct,
  FirestoreRole,
  FirebaseUserProfile
} from "@/types/firebase";

export function getFirestoreDb(): Firestore | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  return getFirestore(getFirebaseApp());
}

export const firestoreCollections = {
  users: "users",
  products: "products",
  categories: "categories",
  orders: "orders",
  customers: "customers",
  inventoryMovements: "inventoryMovements",
  roles: "roles",
  permissions: "permissions",
  emailTemplates: "emailTemplates",
  paymentReceipts: "paymentReceipts"
} as const satisfies Record<FirestoreCollectionName, FirestoreCollectionName>;

export const firestoreCollectionPlan: FirestoreCollectionPlanItem[] = [
  {
    name: "users",
    purpose: "Admin, staff, and customer auth-linked profile records for role-aware access.",
    documentIdStrategy: "Use Firebase Auth UID as the document ID.",
    requiredFields: ["authUid", "email", "fullName", "primaryRole", "roleIds", "userType", "isActive"],
    notes: ["Supports customer login/register and admin login.", "Primary source for role checking after sign-in."]
  },
  {
    name: "products",
    purpose: "Product catalog records managed by admin users.",
    documentIdStrategy: "Auto ID or SKU-based ID if the team wants human-readable docs later.",
    requiredFields: ["productName", "sku", "slug", "categoryId", "price", "stockQuantity", "isPublished"],
    notes: ["Keep Cloudinary image URLs here later.", "Do not migrate mock data in Step 1."]
  },
  {
    name: "categories",
    purpose: "Shop category metadata for product grouping and filtering.",
    documentIdStrategy: "Auto ID or slug-based ID.",
    requiredFields: ["name", "slug", "description", "isActive"]
  },
  {
    name: "orders",
    purpose: "Placed order records for customer account history and admin processing.",
    documentIdStrategy: "Auto ID with separate human-friendly orderNumber field.",
    requiredFields: ["orderNumber", "customerId", "items", "subtotal", "total", "paymentMethod", "status"],
    notes: ["Checkout should require an authenticated customer before order creation later."]
  },
  {
    name: "customers",
    purpose: "Customer-specific profile and commerce summary data.",
    documentIdStrategy: "Use Firebase Auth UID or mirror the users document ID.",
    requiredFields: ["authUid", "fullName", "email", "phone", "address", "city", "isActive"],
    notes: ["Useful when customer-only data should stay separate from admin/staff records."]
  },
  {
    name: "inventoryMovements",
    purpose: "Stock audit trail for stock-in and stock-out events.",
    documentIdStrategy: "Auto ID.",
    requiredFields: ["productId", "sku", "type", "quantity", "reason", "previousStock", "newStock", "updatedByUserId"]
  },
  {
    name: "roles",
    purpose: "Role definitions for Super Admin, Admin, and Staff access models.",
    documentIdStrategy: "Readable role key as the document ID when seeded.",
    requiredFields: ["key", "name", "description", "permissionIds", "isSystemRole"],
    notes: ["Supports super-admin/admin/staff role checking requirements."]
  },
  {
    name: "permissions",
    purpose: "Permission catalog used by roles for feature-level access control.",
    documentIdStrategy: "Readable permission key as the document ID when seeded.",
    requiredFields: ["key", "module", "description"]
  },
  {
    name: "emailTemplates",
    purpose: "Transactional email template storage for later Resend integration.",
    documentIdStrategy: "Readable template key or auto ID.",
    requiredFields: ["key", "name", "subject", "html", "isActive"]
  },
  {
    name: "paymentReceipts",
    purpose: "Manual payment receipt metadata linked to orders.",
    documentIdStrategy: "Auto ID.",
    requiredFields: ["orderId", "customerId", "fileName", "fileUrl", "status"],
    notes: ["Firebase Storage is optional later if Cloudinary is not used for receipts."]
  }
];

export function getCollectionRef<T>(collectionName: FirestoreCollectionName) {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured yet. Add env values before enabling live data.");
  }

  return collection(db, collectionName) as CollectionReference<T>;
}

export function getDocumentRef<T>(collectionName: FirestoreCollectionName, documentId: string) {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured yet. Add env values before enabling live data.");
  }

  return doc(db, collectionName, documentId) as DocumentReference<T>;
}

export function getUsersCollection() {
  return getCollectionRef<FirebaseUserProfile>(firestoreCollections.users);
}

export function getProductsCollection() {
  return getCollectionRef<FirestoreProduct>(firestoreCollections.products);
}

export function getCategoriesCollection() {
  return getCollectionRef<FirestoreCategory>(firestoreCollections.categories);
}

export function getOrdersCollection() {
  return getCollectionRef<FirestoreOrder>(firestoreCollections.orders);
}

export function getCustomersCollection() {
  return getCollectionRef<FirestoreCustomer>(firestoreCollections.customers);
}

export function getInventoryMovementsCollection() {
  return getCollectionRef<FirestoreInventoryMovement>(firestoreCollections.inventoryMovements);
}

export function getRolesCollection() {
  return getCollectionRef<FirestoreRole>(firestoreCollections.roles);
}

export function getPermissionsCollection() {
  return getCollectionRef<FirestorePermission>(firestoreCollections.permissions);
}

export function getEmailTemplatesCollection() {
  return getCollectionRef<FirestoreEmailTemplate>(firestoreCollections.emailTemplates);
}

export function getPaymentReceiptsCollection() {
  return getCollectionRef<FirestorePaymentReceipt>(firestoreCollections.paymentReceipts);
}

export function createTimestampFields() {
  return {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

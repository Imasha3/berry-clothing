"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type PropsWithChildren
} from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  type Firestore,
  type Unsubscribe,
  writeBatch
} from "firebase/firestore";
import { mockActivityLog, mockNotificationCenter } from "@/data/mockBusiness";
import { mockCategories } from "@/data/mockCategories";
import { mockCustomers } from "@/data/mockCustomers";
import { mockInventoryMovements } from "@/data/mockInventory";
import { mockOrders } from "@/data/mockOrders";
import { mockPermissions, type MockPermissionEntry } from "@/data/mockPermissions";
import { mockProducts } from "@/data/mockProducts";
import { mockRoles, mockUsers } from "@/data/mockUsers";
import { isFirebaseConfigured } from "@/lib/firebase";
import { supabaseClient } from "@/lib/supabase-client";
import { firestoreCollections, getFirestoreDb } from "@/lib/firestore";
import { calculateDiscountedPrice } from "@/lib/product";
import type { AdminActivityLogEntry, AdminNotification } from "@/types/admin";
import type { Customer } from "@/types/customer";
import type { InventoryMovement } from "@/types/inventory";
import type { Order } from "@/types/order";
import type { FirestorePaymentReceipt } from "@/types/firebase";
import type { Category, Product, ProductAvailabilityStatus } from "@/types/product";
import type { AdminUser, Role } from "@/types/user";

type DataMode = "mock" | "firestore";

interface CommerceStoreState {
  isReady: boolean;
  dataMode: DataMode;
  products: Product[];
  categories: Category[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  users: AdminUser[];
  customers: Customer[];
  roles: Role[];
  permissions: MockPermissionEntry[];
  paymentReceipts: FirestorePaymentReceipt[];
  notifications: AdminNotification[];
  activityLog: AdminActivityLogEntry[];
  activeCategories: Category[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<void>;
  setInventoryMovements: (movements: InventoryMovement[]) => Promise<void>;
  addUser: (user: AdminUser) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  updateUserStatus: (userId: string, status: AdminUser["status"]) => Promise<void>;
  resetUserPassword: (userId: string, nextPassword: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addRole: (role: Role) => Promise<void>;
  updateRole: (roleId: string, updates: Partial<Role>) => Promise<void>;
  addActivityLog: (entry: Omit<AdminActivityLogEntry, "id" | "createdAt">) => Promise<void>;
  addNotification: (notification: {
    title: string;
    message: string;
    type: string;
    isRead?: boolean;
    relatedId?: string | null;
    relatedType?: string | null;
    recipientId?: string | null;
  }) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
}

interface PersistedCommerceStore {
  version?: string;
  products: Product[];
  categories: Category[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  users: AdminUser[];
  customers: Customer[];
  roles: Role[];
  permissions: MockPermissionEntry[];
  paymentReceipts: FirestorePaymentReceipt[];
  notifications: AdminNotification[];
  activityLog: AdminActivityLogEntry[];
}

const storageKey = "berry-commerce-store";
const mockStoreVersion = "2026-06-25-cloudinary-products-v1";
const CommerceStoreContext = createContext<CommerceStoreState | undefined>(undefined);
const legacyMockUserIds = new Set(["usr-1", "usr-2", "usr-3", "usr-4", "usr-5"]);

function createMockPaymentReceipts(orders: Order[]): FirestorePaymentReceipt[] {
  return orders
    .filter((order) => order.receiptFileName)
    .map((order) => ({
      id: `receipt-${order.id}`,
      orderId: order.id,
      customerId: order.customerId,
      fileName: order.receiptFileName!,
      fileUrl: order.receiptPreviewUrl ?? "",
      status: order.paymentStatus === "Paid" ? "Verified" : "Pending",
      createdAt: order.paymentReceipt?.uploadedAt ?? order.createdAt,
      updatedAt: order.paymentReceipt?.uploadedAt ?? order.createdAt
    }));
}

function normalizeStoredUsers(users: AdminUser[]) {
  return users.filter((user) => !legacyMockUserIds.has(user.id));
}

function getDefaultStore(): PersistedCommerceStore {
  return {
    version: mockStoreVersion,
    products: mockProducts,
    categories: mockCategories,
    orders: mockOrders,
    inventoryMovements: mockInventoryMovements,
    users: mockUsers,
    customers: mockCustomers,
    roles: mockRoles,
    permissions: mockPermissions,
    paymentReceipts: createMockPaymentReceipts(mockOrders),
    notifications: mockNotificationCenter,
    activityLog: mockActivityLog
  };
}

function readPersistedStore(): PersistedCommerceStore {
  if (typeof window === "undefined") {
    return getDefaultStore();
  }

  try {
    const stored = globalThis.localStorage.getItem(storageKey);
    if (!stored) {
      return getDefaultStore();
    }

    const parsed = JSON.parse(stored) as Partial<PersistedCommerceStore>;
    const defaults = getDefaultStore();

    if (parsed.version !== mockStoreVersion) {
      globalThis.localStorage.setItem(storageKey, JSON.stringify(defaults));
      return defaults;
    }

    return {
      version: mockStoreVersion,
      products: parsed.products?.length ? parsed.products : defaults.products,
      categories: parsed.categories?.length ? parsed.categories : defaults.categories,
      orders: parsed.orders?.length ? parsed.orders : defaults.orders,
      inventoryMovements: parsed.inventoryMovements ?? defaults.inventoryMovements,
      users: normalizeStoredUsers(parsed.users?.length ? parsed.users : defaults.users),
      customers: parsed.customers?.length ? parsed.customers : defaults.customers,
      roles: parsed.roles?.length ? parsed.roles : defaults.roles,
      permissions: parsed.permissions?.length ? parsed.permissions : defaults.permissions,
      paymentReceipts: parsed.paymentReceipts ?? defaults.paymentReceipts,
      notifications: parsed.notifications?.length ? parsed.notifications : defaults.notifications,
      activityLog: parsed.activityLog?.length ? parsed.activityLog : defaults.activityLog
    };
  } catch {
    return getDefaultStore();
  }
}

function getAvailabilityStatus(stockQuantity: number, minStockLevel: number): ProductAvailabilityStatus {
  if (stockQuantity <= 0) {
    return "Out of Stock";
  }

  if (stockQuantity <= minStockLevel) {
    return "Low Stock";
  }

  return "In Stock";
}

function normalizeProduct(product: Product): Product {
  const stockQuantity = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const originalPrice = product.originalPrice ?? product.price;
  const discountPercentage =
    product.discountPercentage ??
    (product.discountPrice && product.discountPrice < originalPrice
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0);
  const isDiscounted = Boolean(product.isDiscounted ?? discountPercentage > 0);
  const discountedPrice = isDiscounted
    ? product.discountedPrice ?? product.discountPrice ?? calculateDiscountedPrice(originalPrice, discountPercentage)
    : undefined;

  return {
    ...product,
    originalPrice,
    discountPercentage,
    discountedPrice,
    discountPrice: discountedPrice,
    isDiscounted: Boolean(isDiscounted && discountedPrice && discountedPrice < originalPrice),
    isSaleItem: Boolean(product.isSaleItem || (isDiscounted && discountedPrice && discountedPrice < originalPrice)),
    stockQuantity,
    availabilityStatus: getAvailabilityStatus(stockQuantity, product.minStockLevel)
  };
}

interface CloudinaryProductImage {
  id: string;
  url: string;
  previewUrl?: string;
  alt?: string;
  resourceType?: "image";
}

function applyCloudinaryProductImages(products: Product[], cloudinaryImages: CloudinaryProductImage[]) {
  if (cloudinaryImages.length === 0) {
    return products;
  }

  return products.map((product, index) => {
    // If the product already has its own uploaded Cloudinary images, keep them
    const hasRealImages = product.images.some(
      (img) => img.id && img.id.startsWith("berry-clothing/products/")
    );
    if (hasRealImages) {
      return product;
    }

    const image = cloudinaryImages[index % cloudinaryImages.length];
    const nextImage = {
      id: image.id || `cloudinary-product-${index}`,
      url: image.url,
      previewUrl: image.previewUrl || image.url,
      resourceType: "image" as const,
      alt: image.alt || product.productName
    };

    return {
      ...product,
      mainImage: nextImage.url,
      images: [nextImage, ...product.images.filter((entry) => !entry.url.includes("images.unsplash.com"))]
    };
  });
}

async function fetchCloudinaryProductImages() {
  try {
    const response = await fetch("/api/product-images", { cache: "no-store" });
    const data = await response.json().catch(() => []);

    if (!response.ok || !Array.isArray(data)) {
      return [];
    }

    return data.filter((image): image is CloudinaryProductImage => Boolean(image?.url));
  } catch {
    return [];
  }
}

function isEphemeralFileUrl(value?: string) {
  return Boolean(value && (value.startsWith("blob:") || value.startsWith("data:")));
}

function sanitizeOrderForPersistence(order: Order): Order {
  const receiptPreviewUrl = isEphemeralFileUrl(order.receiptPreviewUrl) ? undefined : order.receiptPreviewUrl;
  const paymentReceipt = order.paymentReceipt
    ? {
        ...order.paymentReceipt,
        previewUrl: isEphemeralFileUrl(order.paymentReceipt.previewUrl) ? undefined : order.paymentReceipt.previewUrl
      }
    : undefined;

  return {
    ...order,
    receiptPreviewUrl,
    paymentReceipt
  };
}

function sanitizePaymentReceiptForPersistence(receipt: FirestorePaymentReceipt): FirestorePaymentReceipt {
  return {
    ...receipt,
    fileUrl: isEphemeralFileUrl(receipt.fileUrl) ? "" : receipt.fileUrl
  };
}

function sanitizePersistedStore(nextState: PersistedCommerceStore): PersistedCommerceStore {
  return {
    ...nextState,
    version: mockStoreVersion,
    users: normalizeStoredUsers(nextState.users),
    orders: nextState.orders.map(sanitizeOrderForPersistence),
    paymentReceipts: nextState.paymentReceipts.map(sanitizePaymentReceiptForPersistence)
  };
}

function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

function persistMockStore(nextState: PersistedCommerceStore) {
  const sanitizedState = sanitizePersistedStore(nextState);

  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(sanitizedState));
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      throw error;
    }

    const fallbackState: PersistedCommerceStore = {
      ...sanitizedState,
      notifications: sanitizedState.notifications.slice(0, 25),
      activityLog: sanitizedState.activityLog.slice(0, 25)
    };

    try {
      globalThis.localStorage.setItem(storageKey, JSON.stringify(fallbackState));
    } catch {
      console.warn("Unable to persist the full mock commerce store to localStorage.");
    }
  }
}

async function collectionHasDocuments(db: Firestore, collectionName: string) {
  const snapshot = await getDocs(query(collection(db, collectionName), limit(1)));
  return !snapshot.empty;
}

async function seedCollection<T extends { id: string }>(
  db: Firestore,
  collectionName: string,
  documents: T[]
) {
  if (await collectionHasDocuments(db, collectionName)) {
    return;
  }

  const batch = writeBatch(db);
  documents.forEach((entry) => {
    batch.set(doc(db, collectionName, entry.id), entry);
  });
  await batch.commit();
}

async function ensureFirestoreSeedData(db: Firestore) {
  const defaults = getDefaultStore();
  await seedCollection(db, firestoreCollections.products, defaults.products.map(normalizeProduct));
  await seedCollection(db, firestoreCollections.categories, defaults.categories);
  await seedCollection(db, firestoreCollections.orders, defaults.orders);
  await seedCollection(db, firestoreCollections.users, defaults.users);
  await seedCollection(db, firestoreCollections.customers, defaults.customers);
  await seedCollection(db, firestoreCollections.inventoryMovements, defaults.inventoryMovements);
  await seedCollection(db, firestoreCollections.roles, defaults.roles);
  await seedCollection(db, firestoreCollections.permissions, defaults.permissions);
  await seedCollection(db, firestoreCollections.paymentReceipts, defaults.paymentReceipts);
}

async function readCollectionDocs<T extends { id: string }>(db: Firestore, collectionName: string) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<T, "id">) })) as T[];
}

export function createProductId(productName: string) {
  return `prod-${Date.now()}-${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

function sortByCreatedAt<T extends { createdAt: string }>(entries: T[]) {
  return [...entries].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function mapSupabaseNotification(row: {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_id?: string | null;
  related_type?: string | null;
}): AdminNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as AdminNotification["type"],
    isRead: row.is_read,
    createdAt: row.created_at,
    relatedId: row.related_id,
    relatedType: row.related_type
  };
}

async function insertAdminNotification(payload: {
  title: string;
  message: string;
  type: string;
  relatedId?: string | null;
  relatedType?: string | null;
}) {
  try {
    const { data, error } = await supabaseClient.from("notifications").insert({
      title: payload.title,
      message: payload.message,
      type: payload.type,
      is_read: false,
      related_id: payload.relatedId ?? null,
      related_type: payload.relatedType ?? null,
      recipient_id: null
    }).select().single();
    if (error) {
      console.error("Failed to insert admin notification:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to insert admin notification:", error);
    return null;
  }
}

export function CommerceStoreProvider({ children }: PropsWithChildren) {
  const defaults = getDefaultStore();
  const [isReady, setIsReady] = useState(false);
  const [dataMode, setDataMode] = useState<DataMode>("mock");
  const cloudinaryImagesRef = useRef<CloudinaryProductImage[]>([]);
  const [products, setProducts] = useState<Product[]>(defaults.products);
  const [categories, setCategories] = useState<Category[]>(defaults.categories);
  const [orders, setOrders] = useState<Order[]>(defaults.orders);
  const [inventoryMovements, setInventoryMovementsState] = useState<InventoryMovement[]>(
    defaults.inventoryMovements
  );
  const [users, setUsers] = useState<AdminUser[]>(defaults.users);
  const [customers, setCustomers] = useState<Customer[]>(defaults.customers);
  const [roles, setRoles] = useState<Role[]>(defaults.roles);
  const [permissions, setPermissions] = useState<MockPermissionEntry[]>(defaults.permissions);
  const [paymentReceipts, setPaymentReceipts] = useState<FirestorePaymentReceipt[]>(
    defaults.paymentReceipts
  );
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activityLog, setActivityLog] = useState<AdminActivityLogEntry[]>(defaults.activityLog);

  // Load and subscribe to Supabase notifications (Admin only: recipient_id IS NULL)
  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("notifications")
          .select("*")
          .is("recipient_id", null)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading notifications from Supabase:", error);
          return;
        }

        if (data && active) {
          const mapped: AdminNotification[] = data.map((row: any) => ({
            id: row.id,
            title: row.title,
            message: row.message,
            type: row.type as any,
            isRead: row.is_read,
            createdAt: row.created_at,
            relatedId: row.related_id,
            relatedType: row.related_type
          } as any));
          setNotifications(mapped);
        }
      } catch (err) {
        console.error("Failed to load notifications from Supabase:", err);
      }
    };

    void loadNotifications();

    const channel = supabaseClient
      .channel("supabase-realtime-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          if (!active) return;
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === "INSERT") {
            if (newRow.recipient_id === null) {
              const newNotif: AdminNotification = {
                id: newRow.id,
                title: newRow.title,
                message: newRow.message,
                type: newRow.type as any,
                isRead: newRow.is_read,
                createdAt: newRow.created_at,
                relatedId: newRow.related_id,
                relatedType: newRow.related_type
              } as any;
              setNotifications((prev) => {
                if (prev.some((n) => n.id === newNotif.id)) return prev;
                return [newNotif, ...prev];
              });
            }
          } else if (eventType === "UPDATE") {
            if (newRow.recipient_id === null) {
              const updatedNotif: AdminNotification = {
                id: newRow.id,
                title: newRow.title,
                message: newRow.message,
                type: newRow.type as any,
                isRead: newRow.is_read,
                createdAt: newRow.created_at,
                relatedId: newRow.related_id,
                relatedType: newRow.related_type
              } as any;
              setNotifications((prev) =>
                prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
              );
            } else {
              setNotifications((prev) => prev.filter((n) => n.id !== newRow.id));
            }
          } else if (eventType === "DELETE") {
            setNotifications((prev) => prev.filter((n) => n.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    const refreshTimer = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      void supabaseClient.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribes: Unsubscribe[] = [];

    const loadMockState = () => {
      const nextStore = readPersistedStore();
      setProducts(nextStore.products.map(normalizeProduct));
      setCategories(nextStore.categories);
      setOrders(nextStore.orders);
      setInventoryMovementsState(nextStore.inventoryMovements);
      setUsers(nextStore.users);
      setCustomers(nextStore.customers);
      setRoles(nextStore.roles);
      setPermissions(nextStore.permissions);
      setPaymentReceipts(nextStore.paymentReceipts);
      setActivityLog(sortByCreatedAt(nextStore.activityLog));
      setDataMode("mock");
      setIsReady(true);

      void fetchCloudinaryProductImages().then((cloudinaryImages) => {
        if (cancelled || cloudinaryImages.length === 0) {
          return;
        }

        cloudinaryImagesRef.current = cloudinaryImages;
        setProducts((currentProducts) =>
          applyCloudinaryProductImages(currentProducts, cloudinaryImages).map(normalizeProduct)
        );
      });
    };

    if (!isFirebaseConfigured()) {
      loadMockState();
      return () => undefined;
    }

    const connectFirestore = async () => {
      try {
        const db = getFirestoreDb();
        if (!db) {
          loadMockState();
          return;
        }

        await ensureFirestoreSeedData(db);

        const [
          firestoreProducts,
          firestoreCategories,
          firestoreOrders,
          firestoreInventoryMovements,
          firestoreUsers,
          firestoreCustomers,
          firestoreRoles,
          firestorePermissions,
          firestorePaymentReceipts
        ] = await Promise.all([
          readCollectionDocs<Product>(db, firestoreCollections.products),
          readCollectionDocs<Category>(db, firestoreCollections.categories),
          readCollectionDocs<Order>(db, firestoreCollections.orders),
          readCollectionDocs<InventoryMovement>(db, firestoreCollections.inventoryMovements),
          readCollectionDocs<AdminUser>(db, firestoreCollections.users),
          readCollectionDocs<Customer>(db, firestoreCollections.customers),
          readCollectionDocs<Role>(db, firestoreCollections.roles),
          readCollectionDocs<MockPermissionEntry>(db, firestoreCollections.permissions),
          readCollectionDocs<FirestorePaymentReceipt>(db, firestoreCollections.paymentReceipts)
        ]);

        if (cancelled) {
          return;
        }

        setProducts(firestoreProducts.map(normalizeProduct));
        setCategories(firestoreCategories);
        setOrders(firestoreOrders);
        setInventoryMovementsState(firestoreInventoryMovements);
        setUsers(normalizeStoredUsers(firestoreUsers));
        setCustomers(firestoreCustomers);
        setRoles(firestoreRoles);
        setPermissions(firestorePermissions);
        setPaymentReceipts(firestorePaymentReceipts);
        setActivityLog(sortByCreatedAt(readPersistedStore().activityLog));
        setDataMode("firestore");
        setIsReady(true);

        void fetchCloudinaryProductImages().then((cloudinaryImages) => {
          if (cancelled || cloudinaryImages.length === 0) {
            return;
          }

          cloudinaryImagesRef.current = cloudinaryImages;
          setProducts((currentProducts) =>
            applyCloudinaryProductImages(currentProducts, cloudinaryImages).map(normalizeProduct)
          );
        });

        unsubscribes = [
          onSnapshot(collection(db, firestoreCollections.products), (snapshot) => {
            if (cancelled) return;
            const freshProducts = snapshot.docs
              .map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<Product, "id">)
              }))
              .map(normalizeProduct);
            setProducts(
              applyCloudinaryProductImages(freshProducts, cloudinaryImagesRef.current)
            );
          }),
          onSnapshot(collection(db, firestoreCollections.categories), (snapshot) => {
            if (cancelled) return;
            setCategories(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<Category, "id">)
              }))
            );
          }),
          onSnapshot(collection(db, firestoreCollections.orders), (snapshot) => {
            if (cancelled) return;
            setOrders(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<Order, "id">)
              }))
            );
          }),
          onSnapshot(collection(db, firestoreCollections.inventoryMovements), (snapshot) => {
            if (cancelled) return;
            setInventoryMovementsState(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<InventoryMovement, "id">)
              }))
            );
          }),
          onSnapshot(collection(db, firestoreCollections.users), (snapshot) => {
            if (cancelled) return;
            setUsers(
              normalizeStoredUsers(
                snapshot.docs.map((entry) => ({
                  id: entry.id,
                  ...(entry.data() as Omit<AdminUser, "id">)
                }))
              )
            );
          }),
          onSnapshot(collection(db, firestoreCollections.customers), (snapshot) => {
            if (cancelled) return;
            setCustomers(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<Customer, "id">)
              }))
            );
          }),
          onSnapshot(collection(db, firestoreCollections.roles), (snapshot) => {
            if (cancelled) return;
            setRoles(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<Role, "id">)
              }))
            );
          }),
          onSnapshot(collection(db, firestoreCollections.permissions), (snapshot) => {
            if (cancelled) return;
            setPermissions(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<MockPermissionEntry, "id">)
              }))
            );
          }),
          onSnapshot(collection(db, firestoreCollections.paymentReceipts), (snapshot) => {
            if (cancelled) return;
            setPaymentReceipts(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                ...(entry.data() as Omit<FirestorePaymentReceipt, "id">)
              }))
            );
          })
        ];
      } catch {
        if (!cancelled) {
          loadMockState();
        }
      }
    };

    connectFirestore();

    return () => {
      cancelled = true;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const persistCurrentMockStore = (overrides: Partial<PersistedCommerceStore>) => {
    const nextState: PersistedCommerceStore = {
      version: mockStoreVersion,
      products,
      categories,
      orders,
      inventoryMovements,
      users,
      customers,
      roles,
      permissions,
      paymentReceipts,
      notifications,
      activityLog,
      ...overrides
    };
    persistMockStore(nextState);
  };

  const value = useMemo<CommerceStoreState>(
    () => ({
      isReady,
      dataMode,
      products,
      categories,
      orders,
      inventoryMovements,
      users,
      customers,
      roles,
      permissions,
      paymentReceipts,
      notifications,
      activityLog,
      activeCategories: categories.filter((category) => category.status === "Active"),
      addProduct: async (product) => {
        const nextProduct = normalizeProduct(product);

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.products, nextProduct.id), nextProduct);
            return;
          }
        }

        const nextProducts = [nextProduct, ...products];
        setProducts(nextProducts);
        persistCurrentMockStore({ products: nextProducts });
      },
      updateProduct: async (productId, product) => {
        const nextProduct = normalizeProduct(product);

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.products, productId), nextProduct);
            return;
          }
        }

        const nextProducts = products.map((item) => (item.id === productId ? nextProduct : item));
        setProducts(nextProducts);
        persistCurrentMockStore({ products: nextProducts });
      },
      deleteProduct: async (productId) => {
        const productToDelete = products.find((p) => p.id === productId);
        if (productToDelete && productToDelete.images) {
          const cloudinaryImages = productToDelete.images.filter((img) =>
            img.id.startsWith("berry-clothing/products/")
          );
          for (const img of cloudinaryImages) {
            try {
              const url = `/api/product-images?publicId=${encodeURIComponent(img.id)}`;
              await fetch(url, { method: "DELETE" });
            } catch (err) {
              console.error("Failed to delete product image from Cloudinary:", err);
            }
          }
        }

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await deleteDoc(doc(db, firestoreCollections.products, productId));
            return;
          }
        }

        const nextProducts = products.filter((product) => product.id !== productId);
        setProducts(nextProducts);
        persistCurrentMockStore({ products: nextProducts });
      },
      addCategory: async (category) => {
        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.categories, category.id), category);
            return;
          }
        }

        const nextCategories = [category, ...categories];
        setCategories(nextCategories);
        persistCurrentMockStore({ categories: nextCategories });
      },
      updateCategory: async (categoryId, updates) => {
        const previousCategory = categories.find((category) => category.id === categoryId);
        const nextCategories = categories.map((category) =>
          category.id === categoryId ? { ...category, ...updates } : category
        );
        const nextProducts =
          previousCategory && updates.name && updates.name !== previousCategory.name
            ? products.map((product) =>
                product.category === previousCategory.name
                  ? { ...product, category: updates.name as string }
                  : product
              )
            : products;

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            const batch = writeBatch(db);
            const nextCategory = nextCategories.find((category) => category.id === categoryId);
            if (nextCategory) {
              batch.set(doc(db, firestoreCollections.categories, categoryId), nextCategory);
            }
            if (previousCategory && updates.name && updates.name !== previousCategory.name) {
              nextProducts.forEach((product) => {
                if (product.category === updates.name) {
                  batch.set(doc(db, firestoreCollections.products, product.id), product);
                }
              });
            }
            await batch.commit();
            return;
          }
        }

        setCategories(nextCategories);
        if (nextProducts !== products) {
          setProducts(nextProducts);
        }
        persistCurrentMockStore({ categories: nextCategories, products: nextProducts });
      },
      deleteCategory: async (categoryId) => {
        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await deleteDoc(doc(db, firestoreCollections.categories, categoryId));
            return;
          }
        }

        const nextCategories = categories.filter((category) => category.id !== categoryId);
        setCategories(nextCategories);
        persistCurrentMockStore({ categories: nextCategories });
      },
      addOrder: async (order) => {
        const nextReceipt: FirestorePaymentReceipt | null =
          order.receiptFileName || order.receiptPreviewUrl
            ? {
                id: `receipt-${order.id}`,
                orderId: order.id,
                customerId: order.customerId,
                fileName: order.receiptFileName ?? `${order.id}-receipt`,
                fileUrl: order.receiptPreviewUrl ?? "",
                status: order.paymentStatus === "Paid" ? "Verified" : "Pending",
                createdAt: order.paymentReceipt?.uploadedAt ?? order.createdAt,
                updatedAt: order.paymentReceipt?.uploadedAt ?? order.createdAt
              }
            : null;

        // 2. Create Customer Success Notification in history
        try {
          const { error: customerOrderNotificationError } = await supabaseClient.from("notifications").insert({
            title: "Order placed successfully!",
            message: "Your order has been received and is now being processed.",
            type: "order",
            is_read: false,
            related_id: order.id,
            related_type: "order",
            recipient_id: order.customerId
          });
          if (customerOrderNotificationError) {
            console.error("Failed to create customer order notification:", customerOrderNotificationError);
          }
        } catch (notificationError) {
          console.error("Failed to create customer order notification:", notificationError);
        }

        // Helper to check and trigger low stock alerts
        const triggerLowStockNotification = async (prod: Product) => {
          try {
            const { data } = await supabaseClient
              .from("notifications")
              .select("id")
              .eq("type", "low_stock")
              .eq("related_id", prod.id)
              .eq("is_read", false);

            if (data && data.length > 0) return; // duplicate prevention

            await supabaseClient.from("notifications").insert({
              title: "Low Stock Alert",
              message: `Product "${prod.productName}" is low in stock (${prod.stockQuantity} remaining).`,
              type: "system",
              is_read: false,
              related_id: prod.id,
              related_type: "product",
              recipient_id: null
            });
          } catch (e) {
            console.error("Failed to trigger low stock notification:", e);
          }
        };

        // 3. Deduct stock levels and check for low stock
        const updatedProducts = products.map((product) => {
          let productChanged = false;
          const updatedVariants = product.variants.map((variant) => {
            const orderItem = order.items.find(
              (item) =>
                item.productName === product.productName &&
                item.size === variant.size &&
                item.color === variant.colorName
            );
            if (orderItem) {
              productChanged = true;
              return {
                ...variant,
                stockQuantity: Math.max(0, variant.stockQuantity - orderItem.quantity)
              };
            }
            return variant;
          });

          if (productChanged) {
            const updatedProduct = normalizeProduct({
              ...product,
              variants: updatedVariants
            });
            if (updatedProduct.stockQuantity <= updatedProduct.minStockLevel) {
              void triggerLowStockNotification(updatedProduct);
            }
            return updatedProduct;
          }
          return product;
        });

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            const batch = writeBatch(db);
            batch.set(doc(db, firestoreCollections.orders, order.id), order);
            if (nextReceipt) {
              batch.set(doc(db, firestoreCollections.paymentReceipts, nextReceipt.id), nextReceipt);
            }
            updatedProducts.forEach((prod) => {
              batch.set(doc(db, firestoreCollections.products, prod.id), prod);
            });
            await batch.commit();
            const notification = await insertAdminNotification({
              title: "New Order",
              message: `Order #${order.id} was placed by ${order.customerName}.`,
              type: "order",
              relatedId: order.id,
              relatedType: "order"
            });
            if (notification) setNotifications((previous) => [mapSupabaseNotification(notification), ...previous]);
            return;
          }
        }

        setProducts(updatedProducts);
        const nextOrders = [order, ...orders];
        const nextPaymentReceipts = nextReceipt ? [nextReceipt, ...paymentReceipts] : paymentReceipts;
        setOrders(nextOrders);
        setPaymentReceipts(nextPaymentReceipts);
        persistCurrentMockStore({
          orders: nextOrders,
          paymentReceipts: nextPaymentReceipts,
          products: updatedProducts
        });
        const notification = await insertAdminNotification({
          title: "New Order",
          message: `Order #${order.id} was placed by ${order.customerName}.`,
          type: "order",
          relatedId: order.id,
          relatedType: "order"
        });
        if (notification) setNotifications((previous) => [mapSupabaseNotification(notification), ...previous]);
      },
      updateOrder: async (orderId, updates) => {
        const existingOrder = orders.find((order) => order.id === orderId);
        if (!existingOrder) {
          throw new Error("Order not found");
        }

        const nextOrder = {
          ...existingOrder,
          ...updates,
          invoice: {
            ...existingOrder.invoice,
            ...(updates.invoice ?? {})
          }
        };
        const nextOrders = orders.map((order) => (order.id === orderId ? nextOrder : order));

        // Helper to trigger customer status notifications
        const createCustomerStatusNotification = async (ord: Order, newStatus: string) => {
          let title = "";
          let message = "";

          switch (newStatus) {
            case "Pending":
              title = "✔️ Order is pending verification";
              message = `Your order ${ord.id} is pending verification and will be processed shortly.`;
              break;
            case "Processing":
              title = "⚙️ Your order is being processed";
              message = `Great news! Your order ${ord.id} is now being processed and prepared for shipping.`;
              break;
            case "Dispatched":
            case "Shipped":
              title = "📦 Your order has been shipped";
              message = "Track your package from your Orders page.";
              break;
            case "Delivered":
              title = "🏠 Your order has been delivered";
              message = `Your order ${ord.id} has been delivered. We hope you love your new Berry Clothing item(s)!`;
              break;
            case "Cancelled":
              title = "❌ Your order has been cancelled";
              message = `Your order ${ord.id} has been cancelled. If you have questions, please reach out to our support.`;
              break;
            case "Completed":
              title = "🎉 Your order has been completed";
              message = "Thank you for shopping with Berry Clothing.";
              break;
            default:
              return;
          }

          try {
            // Prevent duplicate notifications
            const { data } = await supabaseClient
              .from("notifications")
              .select("id")
              .eq("recipient_id", ord.customerId)
              .eq("related_id", ord.id)
              .eq("title", title);

            if (data && data.length > 0) return;

            await supabaseClient.from("notifications").insert({
              title,
              message,
              type: "order_status_update",
              is_read: false,
              related_id: ord.id,
              related_type: "order",
              recipient_id: ord.customerId
            });
          } catch (e) {
            console.error("Failed to create customer status notification:", e);
          }
        };

        // Trigger customer status notification
        if (updates.status && updates.status !== existingOrder.status) {
          void createCustomerStatusNotification(nextOrder, updates.status);
        }

        // Trigger Payment Received admin notification
        if (updates.paymentStatus === "Paid" && existingOrder.paymentStatus !== "Paid") {
          void supabaseClient.from("notifications").insert({
            title: "Payment Received",
            message: `Payment received and verified for order ${existingOrder.id}.`,
            type: "payment",
            is_read: false,
            related_id: existingOrder.id,
            related_type: "order",
            recipient_id: null
          });
        }

        // Trigger Order Cancelled admin notification
        if (updates.status === "Cancelled" && existingOrder.status !== "Cancelled") {
          void supabaseClient.from("notifications").insert({
            title: "Order Cancelled",
            message: `Order ${existingOrder.id} has been cancelled by administrator.`,
            type: "order",
            is_read: false,
            related_id: existingOrder.id,
            related_type: "order",
            recipient_id: null
          });
        }

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.orders, orderId), nextOrder);
            return;
          }
        }

        setOrders(nextOrders);
        persistCurrentMockStore({ orders: nextOrders });
      },
      addCustomer: async (customer) => {
        const nextCustomers = [customer, ...customers];

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.customers, customer.id), customer);
            const notification = await insertAdminNotification({
              title: "New Customer",
              message: `${customer.name} created a new account.`,
              type: "customer",
              relatedId: customer.id,
              relatedType: "customer"
            });
            if (notification) setNotifications((previous) => [mapSupabaseNotification(notification), ...previous]);
            return;
          }
        }

        setCustomers(nextCustomers);
        persistCurrentMockStore({ customers: nextCustomers });
        const notification = await insertAdminNotification({
          title: "New Customer",
          message: `${customer.name} created a new account.`,
          type: "customer",
          relatedId: customer.id,
          relatedType: "customer"
        });
        if (notification) setNotifications((previous) => [mapSupabaseNotification(notification), ...previous]);
      },
      updateCustomer: async (customerId, updates) => {
        const existingCustomer = customers.find((customer) => customer.id === customerId);
        if (!existingCustomer) {
          return;
        }

        const nextCustomer = { ...existingCustomer, ...updates };
        const nextCustomers = customers.map((customer) => (customer.id === customerId ? nextCustomer : customer));

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.customers, customerId), nextCustomer);
            return;
          }
        }

        setCustomers(nextCustomers);
        persistCurrentMockStore({ customers: nextCustomers });
      },
      setInventoryMovements: async (movements) => {
        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            const batch = writeBatch(db);
            movements.forEach((movement) => {
              batch.set(doc(db, firestoreCollections.inventoryMovements, movement.id), movement);
            });
            await batch.commit();
            return;
          }
        }

        setInventoryMovementsState(movements);
        persistCurrentMockStore({ inventoryMovements: movements });
      },
      addUser: async (user) => {
        const nextUsers = [user, ...users];

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.users, user.id), user);
            return;
          }
        }

        setUsers(nextUsers);
        persistCurrentMockStore({ users: nextUsers });
      },
      updateUser: async (userId, updates) => {
        const existingUser = users.find((user) => user.id === userId);
        if (!existingUser) {
          return;
        }

        const nextUser = { ...existingUser, ...updates, updatedAt: new Date().toISOString() };
        const nextUsers = users.map((user) => (user.id === userId ? nextUser : user));

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.users, userId), nextUser);
            return;
          }
        }

        setUsers(nextUsers);
        persistCurrentMockStore({ users: nextUsers });
      },
      updateUserStatus: async (userId, status) => {
        const existingUser = users.find((user) => user.id === userId);
        if (!existingUser) {
          return;
        }

        const nextUser = { ...existingUser, status, updatedAt: new Date().toISOString() };
        const nextUsers = users.map((user) => (user.id === userId ? nextUser : user));

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.users, userId), nextUser);
            return;
          }
        }

        setUsers(nextUsers);
        persistCurrentMockStore({ users: nextUsers });
      },
      resetUserPassword: async (userId, nextPassword) => {
        const existingUser = users.find((user) => user.id === userId);
        if (!existingUser) {
          return;
        }

        const nextUser = {
          ...existingUser,
          password: nextPassword,
          updatedAt: new Date().toISOString()
        };
        const nextUsers = users.map((user) => (user.id === userId ? nextUser : user));

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.users, userId), nextUser);
            return;
          }
        }

        setUsers(nextUsers);
        persistCurrentMockStore({ users: nextUsers });
      },
      deleteUser: async (userId) => {
        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await deleteDoc(doc(db, firestoreCollections.users, userId));
            return;
          }
        }

        const nextUsers = users.filter((user) => user.id !== userId);
        setUsers(nextUsers);
        persistCurrentMockStore({ users: nextUsers });
      },
      addRole: async (role) => {
        const nextRoles = [role, ...roles];

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.roles, role.id), role);
            return;
          }
        }

        setRoles(nextRoles);
        persistCurrentMockStore({ roles: nextRoles });
      },
      updateRole: async (roleId, updates) => {
        const existingRole = roles.find((role) => role.id === roleId);
        if (!existingRole) {
          return;
        }

        const nextRole = { ...existingRole, ...updates, updatedAt: new Date().toISOString() };
        const nextRoles = roles.map((role) => (role.id === roleId ? nextRole : role));

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.roles, roleId), nextRole);
            return;
          }
        }

        setRoles(nextRoles);
        persistCurrentMockStore({ roles: nextRoles });
      },
      addActivityLog: async (entry) => {
        const nextEntry: AdminActivityLogEntry = {
          id: `act-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...entry
        };
        const nextEntries = sortByCreatedAt([nextEntry, ...activityLog]);
        setActivityLog(nextEntries);
        persistCurrentMockStore({ activityLog: nextEntries });
      },
      addNotification: async (notification) => {
        try {
          const payload = {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            is_read: false,
            related_id: notification.relatedId || null,
            related_type: notification.relatedType || null,
            recipient_id: notification.recipientId || null
          };
          const { data, error } = await supabaseClient.from("notifications").insert(payload).select().single();
          if (error) {
            console.error("Error inserting notification to Supabase:", error);
            return;
          }
          if (data?.recipient_id == null) {
            setNotifications((previous) => [
              {
                id: data.id,
                title: data.title,
                message: data.message,
                type: data.type,
                isRead: data.is_read,
                createdAt: data.created_at,
                relatedId: data.related_id,
                relatedType: data.related_type
              },
              ...previous.filter((entry) => entry.id !== data.id)
            ]);
          }
        } catch (e) {
          console.error("Failed to add notification:", e);
        }
      },
      markNotificationRead: async (notificationId) => {
        try {
          const { error } = await supabaseClient
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notificationId);
          if (error) {
            console.error("Error marking notification read in Supabase:", error);
          } else {
            // Update local state immediately for faster UI feedback
            setNotifications((prev) =>
              prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
          }
        } catch (e) {
          console.error("Failed to mark notification as read:", e);
        }
      }
    }),
    [
      activityLog,
      categories,
      customers,
      dataMode,
      inventoryMovements,
      isReady,
      notifications,
      orders,
      paymentReceipts,
      permissions,
      products,
      roles,
      users
    ]
  );

  return <CommerceStoreContext.Provider value={value}>{children}</CommerceStoreContext.Provider>;
}

export function useCommerceStore() {
  const context = useContext(CommerceStoreContext);
  if (!context) {
    throw new Error("useCommerceStore must be used within CommerceStoreProvider");
  }
  return context;
}

export { getAvailabilityStatus, getDefaultStore, normalizeProduct };

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  addNotification: (notification: Omit<AdminNotification, "id" | "createdAt">) => Promise<void>;
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

export function CommerceStoreProvider({ children }: PropsWithChildren) {
  const defaults = getDefaultStore();
  const [isReady, setIsReady] = useState(false);
  const [dataMode, setDataMode] = useState<DataMode>("mock");
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
  const [notifications, setNotifications] = useState<AdminNotification[]>(defaults.notifications);
  const [activityLog, setActivityLog] = useState<AdminActivityLogEntry[]>(defaults.activityLog);

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
      setNotifications(sortByCreatedAt(nextStore.notifications));
      setActivityLog(sortByCreatedAt(nextStore.activityLog));
      setDataMode("mock");
      setIsReady(true);

      void fetchCloudinaryProductImages().then((cloudinaryImages) => {
        if (cancelled || cloudinaryImages.length === 0) {
          return;
        }

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
        setNotifications(sortByCreatedAt(readPersistedStore().notifications));
        setActivityLog(sortByCreatedAt(readPersistedStore().activityLog));
        setDataMode("firestore");
        setIsReady(true);

        void fetchCloudinaryProductImages().then((cloudinaryImages) => {
          if (cancelled || cloudinaryImages.length === 0) {
            return;
          }

          setProducts((currentProducts) =>
            applyCloudinaryProductImages(currentProducts, cloudinaryImages).map(normalizeProduct)
          );
        });

        unsubscribes = [
          onSnapshot(collection(db, firestoreCollections.products), (snapshot) => {
            if (cancelled) return;
            setProducts(
              snapshot.docs
                .map((entry) => ({
                  id: entry.id,
                  ...(entry.data() as Omit<Product, "id">)
                }))
                .map(normalizeProduct)
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

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            const batch = writeBatch(db);
            batch.set(doc(db, firestoreCollections.orders, order.id), order);
            if (nextReceipt) {
              batch.set(doc(db, firestoreCollections.paymentReceipts, nextReceipt.id), nextReceipt);
            }
            await batch.commit();
            return;
          }
        }

        const nextOrders = [order, ...orders];
        const nextPaymentReceipts = nextReceipt ? [nextReceipt, ...paymentReceipts] : paymentReceipts;
        setOrders(nextOrders);
        setPaymentReceipts(nextPaymentReceipts);
        persistCurrentMockStore({ orders: nextOrders, paymentReceipts: nextPaymentReceipts });
      },
      addCustomer: async (customer) => {
        const nextCustomers = [customer, ...customers];

        if (dataMode === "firestore") {
          const db = getFirestoreDb();
          if (db) {
            await setDoc(doc(db, firestoreCollections.customers, customer.id), customer);
            return;
          }
        }

        setCustomers(nextCustomers);
        persistCurrentMockStore({ customers: nextCustomers });
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
        const nextNotification: AdminNotification = {
          id: `not-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...notification
        };
        const nextNotifications = sortByCreatedAt([nextNotification, ...notifications]);
        setNotifications(nextNotifications);
        persistCurrentMockStore({ notifications: nextNotifications });
      },
      markNotificationRead: async (notificationId) => {
        const nextNotifications = notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        );
        setNotifications(nextNotifications);
        persistCurrentMockStore({ notifications: nextNotifications });
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

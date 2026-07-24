"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { mockActivityLog, mockNotificationCenter } from "@/data/mockBusiness";
import { mockCategories } from "@/data/mockCategories";
import { mockCustomers } from "@/data/mockCustomers";
import { mockInventoryMovements } from "@/data/mockInventory";
import { mockOrders } from "@/data/mockOrders";
import { mockPermissions, type MockPermissionEntry } from "@/data/mockPermissions";
import { mockProducts } from "@/data/mockProducts";
import { mockRoles, mockUsers } from "@/data/mockUsers";
import { calculateDiscountedPrice } from "@/lib/product";
import { supabaseClient } from "@/lib/supabase-client";
import type { AdminActivityLogEntry, AdminNotification } from "@/types/admin";
import type { Customer } from "@/types/customer";
import type { InventoryMovement } from "@/types/inventory";
import type { Order } from "@/types/order";
import type { Category, Product, ProductAvailabilityStatus } from "@/types/product";
import type { AdminUser, Role } from "@/types/user";

type PaymentReceipt = {
  id: string;
  orderId: string;
  customerId: string;
  fileName: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CollectionName =
  | "products"
  | "categories"
  | "orders"
  | "inventory_movements"
  | "users"
  | "customers"
  | "roles"
  | "permissions"
  | "payment_receipts";

interface CommerceStoreState {
  isReady: boolean;
  dataMode: "supabase";
  products: Product[];
  categories: Category[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  users: AdminUser[];
  customers: Customer[];
  roles: Role[];
  permissions: MockPermissionEntry[];
  paymentReceipts: PaymentReceipt[];
  notifications: AdminNotification[];
  activityLog: AdminActivityLogEntry[];
  activeCategories: Category[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  setInventoryMovements: (movements: InventoryMovement[]) => Promise<void>;
  addUser: (user: AdminUser) => Promise<void>;
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  updateUserStatus: (id: string, status: AdminUser["status"]) => Promise<void>;
  resetUserPassword: (id: string, password: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addRole: (role: Role) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
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
  markNotificationRead: (id: string) => Promise<void>;
}

const StoreContext = createContext<CommerceStoreState | undefined>(undefined);
const seededMarkerId = "__berry_seeded__";
const deletedRecordsStoragePrefix = "berry-deleted-store-records";

const defaults = {
  products: mockProducts,
  categories: mockCategories,
  orders: mockOrders,
  inventoryMovements: mockInventoryMovements,
  users: mockUsers,
  customers: mockCustomers,
  roles: mockRoles,
  permissions: mockPermissions,
  paymentReceipts: [] as PaymentReceipt[],
  notifications: mockNotificationCenter,
  activityLog: mockActivityLog
};

export function getAvailabilityStatus(stock: number, minimum: number): ProductAvailabilityStatus {
  return stock <= 0 ? "Out of Stock" : stock <= minimum ? "Low Stock" : "In Stock";
}

function availability(stock: number, minimum: number): ProductAvailabilityStatus {
  return getAvailabilityStatus(stock, minimum);
}

export function createProductId(productName: string) {
  return `prod-${Date.now()}-${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

export function getDefaultStore() {
  return defaults;
}

function normalizeProduct(product: Product): Product {
  const stockQuantity = product.variants.reduce((total, variant) => total + variant.stockQuantity, 0);
  const originalPrice = product.originalPrice ?? product.price;
  const discountPercentage =
    product.discountPercentage ??
    (product.discountPrice && product.discountPrice < originalPrice
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0);
  const discountedPrice =
    product.isDiscounted || discountPercentage > 0
      ? product.discountedPrice ?? product.discountPrice ?? calculateDiscountedPrice(originalPrice, discountPercentage)
      : undefined;

  return {
    ...product,
    originalPrice,
    discountPercentage,
    discountedPrice,
    discountPrice: discountedPrice,
    isDiscounted: Boolean(discountedPrice && discountedPrice < originalPrice),
    isSaleItem: Boolean(product.isSaleItem || (discountedPrice && discountedPrice < originalPrice)),
    stockQuantity,
    availabilityStatus: availability(stockQuantity, product.minStockLevel)
  };
}

function notificationFromRow(row: any): AdminNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
    relatedId: row.related_id,
    relatedType: row.related_type
  };
}

function isStorageSchemaError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST205" ||
    error?.code === "42703" ||
    error?.code === "22P02" ||
    error?.code === "42P10" ||
    error?.code === "PGRST204" ||
    error?.message?.includes("schema cache")
  );
}

function getDeletedRecordStorageKey(table: CollectionName) {
  return `${deletedRecordsStoragePrefix}:${table}`;
}

function readLocalDeletedRecordIds(table: CollectionName) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(getDeletedRecordStorageKey(table));
    const values = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(values.filter(Boolean));
  } catch {
    return new Set<string>();
  }
}

function rememberLocalDeletedRecord(table: CollectionName, id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readLocalDeletedRecordIds(table);
  current.add(id);
  window.localStorage.setItem(getDeletedRecordStorageKey(table), JSON.stringify([...current]));
}

function forgetLocalDeletedRecord(table: CollectionName, id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readLocalDeletedRecordIds(table);
  current.delete(id);
  window.localStorage.setItem(getDeletedRecordStorageKey(table), JSON.stringify([...current]));
}

async function readDeletedRecordIds(table: CollectionName) {
  const deletedIds = readLocalDeletedRecordIds(table);
  const { data, error } = await supabaseClient
    .from("deleted_store_records")
    .select("app_id")
    .eq("table_name", table);

  if (!error && data) {
    data.forEach((row: any) => {
      if (row.app_id) {
        deletedIds.add(row.app_id);
      }
    });
  } else if (error && !isStorageSchemaError(error)) {
    console.error(`Unable to load deleted ${table} records.`, error);
  }

  return deletedIds;
}

async function rememberDeletedRecord(table: CollectionName, id: string) {
  rememberLocalDeletedRecord(table, id);

  const { error } = await supabaseClient
    .from("deleted_store_records")
    .upsert(
      { table_name: table, app_id: id, deleted_at: new Date().toISOString() },
      { onConflict: "table_name,app_id" }
    );

  if (error && !isStorageSchemaError(error)) {
    throw error;
  }
}

async function forgetDeletedRecord(table: CollectionName, id: string) {
  forgetLocalDeletedRecord(table, id);

  const { error } = await supabaseClient
    .from("deleted_store_records")
    .delete()
    .eq("table_name", table)
    .eq("app_id", id);

  if (error && !isStorageSchemaError(error)) {
    throw error;
  }
}

function filterDeletedRecords<T extends { id: string }>(records: T[], deletedIds: Set<string>) {
  if (!deletedIds.size) {
    return records;
  }

  return records.filter((record) => !deletedIds.has(record.id));
}

function getMissingRequiredColumn(error: { code?: string; message?: string } | null) {
  if (error?.code !== "23502") {
    return null;
  }

  return error.message?.match(/null value in column "([^"]+)"/)?.[1] ?? null;
}

function getLegacyColumnValue(value: Record<string, unknown>, column: string): unknown {
  const firstImage = Array.isArray(value.images) ? value.images[0] : undefined;
  const imageUrl =
    typeof firstImage === "object" && firstImage && "url" in firstImage && typeof firstImage.url === "string"
      ? firstImage.url
      : undefined;

  const candidates: Record<string, unknown> = {
    name: value.productName ?? value.name ?? value.fullName ?? value.username ?? value.id,
    full_name: value.fullName ?? value.name ?? value.username ?? value.id,
    title: value.productName ?? value.name ?? value.fullName ?? value.id,
    sku: value.sku ?? value.id,
    description: value.description ?? "",
    price: value.price ?? value.total ?? 0,
    stock: value.stockQuantity ?? 0,
    stock_quantity: value.stockQuantity ?? 0,
    category: value.category ?? "Uncategorized",
    image: value.mainImage ?? imageUrl ?? "",
    image_url: value.mainImage ?? imageUrl ?? "",
    email: value.email ?? `${String(value.id)}@berryclothing.local`,
    username: value.username ?? value.id,
    phone: value.phone ?? "",
    status: value.status ?? "Active",
    role: value.role ?? "admin",
    total: value.total ?? 0,
    customer_name: value.customerName ?? value.name ?? "Customer"
  };

  return candidates[column];
}

async function deleteProductCloudinaryAssets(product?: Product) {
  if (!product?.images?.length) {
    return;
  }

  await Promise.all(
    product.images.map(async (image) => {
      if (!image.id.startsWith("berry-clothing/products/")) {
        return;
      }

      try {
        const url = `/api/product-images?publicId=${encodeURIComponent(image.id)}&resourceType=${image.resourceType ?? "image"}`;
        const response = await fetch(url, { method: "DELETE" });
        if (!response.ok) {
          throw new Error(await response.text());
        }
      } catch (error) {
        console.error("Failed to delete product asset from Cloudinary:", error);
      }
    })
  );
}

async function seedRecords<T extends { id: string }>(table: CollectionName, fallback: T[]) {
  try {
    await Promise.all(fallback.map((entry) => writeRecord(table, entry)));
    await writeRecord(table, {
      id: seededMarkerId,
      seededAt: new Date().toISOString()
    } as unknown as T);
    return true;
  } catch (error) {
    console.error(`Unable to seed ${table}. Run the latest Supabase migrations.`, error);
    return false;
  }
}

async function readRecords<T extends { id: string }>(table: CollectionName, fallback: T[]): Promise<T[]> {
  const deletedIds = await readDeletedRecordIds(table);
  const { data, error } = await supabaseClient.from(table).select("app_id,data").not("app_id", "is", null);

  if (!error && data) {
    const realRows = data.filter(
      (row: any) => row.app_id !== seededMarkerId && row.data && typeof row.data === "object"
    );
    const hasSeedMarker = data.some((row: any) => row.app_id === seededMarkerId);

    if (realRows.length) {
      return filterDeletedRecords(realRows.map((row: any) => row.data ?? row) as T[], deletedIds);
    }

    if (!hasSeedMarker) {
      const filteredFallback = filterDeletedRecords(fallback, deletedIds);
      const seeded = await seedRecords(table, filteredFallback);
      return seeded || process.env.NODE_ENV !== "production" ? filteredFallback : [];
    }

    return [];
  }

  if (error && !isStorageSchemaError(error)) {
    console.error(`Unable to load ${table} from Supabase.`, error);
  }

  const legacy = await supabaseClient.from(table).select("id,data");
  if (!legacy.error && legacy.data?.length) {
    return filterDeletedRecords(legacy.data.map((row: any) => row.data ?? row) as T[], deletedIds);
  }

  return process.env.NODE_ENV !== "production" ? filterDeletedRecords(fallback, deletedIds) : [];
}

async function writeRecord<T extends { id: string }>(table: CollectionName, value: T) {
  try {
    await forgetDeletedRecord(table, value.id);
  } catch (error) {
    console.warn(`Unable to clear the deleted ${table} record marker.`, error);
  }

  const now = new Date().toISOString();
  const payload = { app_id: value.id, data: value, updated_at: now };
  const { data: existing, error: lookupError } = await supabaseClient
    .from(table)
    .select("id")
    .eq("app_id", value.id)
    .limit(1);

  if (!lookupError) {
    let legacyCompatiblePayload: Record<string, unknown> = payload;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const { error } = existing?.length
        ? await supabaseClient.from(table).update(legacyCompatiblePayload).eq("app_id", value.id)
        : await supabaseClient.from(table).insert(legacyCompatiblePayload);

      if (!error) {
        return;
      }

      const requiredColumn = getMissingRequiredColumn(error);
      const requiredValue = requiredColumn
        ? getLegacyColumnValue(value as unknown as Record<string, unknown>, requiredColumn)
        : undefined;

      if (!requiredColumn || requiredValue === undefined || requiredColumn in legacyCompatiblePayload) {
        if (!isStorageSchemaError(error)) {
          throw new Error(`Unable to save ${table}: ${error.message}`);
        }
        break;
      }

      legacyCompatiblePayload = {
        ...legacyCompatiblePayload,
        [requiredColumn]: requiredValue
      };
    }
  }

  if (lookupError && !isStorageSchemaError(lookupError)) {
    throw new Error(`Unable to save ${table}: ${lookupError.message}`);
  }

  const legacy = await supabaseClient.from(table).upsert({ id: value.id, data: value });
  if (legacy.error) {
    throw new Error(`Unable to save ${table}: ${legacy.error.message}. Apply the latest Supabase migration if this table uses a UUID id.`);
  }
}

async function removeRecord(table: CollectionName, id: string) {
  await rememberDeletedRecord(table, id);

  const { error } = await supabaseClient.from(table).delete().eq("app_id", id);

  if (!error) {
    return;
  }

  if (!isStorageSchemaError(error)) {
    throw error;
  }

  const legacy = await supabaseClient.from(table).delete().eq("id", id);
  if (legacy.error) {
    if (isStorageSchemaError(legacy.error)) {
      return;
    }

    throw legacy.error;
  }
}

async function insertAdminNotification(payload: {
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  relatedType?: string;
}) {
  try {
    const { data, error } = await supabaseClient
      .from("notifications")
      .insert({
        title: payload.title,
        message: payload.message,
        type: payload.type,
        is_read: false,
        related_id: payload.relatedId ?? null,
        related_type: payload.relatedType ?? null,
        recipient_id: null
      })
      .select()
      .single();

    if (error) {
      console.error(error);
    }

    return data;
  } catch (error) {
    console.error("Notification insert failed", error);
    return null;
  }
}

export function CommerceStoreProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(defaults.categories);
  const [orders, setOrders] = useState(defaults.orders);
  const [inventoryMovements, setInventoryMovementsState] = useState(defaults.inventoryMovements);
  const [users, setUsers] = useState(defaults.users);
  const [customers, setCustomers] = useState(defaults.customers);
  const [roles, setRoles] = useState(defaults.roles);
  const [permissions, setPermissions] = useState(defaults.permissions);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activityLog, setActivityLog] = useState(defaults.activityLog);

  useEffect(() => {
    let active = true;

    (async () => {
      const [
        nextProducts,
        nextCategories,
        nextOrders,
        nextMovements,
        nextUsers,
        nextCustomers,
        nextRoles,
        nextPermissions,
        nextReceipts
      ] = await Promise.all([
        readRecords("products", defaults.products),
        readRecords("categories", defaults.categories),
        readRecords("orders", defaults.orders),
        readRecords("inventory_movements", defaults.inventoryMovements),
        readRecords("users", defaults.users),
        readRecords("customers", defaults.customers),
        readRecords("roles", defaults.roles),
        readRecords("permissions", defaults.permissions),
        readRecords("payment_receipts", defaults.paymentReceipts)
      ]);

      if (!active) {
        return;
      }

      setProducts(nextProducts.map(normalizeProduct));
      setCategories(nextCategories);
      setOrders(nextOrders);
      setInventoryMovementsState(nextMovements);
      setUsers(nextUsers);
      setCustomers(nextCustomers);
      setRoles(nextRoles);
      setPermissions(nextPermissions);
      setPaymentReceipts(nextReceipts);
      setIsReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabaseClient
        .from("notifications")
        .select("*")
        .is("recipient_id", null)
        .order("created_at", { ascending: false });

      if (active && data) {
        setNotifications(data.map(notificationFromRow));
      }
    };

    void load();

    const channel = supabaseClient
      .channel("supabase-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        if (!active) {
          return;
        }

        if (payload.eventType === "INSERT" && payload.new.recipient_id == null) {
          setNotifications((current) => [notificationFromRow(payload.new), ...current]);
        }

        if (payload.eventType === "UPDATE") {
          setNotifications((current) =>
            payload.new.recipient_id == null
              ? current.map((item) => (item.id === payload.new.id ? notificationFromRow(payload.new) : item))
              : current.filter((item) => item.id !== payload.new.id)
          );
        }
      })
      .subscribe();

    return () => {
      active = false;
      void supabaseClient.removeChannel(channel);
    };
  }, []);

  const value = useMemo<CommerceStoreState>(() => {
    const persist = async <T extends { id: string }>(
      table: CollectionName,
      next: T[],
      setter: (value: T[]) => void
    ) => {
      setter(next);
      await Promise.all(next.map((entry) => writeRecord(table, entry)));
    };

    const addProduct = async (product: Product) => {
      const next = normalizeProduct(product);
      setProducts((current) => [next, ...current]);
      await writeRecord("products", next);
    };

    const updateProduct = async (id: string, product: Product) => {
      const next = normalizeProduct(product);
      setProducts((current) => current.map((entry) => (entry.id === id ? next : entry)));
      await writeRecord("products", next);
    };

    const deleteProduct = async (id: string) => {
      const previousProducts = products;
      const deletedProduct = products.find((entry) => entry.id === id);
      setProducts((current) => current.filter((entry) => entry.id !== id));

      try {
        await removeRecord("products", id);
        await deleteProductCloudinaryAssets(deletedProduct);
      } catch (error) {
        setProducts(previousProducts);
        throw error;
      }
    };

    const addCategory = async (category: Category) => {
      setCategories((current) => [category, ...current]);
      await writeRecord("categories", category);
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
      const next = { ...categories.find((entry) => entry.id === id)!, ...updates };
      setCategories((current) => current.map((entry) => (entry.id === id ? next : entry)));
      await writeRecord("categories", next);
    };

    const deleteCategory = async (id: string) => {
      setCategories((current) => current.filter((entry) => entry.id !== id));
      await removeRecord("categories", id);
    };

    const addOrder = async (order: Order) => {
      setOrders((current) => [order, ...current]);
      await writeRecord("orders", order);
      const adminNotification = await insertAdminNotification({
        title: "New Order",
        message: `Order #${order.id} was placed by ${order.customerName}.`,
        type: "order",
        relatedId: order.id,
        relatedType: "order"
      });
      if (adminNotification) {
        setNotifications((current) => [notificationFromRow(adminNotification), ...current]);
      }
    };

    const updateOrder = async (id: string, updates: Partial<Order>) => {
      const next = { ...orders.find((entry) => entry.id === id)!, ...updates };
      setOrders((current) => current.map((entry) => (entry.id === id ? next : entry)));
      await writeRecord("orders", next);
    };

    const addCustomer = async (customer: Customer) => {
      setCustomers((current) => [customer, ...current]);
      await writeRecord("customers", customer);
      const adminNotification = await insertAdminNotification({
        title: "New Customer",
        message: `${customer.name} created a new account.`,
        type: "customer",
        relatedId: customer.id,
        relatedType: "customer"
      });
      if (adminNotification) {
        setNotifications((current) => [notificationFromRow(adminNotification), ...current]);
      }
    };

    const updateCustomer = async (id: string, updates: Partial<Customer>) => {
      const next = { ...customers.find((entry) => entry.id === id)!, ...updates };
      setCustomers((current) => current.map((entry) => (entry.id === id ? next : entry)));
      await writeRecord("customers", next);
    };

    const setInventoryMovements = async (next: InventoryMovement[]) =>
      persist("inventory_movements", next, setInventoryMovementsState);

    const addUser = async (user: AdminUser) => {
      setUsers((current) => [user, ...current]);
      await writeRecord("users", user);
    };

    const updateUser = async (id: string, updates: Partial<AdminUser>) => {
      const next = { ...users.find((entry) => entry.id === id)!, ...updates };
      setUsers((current) => current.map((entry) => (entry.id === id ? next : entry)));
      await writeRecord("users", next);
    };

    const updateUserStatus = (id: string, status: AdminUser["status"]) => updateUser(id, { status });
    const resetUserPassword = (id: string, password: string) => updateUser(id, { password });

    const deleteUser = async (id: string) => {
      setUsers((current) => current.filter((entry) => entry.id !== id));
      await removeRecord("users", id);
    };

    const addRole = async (role: Role) => {
      setRoles((current) => [role, ...current]);
      await writeRecord("roles", role);
    };

    const updateRole = async (id: string, updates: Partial<Role>) => {
      const next = { ...roles.find((entry) => entry.id === id)!, ...updates };
      setRoles((current) => current.map((entry) => (entry.id === id ? next : entry)));
      await writeRecord("roles", next);
    };

    const addActivityLog = async (entry: Omit<AdminActivityLogEntry, "id" | "createdAt">) =>
      setActivityLog((current) => [
        { ...entry, id: `act-${Date.now()}`, createdAt: new Date().toISOString() },
        ...current
      ]);

    const addNotification = async (notification: {
      title: string;
      message: string;
      type: string;
      isRead?: boolean;
      relatedId?: string | null;
      relatedType?: string | null;
      recipientId?: string | null;
    }) => {
      const { data, error } = await supabaseClient
        .from("notifications")
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
          related_id: notification.relatedId ?? null,
          related_type: notification.relatedType ?? null,
          recipient_id: notification.recipientId ?? null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data.recipient_id == null) {
        setNotifications((current) => [notificationFromRow(data), ...current]);
      }
    };

    const markNotificationRead = async (id: string) => {
      await supabaseClient.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((current) => current.map((entry) => (entry.id === id ? { ...entry, isRead: true } : entry)));
    };

    return {
      isReady,
      dataMode: "supabase",
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
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrder,
      addCustomer,
      updateCustomer,
      setInventoryMovements,
      addUser,
      updateUser,
      updateUserStatus,
      resetUserPassword,
      deleteUser,
      addRole,
      updateRole,
      addActivityLog,
      addNotification,
      markNotificationRead
    };
  }, [
    isReady,
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
    activityLog
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCommerceStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useCommerceStore must be used within CommerceStoreProvider");
  }
  return context;
}

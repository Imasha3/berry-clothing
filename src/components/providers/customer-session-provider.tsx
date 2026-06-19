"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firestoreCollections, getFirestoreDb } from "@/lib/firestore";
import { loginWithEmail, logoutFirebaseUser, registerCustomer } from "@/lib/firebaseAuth";
import type { Customer, CustomerAddress } from "@/types/customer";

interface CustomerRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  password: string;
}

interface CustomerLoginPayload {
  email: string;
  password: string;
}

interface CustomerProfileUpdatePayload {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

interface CustomerSessionContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  customer: Customer | null;
  login: (payload?: CustomerLoginPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  register: (
    payload: CustomerRegistrationPayload
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateProfile: (
    payload: CustomerProfileUpdatePayload
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
}

interface StoredCustomerSession {
  customerId: string;
}

const authStorageKey = "berry-customer-session";
const CustomerSessionContext = createContext<CustomerSessionContextValue | undefined>(undefined);

function createCustomerId(email: string) {
  return `cus-${Date.now()}-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}`;
}

function createDefaultAddress(customer: Customer): CustomerAddress {
  return {
    id: `addr-${customer.id}`,
    label: "Home",
    recipientName: customer.name,
    phone: customer.phone,
    addressLine: customer.address,
    city: customer.city,
    district: customer.district,
    isDefault: true
  };
}

function normalizeDistrict(city: string) {
  return city.trim() || "Colombo";
}

async function readFirestoreCustomer(customerId: string) {
  const db = getFirestoreDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, firestoreCollections.customers, customerId));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as Customer;
}

async function persistFirestoreCustomer(customer: Customer) {
  const db = getFirestoreDb();
  if (!db) {
    return;
  }

  await setDoc(doc(db, firestoreCollections.customers, customer.id), customer);
}

export function CustomerSessionProvider({ children }: PropsWithChildren) {
  const { isReady: storeReady, customers, addCustomer, updateCustomer } = useCommerceStore();
  const [isReady, setIsReady] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [sessionCustomer, setSessionCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = globalThis.localStorage?.getItem(authStorageKey);
        if (!stored) {
          setIsReady(true);
          return;
        }

        const parsed = JSON.parse(stored) as StoredCustomerSession;
        setCurrentCustomerId(parsed.customerId);

        if (isFirebaseConfigured()) {
          const firestoreCustomer = await readFirestoreCustomer(parsed.customerId);
          if (firestoreCustomer) {
            setSessionCustomer(firestoreCustomer);
          }
        }
      } catch {
        globalThis.localStorage?.removeItem(authStorageKey);
      } finally {
        setIsReady(true);
      }
    };

    void loadSession();
  }, []);

  const storeCustomer = currentCustomerId
    ? customers.find((customer) => customer.id === currentCustomerId) ?? null
    : null;
  const customer = sessionCustomer ?? storeCustomer;
  const isAuthenticated = Boolean(customer && currentCustomerId);

  const persistSession = (customerId: string) => {
    setCurrentCustomerId(customerId);
    globalThis.localStorage?.setItem(authStorageKey, JSON.stringify({ customerId }));
  };

  const login: CustomerSessionContextValue["login"] = async (payload) => {
    if (!payload) {
      if (customers[0]) {
        persistSession(customers[0].id);
        setSessionCustomer(customers[0]);
        return { ok: true };
      }

      return { ok: false, message: "No customer account found." };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    if (isFirebaseConfigured()) {
      try {
        await loginWithEmail(normalizedEmail, payload.password);
        const matchedCustomer =
          customers.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
        if (!matchedCustomer) {
          return { ok: false, message: "Customer profile not found." };
        }

        persistSession(matchedCustomer.id);
        setSessionCustomer(matchedCustomer);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Login failed." };
      }
    }

    const matchedCustomer = customers.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
    if (!matchedCustomer) {
      return { ok: false, message: "No customer account found for this email." };
    }

    persistSession(matchedCustomer.id);
    setSessionCustomer(matchedCustomer);
    return { ok: true };
  };

  const register: CustomerSessionContextValue["register"] = async (payload) => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (customers.some((customer) => customer.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const district = normalizeDistrict(payload.city);
    const nextCustomer: Customer = {
      id: createCustomerId(normalizedEmail),
      name: payload.fullName.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      address: payload.address.trim(),
      city: payload.city.trim(),
      district,
      totalOrders: 0,
      totalSpending: 0,
      joinedAt: new Date().toISOString(),
      addresses: [],
      notifications: [],
      returnRequests: [],
      exchangeRequests: []
    };
    nextCustomer.addresses = [createDefaultAddress(nextCustomer)];

    try {
      if (isFirebaseConfigured()) {
        await registerCustomer(normalizedEmail, payload.password);
        await persistFirestoreCustomer(nextCustomer);
      }

      await addCustomer(nextCustomer);
      persistSession(nextCustomer.id);
      setSessionCustomer(nextCustomer);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Registration failed." };
    }
  };

  const updateProfile: CustomerSessionContextValue["updateProfile"] = async (payload) => {
    if (!customer) {
      return { ok: false, message: "Customer session not found." };
    }

    const district = normalizeDistrict(payload.city);
    const nextCustomer: Customer = {
      ...customer,
      name: payload.fullName.trim(),
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      district,
      address: payload.address.trim(),
      addresses: customer.addresses.length
        ? customer.addresses.map((address, index) =>
            index === 0
              ? {
                  ...address,
                  recipientName: payload.fullName.trim(),
                  phone: payload.phone.trim(),
                  addressLine: payload.address.trim(),
                  city: payload.city.trim(),
                  district
                }
              : address
          )
        : [createDefaultAddress({ ...customer, name: payload.fullName.trim(), phone: payload.phone.trim(), city: payload.city.trim(), district, address: payload.address.trim() })]
    };

    try {
      if (isFirebaseConfigured()) {
        await persistFirestoreCustomer(nextCustomer);
      }

      await updateCustomer(customer.id, nextCustomer);
      setSessionCustomer(nextCustomer);
      persistSession(nextCustomer.id);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Profile update failed." };
    }
  };

  const logout = async () => {
    setCurrentCustomerId(null);
    setSessionCustomer(null);
    globalThis.localStorage?.removeItem(authStorageKey);
    if (isFirebaseConfigured()) {
      await logoutFirebaseUser();
    }
  };

  const value = useMemo(
    () => ({
      isReady: isReady && storeReady,
      isAuthenticated,
      customer,
      login,
      register,
      updateProfile,
      logout
    }),
    [customer, isAuthenticated, isReady, storeReady]
  );

  return <CustomerSessionContext.Provider value={value}>{children}</CustomerSessionContext.Provider>;
}

export function useCustomerSession() {
  const context = useContext(CustomerSessionContext);
  if (!context) {
    throw new Error("useCustomerSession must be used within CustomerSessionProvider");
  }
  return context;
}

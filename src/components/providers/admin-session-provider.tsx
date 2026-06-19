"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  loginWithEmail,
  logoutFirebaseUser,
  registerSecondaryEmailPasswordUser
} from "@/lib/firebaseAuth";
import type { Permission } from "@/types/permission";
import type { AdminUser, Role, RoleKey } from "@/types/user";

interface LoginPayload {
  identifier: string;
  password: string;
}

interface AdminAccountPayload {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: RoleKey;
  status: "Active" | "Inactive";
}

interface SetupAdminPayload {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface AdminSessionContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  hasAdminAccounts: boolean;
  currentUser: AdminUser | null;
  currentRole: Role | null;
  login: (payload: LoginPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  createInitialAdmin: (
    payload: SetupAdminPayload
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  createAdminAccount: (
    payload: AdminAccountPayload
  ) => Promise<{ ok: true; user: AdminUser } | { ok: false; message: string }>;
  hasPermission: (permission: Permission) => boolean;
}

const authStorageKey = "berry-admin-session-user";
const AdminSessionContext = createContext<AdminSessionContextValue | undefined>(undefined);

function buildAvatar(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createLocalAdminUserId(email: string) {
  return `usr-${Date.now()}-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}`;
}

function normalizeAdminPayload<T extends { fullName: string; username: string; email: string; phone: string }>(
  payload: T
) {
  return {
    ...payload,
    fullName: payload.fullName.trim(),
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim()
  };
}

function validateAccountFields(
  payload: Pick<AdminAccountPayload, "fullName" | "username" | "email" | "phone" | "password">
) {
  if (!payload.fullName || !payload.username || !payload.email || !payload.phone || !payload.password) {
    return "Please complete all account fields.";
  }

  return null;
}

function canCreateRole(currentUser: AdminUser | null, role: RoleKey) {
  if (!currentUser || !currentUser.canManageUsers) {
    return false;
  }

  if (currentUser.isSuperAdmin) {
    return role === "admin" || role === "order-staff" || role === "inventory-staff" || role === "marketing-staff";
  }

  return role === "order-staff" || role === "inventory-staff" || role === "marketing-staff";
}

export function AdminSessionProvider({ children }: PropsWithChildren) {
  const { isReady: storeReady, roles, users, addUser, updateUser } = useCommerceStore();
  const [isReady, setIsReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = globalThis.localStorage?.getItem(authStorageKey);
    setCurrentUserId(storedUserId);
    setIsReady(true);
  }, []);

  const hasAdminAccounts = users.length > 0;
  const currentUser =
    currentUserId && users.length ? users.find((user) => user.id === currentUserId) ?? null : null;
  const currentRole =
    currentUser && roles.length ? roles.find((role) => role.key === currentUser.role) ?? null : null;
  const isAuthenticated = Boolean(currentUser && currentUser.status === "Active" && currentRole);

  const persistSession = (userId: string) => {
    setCurrentUserId(userId);
    // Temporary local session cache for mock mode and client-side admin auth flows.
    // Firebase Auth / Firestore can replace this fully once a backend-managed admin auth flow exists.
    globalThis.localStorage?.setItem(authStorageKey, userId);
  };

  const login: AdminSessionContextValue["login"] = async ({ identifier, password }) => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = users.find(
      (entry) =>
        entry.email.toLowerCase() === normalizedIdentifier ||
        entry.username.toLowerCase() === normalizedIdentifier
    );

    if (!user) {
      return { ok: false, message: "Invalid username/email or password." };
    }

    if (user.status !== "Active") {
      return { ok: false, message: "This admin account is inactive. Please contact Super Admin." };
    }

    try {
      if (isFirebaseConfigured()) {
        await loginWithEmail(user.email, password);
      } else if (user.password !== password) {
        return { ok: false, message: "Invalid username/email or password." };
      }

      persistSession(user.id);
      await updateUser(user.id, { lastLoginAt: new Date().toISOString() });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? "Invalid username/email or password." : "Login failed."
      };
    }
  };

  const createAdminAccount: AdminSessionContextValue["createAdminAccount"] = async (payload) => {
    const normalized = normalizeAdminPayload(payload);
    const validationError = validateAccountFields(normalized);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    if (!canCreateRole(currentUser, normalized.role)) {
      return { ok: false, message: "This account cannot create the selected role." };
    }

    const duplicateUser = users.find(
      (user) =>
        user.email.toLowerCase() === normalized.email || user.username.toLowerCase() === normalized.username.toLowerCase()
    );
    if (duplicateUser) {
      return { ok: false, message: "Username or email is already in use by another account." };
    }

    try {
      const nextId = isFirebaseConfigured()
        ? await registerSecondaryEmailPasswordUser(normalized.email, normalized.password)
        : createLocalAdminUserId(normalized.email);
      const now = new Date().toISOString();
      const nextUser: AdminUser = {
        id: nextId,
        fullName: normalized.fullName,
        username: normalized.username,
        email: normalized.email,
        phone: normalized.phone,
        role: normalized.role,
        password: isFirebaseConfigured() ? "" : normalized.password,
        status: normalized.status,
        canManageUsers: normalized.role === "admin",
        canManageRoles: normalized.role === "admin" && currentUser?.canManageRoles === true,
        canDeleteUsers: false,
        isSuperAdmin: false,
        avatar: buildAvatar(normalized.fullName),
        createdAt: now,
        updatedAt: now
      };

      await addUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Account creation failed."
      };
    }
  };

  const createInitialAdmin: AdminSessionContextValue["createInitialAdmin"] = async (payload) => {
    if (hasAdminAccounts) {
      return { ok: false, message: "An admin account already exists." };
    }

    const normalized = normalizeAdminPayload({ ...payload, role: "super-admin", status: "Active" });
    const validationError = validateAccountFields(normalized);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const duplicateUser = users.find(
      (user) =>
        user.email.toLowerCase() === normalized.email || user.username.toLowerCase() === normalized.username.toLowerCase()
    );
    if (duplicateUser) {
      return { ok: false, message: "Username or email is already in use by another account." };
    }

    try {
      const nextId = isFirebaseConfigured()
        ? await registerSecondaryEmailPasswordUser(normalized.email, normalized.password)
        : createLocalAdminUserId(normalized.email);
      const now = new Date().toISOString();
      const nextUser: AdminUser = {
        id: nextId,
        fullName: normalized.fullName,
        username: normalized.username,
        email: normalized.email,
        phone: normalized.phone,
        role: "super-admin",
        password: isFirebaseConfigured() ? "" : normalized.password,
        status: "Active",
        canManageUsers: true,
        canManageRoles: true,
        canDeleteUsers: true,
        isSuperAdmin: true,
        avatar: buildAvatar(normalized.fullName),
        createdAt: now,
        updatedAt: now
      };

      await addUser(nextUser);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Initial admin setup failed."
      };
    }
  };

  const logout = async () => {
    setCurrentUserId(null);
    globalThis.localStorage?.removeItem(authStorageKey);
    if (isFirebaseConfigured()) {
      await logoutFirebaseUser();
    }
  };

  const hasPermissionForCurrentUser = (permission: Permission) => {
    if (!currentRole) {
      return false;
    }
    return currentRole.permissions.includes(permission);
  };

  const value = useMemo(
    () => ({
      isReady: isReady && storeReady,
      isAuthenticated,
      hasAdminAccounts,
      currentUser,
      currentRole,
      login,
      logout,
      createInitialAdmin,
      createAdminAccount,
      hasPermission: hasPermissionForCurrentUser
    }),
    [createAdminAccount, createInitialAdmin, currentRole, currentUser, hasAdminAccounts, isAuthenticated, isReady, storeReady]
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return context;
}

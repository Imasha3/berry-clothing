"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/types/permission";

export function PermissionGuard({
  permission,
  fallback,
  children
}: PropsWithChildren<{ permission: Permission; fallback?: ReactNode }>) {
  const { currentRole } = useAdminSession();

  if (!currentRole || !hasPermission(currentRole, permission)) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/components/providers/admin-session-provider";

export default function AdminIndexPage() {
  const router = useRouter();
  const { isReady, isAuthenticated, hasAdminAccounts } = useAdminSession();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!hasAdminAccounts) {
      router.replace("/admin/setup");
      return;
    }

    router.replace(isAuthenticated ? "/admin/dashboard" : "/admin/login");
  }, [hasAdminAccounts, isAuthenticated, isReady, router]);

  return null;
}

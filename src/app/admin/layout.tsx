"use client";

import { useEffect, type PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonStyles } from "@/components/ui/button";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { canAccessModule, getAdminModuleFromPath } from "@/lib/permissions";

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthenticated, hasAdminAccounts, currentRole } = useAdminSession();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (pathname === "/admin/setup") {
      if (hasAdminAccounts) {
        router.replace(isAuthenticated ? "/admin/dashboard" : "/admin/login");
      }
      return;
    }

    if (pathname === "/admin/login") {
      if (!hasAdminAccounts) {
        router.replace("/admin/setup");
      }
      return;
    }

    if (!isAuthenticated) {
      const redirectTarget = pathname ?? "/admin/dashboard";
      router.replace(hasAdminAccounts ? `/admin/login?redirect=${encodeURIComponent(redirectTarget)}` : "/admin/setup");
    }
  }, [hasAdminAccounts, isAuthenticated, isReady, pathname, router]);

  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return <>{children}</>;
  }

  if (!isReady || !isAuthenticated || !currentRole) {
    return null;
  }

  const moduleKey = getAdminModuleFromPath(pathname ?? "");
  const canAccessCurrentModule = moduleKey ? canAccessModule(currentRole, moduleKey) : false;

  return (
    <AdminShell>
      {canAccessCurrentModule ? (
        children
      ) : (
        <div className="rounded-[28px] bg-white p-8 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-700">Access Restricted</p>
          <h1 className="mt-4 font-display text-3xl text-ink">This account does not have permission to open the requested admin module.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
            Sign in with an account that has the required permission set, or return to the dashboard to continue safely.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/dashboard" className={buttonStyles()}>
              Back to Dashboard
            </Link>
            <Link href="/admin/login" className={buttonStyles("secondary")}>
              Go to Login
            </Link>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

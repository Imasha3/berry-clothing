"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FollowUs } from "@/components/layout/follow-us";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <FollowUs />
      <SiteFooter />
    </>
  );
}

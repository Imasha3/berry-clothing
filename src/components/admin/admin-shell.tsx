"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type PropsWithChildren } from "react";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Badge } from "@/components/ui/badge";
import { getVisibleAdminModules } from "@/lib/permissions";
import { cn, formatDate } from "@/lib/utils";

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { currentRole, currentUser, logout } = useAdminSession();
  const { notifications, markNotificationRead } = useCommerceStore();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentRole || !currentUser) {
    return null;
  }

  const modules = getVisibleAdminModules(currentRole);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead);

  return (
    <div className="min-h-screen bg-[#fcf6f2]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 h-screen border-r border-black/5 bg-[#171212] p-6 text-white overflow-y-auto scrollbar-thin scroll-smooth">
          <Link href="/admin/dashboard" className="block rounded-[24px] bg-white px-4 py-4">
            <Image
              src="/berry-logo.jpeg"
              alt="Berry logo"
              width={500}
              height={500}
              className="h-16 w-auto"
            />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-black/55">
              Admin Panel
            </p>
          </Link>
          <div className="mt-6 rounded-[24px] bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{currentUser.fullName}</p>
                <p className="mt-1 text-sm text-white/70">@{currentUser.username}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                {currentUser.avatar}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>{currentRole.name}</Badge>
              <Badge tone={currentUser.status === "Active" ? "success" : "warning"}>
                {currentUser.status}
              </Badge>
            </div>
          </div>
          <nav className="mt-8 space-y-2">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  pathname?.startsWith(module.href)
                    ? "bg-berry-500 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">
                  {module.icon}
                </span>
                <span>{module.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 bg-white px-6 py-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-berry-600">Admin Panel</p>
              <h1 className="font-display text-2xl text-ink">Operational Control Center</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((previous) => !previous)}
                  className="relative rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-berry-50"
                >
                  Notifications
                  {unreadNotifications.length ? (
                    <span className="ml-2 rounded-full bg-berry-500 px-2 py-0.5 text-xs text-white">
                      {unreadNotifications.length}
                    </span>
                  ) : null}
                </button>
                {showNotifications ? (
                  <div className="absolute right-0 top-14 z-20 w-[360px] rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">Alerts</p>
                        <p className="text-xs text-black/55">
                          New orders, low stock, returns, and payment checks
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => void markNotificationRead(notification.id)}
                          className={cn(
                            "block w-full rounded-[20px] px-4 py-3 text-left transition",
                            notification.isRead ? "bg-[#fcf6f2]" : "bg-berry-50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-ink">{notification.title}</p>
                            {!notification.isRead ? (
                              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-berry-500" />
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-black/60">{notification.message}</p>
                          <p className="mt-2 text-xs text-black/45">{formatDate(notification.createdAt)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="rounded-[24px] border border-black/10 bg-[#fcf6f2] px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{currentUser.fullName}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <Badge>{currentRole.name}</Badge>
                    </div>
                  </div>
                  <button onClick={logout} className="text-sm font-semibold text-berry-700">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, type PropsWithChildren } from "react";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Badge } from "@/components/ui/badge";
import { getVisibleAdminModules } from "@/lib/permissions";
import { cn, formatDate } from "@/lib/utils";

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, currentUser, logout } = useAdminSession();
  const { notifications, markNotificationRead } = useCommerceStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const modules = currentRole ? getVisibleAdminModules(currentRole) : [];
  const unreadNotifications = notifications.filter((notification) => !notification.isRead);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    const prevCount = prevCountRef.current;
    if (unreadCount > prevCount) {
      setAnimateBell(true);
      const timer = setTimeout(() => setAnimateBell(false), 800);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    await markNotificationRead(notification.id);
    setShowNotifications(false);

    if (notification.relatedType === "contact_message" || (notification.type === "system" && notification.title.includes("Contact"))) {
      router.push(`/admin/contact-messages?id=${notification.relatedId || ""}`);
    } else if (notification.type === "payment") {
      router.push(`/admin/payments?orderId=${notification.relatedId || ""}`);
    } else if (notification.relatedType === "order" || ["order", "delivery", "order_status_update"].includes(notification.type)) {
      router.push(`/admin/orders/${notification.relatedId || ""}`);
    } else if (notification.relatedType === "customer" || notification.type === "new_customer") {
      router.push(`/admin/customers`);
    } else if (notification.relatedType === "product" || notification.type === "low_stock") {
      router.push(`/admin/inventory/${notification.relatedId || ""}`);
    } else if (notification.relatedId) {
      router.push(`/admin/orders/${notification.relatedId}`);
    }
  };

  if (!currentRole || !currentUser) {
    return null;
  }

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
              <style>{`
                @keyframes bellWobble {
                  0%, 100% { transform: rotate(0); }
                  15% { transform: rotate(-15deg); }
                  30% { transform: rotate(10deg); }
                  45% { transform: rotate(-10deg); }
                  60% { transform: rotate(5deg); }
                  75% { transform: rotate(-5deg); }
                }
                .animate-bell-wobble {
                  animation: bellWobble 0.8s ease-in-out;
                }
              `}</style>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications((previous) => !previous)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F8D7DF] bg-[#FFF5F7] text-[#C85A7C] transition duration-200 hover:bg-[#FFE7EE] hover:text-[#C85A7C] focus:outline-none"
                  aria-label="Notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className={cn("h-6 w-6", animateBell && "animate-bell-wobble")}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-berry-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                {showNotifications ? (
                  <div className="absolute right-0 top-14 z-20 w-[360px] rounded-[24px] bg-white/80 border border-white/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-2">
                      <div>
                        <p className="text-sm font-semibold text-ink">Alerts</p>
                        <p className="text-[10px] text-black/55">
                          New orders, low stock, customer signups, payments
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-black/45">No alerts</p>
                      ) : (
                        notifications.slice(0, 8).map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => void handleNotificationClick(notification)}
                            className={cn(
                              "block w-full rounded-[16px] px-4 py-3 text-left transition border text-xs",
                              notification.isRead
                                ? "bg-[#fffaf8]/50 border-black/5 text-black/50"
                                : "bg-[#FFF5F7]/80 border-[#F8D7DF] text-ink font-semibold hover:border-[#E79AB0]"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-ink">{notification.title}</p>
                              {!notification.isRead ? (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-berry-500" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-black/60 font-light leading-relaxed">{notification.message}</p>
                            <p className="mt-2 text-[10px] text-black/40 font-light">{formatDate(notification.createdAt)}</p>
                          </button>
                        ))
                      )}
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

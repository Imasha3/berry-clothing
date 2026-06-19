"use client";

import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { StatCard } from "@/components/common/stat-card";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Badge } from "@/components/ui/badge";
import { mockDashboardStats } from "@/data/mockReports";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { currentUser, currentRole } = useAdminSession();
  const { products, orders, notifications, activityLog } = useCommerceStore();
  const lowStockProducts = products.filter((product) => product.stockQuantity <= product.minStockLevel);
  const recentOrders = orders.slice(0, 6);

  if (!currentUser || !currentRole) {
    return null;
  }

  return (
    <AdminPage
      eyebrow="Overview"
      title="Dashboard"
      description="A professional daily snapshot of sales, orders, stock pressure, alerts, payment mix, and recent admin activity."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today Orders"
          value={String(mockDashboardStats.todayOrders)}
          helpText="Orders placed since midnight"
        />
        <StatCard
          label="Today Revenue"
          value={formatCurrency(mockDashboardStats.todayRevenue)}
          helpText="Collected across all payment methods"
        />
        <StatCard
          label="Pending Orders"
          value={String(mockDashboardStats.pendingOrders)}
          helpText="Orders waiting for the next action"
        />
        <StatCard
          label="Low Stock Products"
          value={String(mockDashboardStats.lowStockProducts)}
          helpText="Products at or below minimum stock"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
                Monthly Revenue
              </p>
              <h2 className="mt-2 font-display text-2xl text-ink">
                {formatCurrency(mockDashboardStats.monthlyRevenue)}
              </h2>
            </div>
            <Badge>{currentRole.name}</Badge>
          </div>
          <div className="mt-6 grid grid-cols-6 items-end gap-3">
            {mockDashboardStats.monthlyRevenueTrend.map((entry) => {
              const height = Math.max(18, Math.round((entry.revenue / 386750) * 180));
              return (
                <div key={entry.month} className="text-center">
                  <div className="flex h-52 items-end justify-center rounded-[18px] bg-[#fcf6f2] px-2 pb-2">
                    <div
                      className="w-full rounded-[14px] bg-[linear-gradient(180deg,#ff9fb8_0%,#f34078_100%)]"
                      style={{ height }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{entry.month}</p>
                  <p className="text-xs text-black/50">{formatCurrency(entry.revenue)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
            Notification Bell
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink">Priority alerts</h2>
          <div className="mt-5 space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="rounded-[20px] bg-[#fcf6f2] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{notification.title}</p>
                  {!notification.isRead ? <Badge tone="danger">New</Badge> : <Badge>Seen</Badge>}
                </div>
                <p className="mt-2 text-sm text-black/60">{notification.message}</p>
                <p className="mt-2 text-xs text-black/45">{formatDate(notification.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
            Sales by Category
          </p>
          <div className="mt-5 space-y-4">
            {mockDashboardStats.salesByCategory.map((entry) => (
              <div key={entry.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{entry.label}</p>
                  <p className="text-sm text-black/55">{entry.value}%</p>
                </div>
                <div className="mt-2 h-3 rounded-full bg-[#fcf6f2]">
                  <div
                    className="h-3 rounded-full bg-berry-500"
                    style={{ width: `${entry.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
            Payment Method Summary
          </p>
          <div className="mt-5 space-y-4">
            {mockDashboardStats.paymentMethodSummary.map((entry) => (
              <div key={entry.label} className="rounded-[20px] bg-[#fcf6f2] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{entry.label}</p>
                  <Badge>{entry.value} orders</Badge>
                </div>
                <p className="mt-2 text-sm text-black/60">{formatCurrency(entry.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
            Best Selling Products
          </p>
          <div className="mt-5 space-y-4">
            {mockDashboardStats.bestSellingProducts.map((product, index) => (
              <div key={product.name} className="rounded-[20px] bg-[#fcf6f2] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">
                    {index + 1}. {product.name}
                  </p>
                  <Badge>{product.units} units</Badge>
                </div>
                <p className="mt-2 text-sm text-black/60">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
            Activity Timeline
          </p>
          <div className="mt-5 space-y-4">
            {activityLog.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex gap-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-berry-500" />
                <div className="rounded-[20px] bg-[#fcf6f2] px-4 py-4">
                  <p className="font-semibold text-ink">
                    {entry.action} by {entry.user}
                  </p>
                  <p className="mt-1 text-sm text-black/60">{entry.target}</p>
                  <p className="mt-2 text-xs text-black/45">{formatDate(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
                  Low Stock Alert
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">Replenishment watchlist</h2>
              </div>
              <Badge tone="warning">{lowStockProducts.length} products</Badge>
            </div>
            <div className="mt-5 overflow-hidden rounded-[20px] border border-black/8">
              <div className="grid grid-cols-[1.4fr_1fr_0.9fr_1fr_0.9fr] gap-3 bg-[#fcf6f2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
                <p>Product name</p>
                <p>SKU</p>
                <p>Stock</p>
                <p>Min level</p>
                <p>Status</p>
              </div>
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[1.4fr_1fr_0.9fr_1fr_0.9fr] gap-3 border-t border-black/5 px-4 py-4 text-sm"
                >
                  <p className="font-semibold text-ink">{product.productName}</p>
                  <p className="text-black/60">{product.sku}</p>
                  <p className="text-black/60">{product.stockQuantity}</p>
                  <p className="text-black/60">{product.minStockLevel}</p>
                  <Badge tone={product.stockQuantity === 0 ? "danger" : "warning"}>
                    {product.availabilityStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">
                  Recent Orders
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">Latest order flow</h2>
              </div>
              <Badge>{recentOrders.length} shown</Badge>
            </div>
            <div className="mt-5 overflow-hidden rounded-[20px] border border-black/8">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_0.8fr] gap-3 bg-[#fcf6f2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
                <p>Order ID</p>
                <p>Customer</p>
                <p>Amount</p>
                <p>Payment</p>
                <p>Status</p>
                <p>Action</p>
              </div>
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_0.8fr] gap-3 border-t border-black/5 px-4 py-4 text-sm"
                >
                  <p className="font-semibold text-ink">{order.id}</p>
                  <p className="text-black/60">{order.customerName}</p>
                  <p className="text-black/60">{formatCurrency(order.total)}</p>
                  <p className="text-black/60">{order.paymentMethod}</p>
                  <Badge>{order.status}</Badge>
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-berry-700">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

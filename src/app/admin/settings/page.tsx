"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { mockDeliverySettings, mockMediaBuckets, mockStoreSettings } from "@/data/mockBusiness";

export default function AdminSettingsPage() {
  return (
    <AdminPage
      eyebrow="System"
      title="Settings"
      description="Manage store profile, contact details, social links, bank details, delivery rules, policies, and media planning."
    >
      <PermissionGuard
        permission="settings.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 text-sm text-black/60">
            Settings access is restricted to roles with `settings.manage`.
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Store Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input defaultValue={mockStoreSettings.storeName} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.logo} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.contactEmail} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.contactPhone} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.socialLinks.instagram} className="rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2" />
              <textarea defaultValue={mockStoreSettings.address} className="min-h-24 rounded-2xl border border-black/10 px-4 py-3 sm:col-span-2" />
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Bank Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input defaultValue={mockStoreSettings.bankDetails.bankName} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.bankDetails.accountName} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.bankDetails.accountNumber} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input defaultValue={mockStoreSettings.bankDetails.branch} className="rounded-2xl border border-black/10 px-4 py-3" />
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Delivery Fees</h2>
            <p className="mt-3 text-sm text-black/60">Default delivery fee: LKR {mockDeliverySettings.defaultDeliveryFee}</p>
            <div className="mt-5 space-y-3">
              {mockDeliverySettings.cityFees.map((item) => (
                <div key={`${item.city}-${item.district}`} className="rounded-[20px] bg-[#fff6f5] px-4 py-3 text-sm text-black/60">
                  {item.city}, {item.district} - LKR {item.fee}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Policies & Media</h2>
            <textarea defaultValue={mockStoreSettings.returnPolicy} className="min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" />
            <textarea defaultValue={mockStoreSettings.exchangePolicy} className="mt-4 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm" />
            <div className="mt-5 space-y-3">
              {mockMediaBuckets.map((bucket) => (
                <div key={bucket.label} className="rounded-[20px] bg-[#fff6f5] px-4 py-3 text-sm">
                  <p className="font-semibold text-ink">{bucket.label}</p>
                  <p className="mt-1 text-black/60">{bucket.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

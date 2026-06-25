"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/types/settings";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Berry Clothing",
  logo: "Berry",
  description: "A modern Sri Lankan women’s fashion label bringing social-selling energy into a polished online shopping experience.",
  contactEmail: "hello@berryclothing.lk",
  contactPhone: "+94 77 123 4567",
  address: "Colombo, Sri Lanka",
  footerText: "Crafted with care for stylish women in Sri Lanka.",
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: ""
  },
  bankDetails: {
    bankName: "",
    accountName: "",
    accountNumber: "",
    branch: ""
  },
  returnPolicy: "",
  exchangePolicy: ""
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((current) => ({ ...current, ...data }));
      })
      .catch(() => {
        setMessage("Unable to load settings. Try again later.");
      });
  }, []);

  const updateField = (field: keyof StoreSettings, value: string | StoreSettings[typeof field]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const updateSocialLink = (key: keyof StoreSettings["socialLinks"], value: string) => {
    setSettings((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [key]: value
      }
    }));
  };

  const updateBankDetail = (key: keyof StoreSettings["bankDetails"], value: string) => {
    setSettings((current) => ({
      ...current,
      bankDetails: {
        ...current.bankDetails,
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error("Unable to save settings.");
      }

      const data = await response.json();
      setSettings((current) => ({ ...current, ...data }));
      setMessage("Settings saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage
      eyebrow="System"
      title="Settings"
      description="Manage store profile, contact details, social links, footer text, and site business information."
    >
      <PermissionGuard
        permission="settings.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 text-sm text-black/60">
            Settings access is restricted to roles with `settings.manage`.
          </div>
        }
      >
        <div className="space-y-6">
          <section className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl text-ink">Business Details</h2>
                <p className="mt-2 text-sm text-black/60">Update the store profile and contact details used across the site.</p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
            {message ? <p className="mt-4 text-sm text-berry-700">{message}</p> : null}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Store name</span>
                <input
                  value={settings.storeName}
                  onChange={(event) => updateField("storeName", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Description</span>
                <textarea
                  value={settings.description ?? ""}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="min-h-[96px] rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Phone</span>
                <input
                  value={settings.contactPhone ?? ""}
                  onChange={(event) => updateField("contactPhone", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Email</span>
                <input
                  value={settings.contactEmail ?? ""}
                  onChange={(event) => updateField("contactEmail", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="sm:col-span-2 space-y-2">
                <span className="text-sm font-semibold text-ink">Address</span>
                <textarea
                  value={settings.address ?? ""}
                  onChange={(event) => updateField("address", event.target.value)}
                  className="min-h-[96px] rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Social Links</h2>
            <p className="mt-2 text-sm text-black/60">Add the public URLs to show icons across the site.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Facebook URL</span>
                <input
                  value={settings.socialLinks.facebook ?? ""}
                  onChange={(event) => updateSocialLink("facebook", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Instagram URL</span>
                <input
                  value={settings.socialLinks.instagram ?? ""}
                  onChange={(event) => updateSocialLink("instagram", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">TikTok URL</span>
                <input
                  value={settings.socialLinks.tiktok ?? ""}
                  onChange={(event) => updateSocialLink("tiktok", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">YouTube URL</span>
                <input
                  value={settings.socialLinks.youtube ?? ""}
                  onChange={(event) => updateSocialLink("youtube", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="font-display text-2xl text-ink">Footer & Additional Info</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 space-y-2">
                <span className="text-sm font-semibold text-ink">Footer text</span>
                <textarea
                  value={settings.footerText ?? ""}
                  onChange={(event) => updateField("footerText", event.target.value)}
                  className="min-h-[96px] rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Bank name</span>
                <input
                  value={settings.bankDetails.bankName ?? ""}
                  onChange={(event) => updateBankDetail("bankName", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Account name</span>
                <input
                  value={settings.bankDetails.accountName ?? ""}
                  onChange={(event) => updateBankDetail("accountName", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Account number</span>
                <input
                  value={settings.bankDetails.accountNumber ?? ""}
                  onChange={(event) => updateBankDetail("accountNumber", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Branch</span>
                <input
                  value={settings.bankDetails.branch ?? ""}
                  onChange={(event) => updateBankDetail("branch", event.target.value)}
                  className="rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Return policy</span>
                <textarea
                  value={settings.returnPolicy ?? ""}
                  onChange={(event) => updateField("returnPolicy", event.target.value)}
                  className="min-h-[96px] rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Exchange policy</span>
                <textarea
                  value={settings.exchangePolicy ?? ""}
                  onChange={(event) => updateField("exchangePolicy", event.target.value)}
                  className="min-h-[96px] rounded-2xl border border-black/10 px-4 py-3"
                />
              </label>
            </div>
          </section>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

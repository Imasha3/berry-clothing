"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Button } from "@/components/ui/button";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { StoreSettings } from "@/types/settings";

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

const inputClassName =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#fffaf8] px-4 text-sm text-ink shadow-sm transition focus:border-berry-300 focus:bg-white focus:ring-4 focus:ring-berry-100";

const textareaClassName =
  "min-h-[112px] w-full resize-y rounded-2xl border border-black/10 bg-[#fffaf8] px-4 py-3 text-sm leading-6 text-ink shadow-sm transition focus:border-berry-300 focus:bg-white focus:ring-4 focus:ring-berry-100";

function mergeSettings(settings?: Partial<StoreSettings>): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    socialLinks: {
      ...DEFAULT_STORE_SETTINGS.socialLinks,
      ...settings?.socialLinks
    },
    bankDetails: {
      ...DEFAULT_STORE_SETTINGS.bankDetails,
      ...settings?.bankDetails
    }
  };
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

export default function AdminContactSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load contact settings.");
      }

      setSettings(mergeSettings(data));
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to load contact settings."
      });
      setSettings(DEFAULT_STORE_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateField = (field: keyof StoreSettings, value: string) => {
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

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergeSettings(settings))
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save contact settings.");
      }

      setSettings(mergeSettings(data));
      setToast({ tone: "success", message: "Contact settings saved successfully." });
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to save contact settings."
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = useMemo(() => !saving && !isLoading, [isLoading, saving]);

  return (
    <AdminPage
      eyebrow="Storefront"
      title="Contact Settings"
      description="Manage the contact information and social links shown across the website footer, follow section, and customer-facing pages."
    >
      <PermissionGuard
        permission="settings.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            Contact settings access is restricted to roles with settings management permission.
          </div>
        }
      >
        <div className="mx-auto max-w-5xl space-y-5">
          <div className="sticky top-4 z-20 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Public contact details</p>
                <p className="mt-1 text-xs text-black/55">
                  Saved values automatically update the homepage and footer.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => void loadSettings()} disabled={isLoading || saving}>
                  Refresh
                </Button>
                <Button onClick={handleSave} disabled={!canSave} className="min-w-[170px] gap-2">
                  {saving ? <Spinner /> : null}
                  {saving ? "Saving..." : "Save Contact Settings"}
                </Button>
              </div>
            </div>
            {toast ? (
              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  toast.tone === "success"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                }`}
              >
                {toast.message}
              </div>
            ) : null}
          </div>

          <section className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-berry-600">Contact</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Email Address">
                <input
                  type="email"
                  value={settings.contactEmail ?? ""}
                  onChange={(event) => updateField("contactEmail", event.target.value)}
                  className={inputClassName}
                  placeholder="hello@berryclothing.lk"
                />
              </Field>
              <Field label="Contact Number">
                <input
                  value={settings.contactPhone ?? ""}
                  onChange={(event) => updateField("contactPhone", event.target.value)}
                  className={inputClassName}
                  placeholder="+94 77 123 4567"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Shop Address">
                  <textarea
                    value={settings.address ?? ""}
                    onChange={(event) => updateField("address", event.target.value)}
                    className={textareaClassName}
                    placeholder="Store address or delivery service area"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-berry-600">Social Media</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Facebook URL">
                <input
                  value={settings.socialLinks.facebook ?? ""}
                  onChange={(event) => updateSocialLink("facebook", event.target.value)}
                  className={inputClassName}
                  placeholder="https://facebook.com/..."
                />
              </Field>
              <Field label="TikTok URL">
                <input
                  value={settings.socialLinks.tiktok ?? ""}
                  onChange={(event) => updateSocialLink("tiktok", event.target.value)}
                  className={inputClassName}
                  placeholder="https://tiktok.com/@..."
                />
              </Field>
              <Field label="WhatsApp Number/Link">
                <input
                  value={settings.socialLinks.whatsapp ?? ""}
                  onChange={(event) => updateSocialLink("whatsapp", event.target.value)}
                  className={inputClassName}
                  placeholder="https://wa.me/94771234567"
                />
              </Field>
              <Field label="Instagram URL">
                <input
                  value={settings.socialLinks.instagram ?? ""}
                  onChange={(event) => updateSocialLink("instagram", event.target.value)}
                  className={inputClassName}
                  placeholder="https://instagram.com/..."
                />
              </Field>
            </div>
          </section>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

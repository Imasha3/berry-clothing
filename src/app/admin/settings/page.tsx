"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Button } from "@/components/ui/button";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { StoreSettings } from "@/types/settings";

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type ValidationErrors = Partial<Record<"storeName" | "contactEmail", string>>;

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

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="h-6 w-48 animate-pulse rounded-full bg-black/10" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="h-12 animate-pulse rounded-2xl bg-black/10" />
            <div className="h-12 animate-pulse rounded-2xl bg-black/10" />
            <div className="h-24 animate-pulse rounded-2xl bg-black/10 md:col-span-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(23,18,18,0.1)] sm:p-6">
      <div className="border-b border-black/5 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-berry-600">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const loadSettings = useCallback(async (attempt = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load settings.");
      }

      setSettings(mergeSettings(data));
      setToast(null);
    } catch (error) {
      if (attempt < 2) {
        window.setTimeout(() => void loadSettings(attempt + 1), 600);
        return;
      }

      setSettings(DEFAULT_STORE_SETTINGS);
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to load settings. Default values are shown."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateField = (field: keyof StoreSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
    if (field === "storeName" && value.trim()) {
      setErrors((current) => ({ ...current, storeName: undefined }));
    }
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

  const validateSettings = useCallback(() => {
    const nextErrors: ValidationErrors = {};

    if (!settings.storeName.trim()) {
      nextErrors.storeName = "Store name is required.";
    }

    if (settings.contactEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail.trim())) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [settings.contactEmail, settings.storeName]);

  const handleSave = async () => {
    if (!validateSettings()) {
      setToast({ tone: "error", message: "Please fix the highlighted fields before saving." });
      return;
    }

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
        throw new Error(data?.error || "Unable to save settings.");
      }

      setSettings(mergeSettings(data));
      setToast({ tone: "success", message: "Settings saved successfully." });
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to save settings."
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = useMemo(() => !saving && !isLoading, [isLoading, saving]);

  return (
    <AdminPage
      eyebrow="System"
      title="Settings"
      description="Manage storefront identity, contact details, social links, footer content, and business information."
    >
      <PermissionGuard
        permission="settings.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            Settings access is restricted to roles with settings management permission.
          </div>
        }
      >
        <div className="mx-auto max-w-5xl">
          <div className="sticky top-4 z-20 mb-5 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Store configuration</p>
                <p className="mt-1 text-xs text-black/55">
                  Changes update the public storefront after saving.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => void loadSettings()} disabled={isLoading || saving}>
                  Refresh
                </Button>
                <Button onClick={handleSave} disabled={!canSave} className="min-w-[150px] gap-2">
                  {saving ? <Spinner /> : null}
                  {saving ? "Saving..." : "Save Settings"}
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

          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <div className="space-y-5">
              <SettingsCard
                eyebrow="Card 1"
                title="Business Information"
                description="Set the primary brand identity and short description shown across the storefront."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Store Name" error={errors.storeName}>
                    <input
                      value={settings.storeName}
                      onChange={(event) => updateField("storeName", event.target.value)}
                      className={inputClassName}
                      placeholder="Berry Clothing"
                    />
                  </Field>
                  <Field label="Logo Text">
                    <input
                      value={settings.logo ?? ""}
                      onChange={(event) => updateField("logo", event.target.value)}
                      className={inputClassName}
                      placeholder="Berry"
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description">
                      <textarea
                        value={settings.description ?? ""}
                        onChange={(event) => updateField("description", event.target.value)}
                        className={textareaClassName}
                        placeholder="Describe your store and brand style."
                      />
                    </Field>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard
                eyebrow="Card 2"
                title="Contact Information"
                description="Keep customer-facing support and location details accurate."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Phone">
                    <input
                      value={settings.contactPhone ?? ""}
                      onChange={(event) => updateField("contactPhone", event.target.value)}
                      className={inputClassName}
                      placeholder="+94 77 123 4567"
                    />
                  </Field>
                  <Field label="Email" error={errors.contactEmail}>
                    <input
                      type="email"
                      value={settings.contactEmail ?? ""}
                      onChange={(event) => updateField("contactEmail", event.target.value)}
                      className={inputClassName}
                      placeholder="hello@berryclothing.lk"
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Address">
                      <textarea
                        value={settings.address ?? ""}
                        onChange={(event) => updateField("address", event.target.value)}
                        className={textareaClassName}
                        placeholder="Store address or service area"
                      />
                    </Field>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard
                eyebrow="Card 3"
                title="Social Media Links"
                description="Only links with values are shown as social icons on the public storefront."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Facebook">
                    <input
                      value={settings.socialLinks.facebook ?? ""}
                      onChange={(event) => updateSocialLink("facebook", event.target.value)}
                      className={inputClassName}
                      placeholder="https://facebook.com/..."
                    />
                  </Field>
                  <Field label="Instagram">
                    <input
                      value={settings.socialLinks.instagram ?? ""}
                      onChange={(event) => updateSocialLink("instagram", event.target.value)}
                      className={inputClassName}
                      placeholder="https://instagram.com/..."
                    />
                  </Field>
                  <Field label="TikTok">
                    <input
                      value={settings.socialLinks.tiktok ?? ""}
                      onChange={(event) => updateSocialLink("tiktok", event.target.value)}
                      className={inputClassName}
                      placeholder="https://tiktok.com/@..."
                    />
                  </Field>
                  <Field label="WhatsApp">
                    <input
                      value={settings.socialLinks.whatsapp ?? ""}
                      onChange={(event) => updateSocialLink("whatsapp", event.target.value)}
                      className={inputClassName}
                      placeholder="https://wa.me/94771234567"
                    />
                  </Field>
                  <Field label="YouTube">
                    <input
                      value={settings.socialLinks.youtube ?? ""}
                      onChange={(event) => updateSocialLink("youtube", event.target.value)}
                      className={inputClassName}
                      placeholder="https://youtube.com/..."
                    />
                  </Field>
                </div>
              </SettingsCard>

              <SettingsCard
                eyebrow="Card 4"
                title="Footer / Additional Settings"
                description="Manage footer text, business notes, payment details, and policy copy without crowding the main form."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Footer Text">
                      <textarea
                        value={settings.footerText ?? ""}
                        onChange={(event) => updateField("footerText", event.target.value)}
                        className={textareaClassName}
                        placeholder="Short footer tagline"
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Business Information">
                      <textarea
                        value={settings.businessInfo ?? ""}
                        onChange={(event) => updateField("businessInfo", event.target.value)}
                        className={textareaClassName}
                        placeholder="Business hours, registration details, or customer service notes"
                      />
                    </Field>
                  </div>
                  <Field label="Bank Name">
                    <input
                      value={settings.bankDetails.bankName ?? ""}
                      onChange={(event) => updateBankDetail("bankName", event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Account Name">
                    <input
                      value={settings.bankDetails.accountName ?? ""}
                      onChange={(event) => updateBankDetail("accountName", event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Account Number">
                    <input
                      value={settings.bankDetails.accountNumber ?? ""}
                      onChange={(event) => updateBankDetail("accountNumber", event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Branch">
                    <input
                      value={settings.bankDetails.branch ?? ""}
                      onChange={(event) => updateBankDetail("branch", event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Return Policy">
                    <textarea
                      value={settings.returnPolicy ?? ""}
                      onChange={(event) => updateField("returnPolicy", event.target.value)}
                      className={textareaClassName}
                    />
                  </Field>
                  <Field label="Exchange Policy">
                    <textarea
                      value={settings.exchangePolicy ?? ""}
                      onChange={(event) => updateField("exchangePolicy", event.target.value)}
                      className={textareaClassName}
                    />
                  </Field>
                </div>
              </SettingsCard>

              <div className="flex justify-end pb-4">
                <Button onClick={handleSave} disabled={!canSave} className="min-w-[170px] gap-2">
                  {saving ? <Spinner /> : null}
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

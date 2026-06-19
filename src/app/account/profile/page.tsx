"use client";

import { useEffect, useState } from "react";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { Button } from "@/components/ui/button";

export default function AccountProfilePage() {
  const { customer, updateProfile } = useCustomerSession();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [errors, setErrors] = useState<Partial<Record<"fullName" | "phone" | "city" | "address", string>>>({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: ""
  });

  useEffect(() => {
    if (!customer) {
      return;
    }

    setForm({
      fullName: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address
    });
  }, [customer]);

  if (!customer) {
    return null;
  }

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!/^[0-9+\s-]{7,15}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const result = await updateProfile({
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
      address: form.address
    });

    if (!result.ok) {
      setMessageTone("error");
      setMessage(result.message);
      return;
    }

    setIsEditing(false);
    setErrors({});
    setMessageTone("success");
    setMessage("Profile updated successfully.");
  };

  const handleCancel = () => {
    setForm({
      fullName: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address
    });
    setErrors({});
    setMessage("");
    setMessageTone("success");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-ink">Profile Details</h1>
            <p className="mt-3 text-sm text-black/60">Manage the customer details linked to your current Berry Clothing account.</p>
          </div>
          {!isEditing ? (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-black/60">Full name</span>
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              readOnly={!isEditing}
              className="w-full rounded-2xl border border-black/10 px-4 py-3"
            />
            {errors.fullName ? <span className="text-sm text-rose-600">{errors.fullName}</span> : null}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-black/60">Email</span>
            <input value={form.email} readOnly className="w-full rounded-2xl border border-black/10 bg-black/5 px-4 py-3" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-black/60">Phone number</span>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              readOnly={!isEditing}
              className="w-full rounded-2xl border border-black/10 px-4 py-3"
            />
            {errors.phone ? <span className="text-sm text-rose-600">{errors.phone}</span> : null}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-black/60">City</span>
            <input
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              readOnly={!isEditing}
              className="w-full rounded-2xl border border-black/10 px-4 py-3"
            />
            {errors.city ? <span className="text-sm text-rose-600">{errors.city}</span> : null}
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-black/60">Address</span>
            <textarea
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              readOnly={!isEditing}
              className="min-h-28 w-full rounded-2xl border border-black/10 px-4 py-3"
            />
            {errors.address ? <span className="text-sm text-rose-600">{errors.address}</span> : null}
          </label>
        </div>

        {message ? (
          <p className={`mt-4 text-sm ${messageTone === "success" ? "text-emerald-600" : "text-rose-600"}`}>
            {message}
          </p>
        ) : null}

        {isEditing ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h2 className="font-display text-3xl text-ink">Saved Delivery Addresses</h2>
        <div className="mt-5 space-y-3">
          {customer.addresses.map((address) => (
            <div key={address.id} className="rounded-[24px] bg-[#fff5f4] p-4 text-sm text-black/65">
              <p className="font-semibold text-ink">
                {address.label} {address.isDefault ? "(Default)" : ""}
              </p>
              <p className="mt-2">{address.recipientName}</p>
              <p>{address.addressLine}</p>
              <p>
                {address.city}, {address.district}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

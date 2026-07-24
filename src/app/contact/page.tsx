"use client";

import { useEffect, useState } from "react";
import { SocialLinksRow } from "@/components/common/social-links";
import { Button } from "@/components/ui/button";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import type { StoreSettings } from "@/types/settings";
import { supabaseClient } from "@/lib/supabase-client";

const detailIcons = {
  phone: "☎",
  email: "✉",
  address: "⌖",
  website: "◎"
};

function mergeSettings(settings: StoreSettings): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    socialLinks: {
      ...DEFAULT_STORE_SETTINGS.socialLinks,
      ...settings.socialLinks
    },
    bankDetails: {
      ...DEFAULT_STORE_SETTINGS.bankDetails,
      ...settings.bankDetails
    }
  };
}

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchStoreSettings()
      .then((nextSettings) => setSettings(mergeSettings(nextSettings)))
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, []);

  const details = [
    { icon: detailIcons.phone, label: "Phone", value: settings.contactPhone },
    { icon: detailIcons.email, label: "Email", value: settings.contactEmail },
    { icon: detailIcons.address, label: "Address", value: settings.address },
    { icon: detailIcons.website, label: "Website", value: "berryclothing.lk" }
  ].filter((item) => Boolean(item.value));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Save contact message in Supabase
      const { data: messageData, error: messageError } = await supabaseClient
        .from("contact_messages")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          message: message.trim()
        })
        .select()
        .single();

      if (messageError) {
        throw new Error(messageError.message);
      }

      // 2. Generate Admin Notification
      const messageId = messageData?.id || null;
      const { error: notifError } = await supabaseClient
        .from("notifications")
        .insert({
          title: "New Contact Message",
          message: `${name.trim()} sent a message.`,
          type: "system",
          is_read: false,
          related_id: messageId,
          related_type: "contact_message",
          recipient_id: null
        });

      if (notifError) {
        console.error("Error inserting admin notification:", notifError.message);
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      console.error("Failed to submit contact message:", err);
      setErrorMsg(err.message || "An error occurred while sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[8px] bg-[#171212] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#ffb6c9]">Contact</p>
          <h1 className="mt-3 font-display text-5xl font-light">Talk to Berry Clothing</h1>
          <p className="mt-5 text-sm leading-7 text-white/70 font-body font-light">
            Reach us for product questions, delivery support, order updates, and new collection details.
          </p>
          <div className="mt-7 space-y-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-start gap-3 rounded-[8px] bg-white/8 px-4 py-3 text-sm text-white/78">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
                  {detail.icon}
                </span>
                <span>
                  <span className="block font-semibold text-white">{detail.label}</span>
                  <span className="mt-1 block">{detail.value}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <p className="mb-3 text-sm font-semibold text-white">Follow us online</p>
            <SocialLinksRow links={settings.socialLinks} showText iconClassName="bg-white" />
          </div>
        </div>
 
        <div className="rounded-[8px] bg-white p-8 shadow-soft ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-berry-700">Message Us</p>
          <h2 className="mt-3 font-display text-4xl font-light text-ink">Send a quick note</h2>
          
          {success ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-800 border border-emerald-100 animate-in fade-in zoom-in-95 duration-300">
              <p className="font-semibold text-base">✔️ Your message has been sent successfully.</p>
              <p className="mt-2 text-sm text-emerald-700">We'll get back to you soon.</p>
              <button 
                onClick={() => setSuccess(false)} 
                className="mt-4 text-xs font-semibold text-emerald-800 underline hover:text-emerald-900"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name" 
                  required
                  className="rounded-2xl border border-black/10 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-berry-200" 
                />
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)" 
                  className="rounded-2xl border border-black/10 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-berry-200" 
                />
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="Email" 
                  className="rounded-2xl border border-black/10 px-4 py-3 w-full sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-berry-200" 
                />
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Message" 
                  className="min-h-40 rounded-2xl border border-black/10 px-4 py-3 w-full sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-berry-200" 
                />
              </div>

              {errorMsg ? (
                <p className="text-sm font-semibold text-rose-600">{errorMsg}</p>
              ) : null}

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto mt-2">
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

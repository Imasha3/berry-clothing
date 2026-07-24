"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabase-client";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export default function AdminContactMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messageIdFromQuery = searchParams?.get("id") || null;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch contact messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, []);

  // Handle selected message from query param
  useEffect(() => {
    if (messageIdFromQuery && messages.length > 0) {
      const match = messages.find((m) => m.id === messageIdFromQuery);
      if (match) {
        setSelectedMessage(match);
      }
    }
  }, [messageIdFromQuery, messages]);

  const filteredMessages = messages.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term) ||
      (m.phone && m.phone.includes(term))
    );
  });

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    router.replace(`/admin/contact-messages?id=${msg.id}`);
  };

  return (
    <AdminPage
      eyebrow="Operations"
      title="Contact Messages"
      description="View and respond to inquiries submitted by customers through the storefront contact form."
    >
      <PermissionGuard
        permission="settings.manage"
        fallback={
          <div className="rounded-[28px] bg-white p-6 text-sm text-black/60 shadow-soft ring-1 ring-black/5">
            Contact messages access is restricted to roles with settings management permission.
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
          {/* Left panel: List */}
          <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Inboxes</h2>
              <Button variant="secondary" className="h-8 px-4 text-xs" onClick={fetchMessages} disabled={loading}>
                Refresh
              </Button>
            </div>
            
            <input
              type="text"
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-[#fffaf8] px-4 py-2.5 text-sm text-ink focus:border-berry-300 focus:outline-none"
            />

            {loading ? (
              <p className="py-8 text-center text-sm text-black/45">Loading inquiries...</p>
            ) : filteredMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-black/45">No inquiries found.</p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full text-left rounded-[20px] p-4 text-xs transition border ${
                      selectedMessage?.id === msg.id
                        ? "bg-[#FFF5F7] border-[#F8D7DF] text-ink font-semibold"
                        : "bg-[#fffaf8] border-black/5 text-black/65 hover:border-black/15"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-ink text-sm">{msg.name}</p>
                      <p className="text-[10px] text-black/45">{formatDate(msg.created_at)}</p>
                    </div>
                    <p className="text-xs text-berry-600 mt-1">{msg.email}</p>
                    <p className="mt-2 line-clamp-2 text-black/55 font-light">{msg.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: Details */}
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 min-h-[400px]">
            {selectedMessage ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border-b border-black/5 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-ink">{selectedMessage.name}</h3>
                      <p className="text-sm text-berry-600 mt-1">{selectedMessage.email}</p>
                    </div>
                    <span className="text-xs text-black/45">{formatDate(selectedMessage.created_at)}</span>
                  </div>
                  {selectedMessage.phone ? (
                    <p className="text-xs text-black/60 mt-2 font-medium">📞 Phone: {selectedMessage.phone}</p>
                  ) : null}
                </div>

                <div className="rounded-2xl bg-[#fffcfb] border border-black/5 p-5 text-sm text-ink leading-relaxed">
                  <p className="whitespace-pre-wrap font-light">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-berry-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-berry-700 transition"
                  >
                    Reply via Email
                  </a>
                  {selectedMessage.phone ? (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink hover:bg-black/5 transition"
                    >
                      Call Customer
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 text-black/45">
                <span className="text-4xl mb-3">✉️</span>
                <p className="text-sm">Select an inquiry from the inbox panel to read details.</p>
              </div>
            )}
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}

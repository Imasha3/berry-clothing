"use client";

import { useEffect, useState } from "react";
import { useCustomerSession } from "@/components/providers/customer-session-provider";
import { formatDate } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabase-client";

interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

export default function AccountNotificationsPage() {
  const { customer } = useCustomerSession();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = customer?.id;
    if (!customerId) return;

    let active = true;

    async function loadNotifications() {
      try {
        const { data, error } = await supabaseClient
          .from("notifications")
          .select("*")
          .eq("recipient_id", customerId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching customer notifications:", error);
          return;
        }

        if (data && active) {
          setNotifications(
            data.map((row: any) => ({
              id: row.id,
              title: row.title,
              message: row.message,
              isRead: row.is_read,
              createdAt: row.created_at,
              relatedId: row.related_id,
              relatedType: row.related_type
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load customer notifications:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadNotifications();

    // Subscribe to realtime updates for this customer
    const channel = supabaseClient
      .channel(`customer-notifications-${customerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${customerId}` },
        (payload) => {
          if (!active) return;
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === "INSERT") {
            const newNotif = {
              id: newRow.id,
              title: newRow.title,
              message: newRow.message,
              isRead: newRow.is_read,
              createdAt: newRow.created_at,
              relatedId: newRow.related_id,
              relatedType: newRow.related_type
            };
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });
          } else if (eventType === "UPDATE") {
            const updatedNotif = {
              id: newRow.id,
              title: newRow.title,
              message: newRow.message,
              isRead: newRow.is_read,
              createdAt: newRow.created_at,
              relatedId: newRow.related_id,
              relatedType: newRow.related_type
            };
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
            );
          } else if (eventType === "DELETE") {
            setNotifications((prev) => prev.filter((n) => n.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabaseClient.removeChannel(channel);
    };
  }, [customer]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) {
        console.error("Error marking customer notification read:", error);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark customer notification read:", err);
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Notifications</h1>
      {loading ? (
        <p className="mt-6 text-sm text-black/55">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="mt-6 text-sm text-black/55">You have no notifications yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => void handleMarkAsRead(notification.id)}
              className={`w-full text-left block rounded-[24px] border p-5 text-sm transition ${
                notification.isRead
                  ? "border-black/8 bg-[#fffaf8] text-black/50"
                  : "border-[#F8D7DF] bg-[#FFF5F7] text-ink hover:border-[#E79AB0]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={`font-semibold ${notification.isRead ? "text-black/70" : "text-ink"}`}>
                  {notification.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${notification.isRead ? "bg-black/20" : "bg-berry-500"}`} />
                  <p className="text-xs uppercase tracking-wider">{notification.isRead ? "Read" : "Unread"}</p>
                </div>
              </div>
              <p className="mt-2 text-black/75 font-light">{notification.message}</p>
              <p className="mt-2 text-xs text-black/45">{formatDate(notification.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

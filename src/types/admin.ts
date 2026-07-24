export interface AdminActivityLogEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "delivery" | "return" | "system";
  createdAt: string;
  isRead: boolean;
  relatedId?: string | null;
  relatedType?: string | null;
}

export interface CustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  isDefault: boolean;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "delivery" | "return";
  createdAt: string;
  isRead: boolean;
}

export interface CustomerServiceRequest {
  id: string;
  orderId: string;
  type: "Return" | "Exchange";
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Processing";
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  totalOrders: number;
  totalSpending: number;
  joinedAt: string;
  addresses: CustomerAddress[];
  notifications: CustomerNotification[];
  returnRequests: CustomerServiceRequest[];
  exchangeRequests: CustomerServiceRequest[];
}

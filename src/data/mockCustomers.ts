import { mockCustomerNotifications, mockExchangeRequests, mockReturnRequests } from "@/data/mockBusiness";
import type { Customer } from "@/types/customer";

export const mockCustomers: Customer[] = [
  {
    id: "cus-1",
    name: "Nethmi Perera",
    email: "nethmi@example.com",
    phone: "0771234567",
    address: "12 Temple Road",
    city: "Colombo",
    district: "Colombo",
    totalOrders: 4,
    totalSpending: 28960,
    joinedAt: "2026-02-11T10:00:00.000Z",
    addresses: [
      {
        id: "addr-1",
        label: "Home",
        recipientName: "Nethmi Perera",
        phone: "0771234567",
        addressLine: "12 Temple Road",
        city: "Colombo",
        district: "Colombo",
        isDefault: true
      },
      {
        id: "addr-2",
        label: "Office",
        recipientName: "Nethmi Perera",
        phone: "0771234567",
        addressLine: "Level 4, Union Place",
        city: "Colombo",
        district: "Colombo",
        isDefault: false
      }
    ],
    notifications: mockCustomerNotifications,
    returnRequests: mockReturnRequests,
    exchangeRequests: mockExchangeRequests
  },
  {
    id: "cus-2",
    name: "Ayesha Silva",
    email: "ayesha@example.com",
    phone: "0715552233",
    address: "45 Lake Drive",
    city: "Kandy",
    district: "Kandy",
    totalOrders: 2,
    totalSpending: 15480,
    joinedAt: "2026-01-05T14:30:00.000Z",
    addresses: [
      {
        id: "addr-3",
        label: "Home",
        recipientName: "Ayesha Silva",
        phone: "0715552233",
        addressLine: "45 Lake Drive",
        city: "Kandy",
        district: "Kandy",
        isDefault: true
      }
    ],
    notifications: [],
    returnRequests: [],
    exchangeRequests: []
  },
  {
    id: "cus-3",
    name: "Shenali Fernando",
    email: "shenali@example.com",
    phone: "0768459981",
    address: "8 Flower Lane",
    city: "Galle",
    district: "Galle",
    totalOrders: 6,
    totalSpending: 47630,
    joinedAt: "2025-11-22T09:15:00.000Z",
    addresses: [
      {
        id: "addr-4",
        label: "Home",
        recipientName: "Shenali Fernando",
        phone: "0768459981",
        addressLine: "8 Flower Lane",
        city: "Galle",
        district: "Galle",
        isDefault: true
      }
    ],
    notifications: [],
    returnRequests: [],
    exchangeRequests: []
  }
];

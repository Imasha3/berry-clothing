import type { Order } from "@/types/order";

export const mockOrders: Order[] = [
  {
    id: "BC-24001",
    customerId: "cus-1",
    customerName: "Nethmi Perera",
    email: "nethmi@example.com",
    phone: "0771234567",
    address: "12 Temple Road",
    city: "Colombo",
    district: "Colombo",
    items: [
      {
        productId: "prod-1",
        productName: "Rosette Linen Midi Dress",
        image:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
        sku: "BC-DR-001",
        size: "M",
        color: "Rose Pink",
        quantity: 1,
        price: 7490,
        variantId: "prod-1-v2"
      },
      {
        productId: "prod-3",
        productName: "Pearl Button Blouse",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        sku: "BC-TP-003",
        size: "S",
        color: "White",
        quantity: 1,
        price: 4990,
        variantId: "prod-3-v1"
      }
    ],
    subtotal: 12480,
    deliveryFee: 350,
    total: 12830,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    paymentTimeline: [
      { id: "p1", label: "Order placed", createdAt: "2026-06-09T06:25:00.000Z" },
      { id: "p2", label: "COD pending on delivery", createdAt: "2026-06-09T06:26:00.000Z" }
    ],
    estimatedDeliveryTime: "1-2 business days",
    deliveryStatus: "Ready for Dispatch",
    courierService: "Pronto Lanka",
    trackingNumber: "PRN-BC24001",
    status: "Processing",
    invoice: {
      invoiceId: "INV-24001",
      generatedAt: "2026-06-09T06:28:00.000Z",
      printable: true,
      downloadable: true
    },
    returnRequestStatus: "Not Requested",
    exchangeRequestStatus: "Approved",
    createdAt: "2026-06-09T06:25:00.000Z"
  },
  {
    id: "BC-24002",
    customerId: "cus-2",
    customerName: "Ayesha Silva",
    email: "ayesha@example.com",
    phone: "0715552233",
    address: "45 Lake Drive",
    city: "Kandy",
    district: "Kandy",
    notes: "Please call before delivery.",
    items: [
      {
        productId: "prod-2",
        productName: "Berry Bloom Co-ord Set",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
        sku: "BC-CO-002",
        size: "L",
        color: "Soft Beige",
        quantity: 1,
        price: 10990,
        variantId: "prod-2-v3"
      }
    ],
    subtotal: 10990,
    deliveryFee: 450,
    total: 11440,
    paymentMethod: "Bank Deposit",
    paymentStatus: "Pending",
    paymentTimeline: [
      { id: "p3", label: "Order placed", createdAt: "2026-06-10T11:10:00.000Z" },
      { id: "p4", label: "Receipt uploaded", createdAt: "2026-06-10T11:18:00.000Z" }
    ],
    receiptFileName: "ayesha-deposit-slip.pdf",
    receiptPreviewUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    paymentReceipt: {
      fileName: "ayesha-deposit-slip.pdf",
      fileType: "application/pdf",
      uploadedAt: "2026-06-10T11:18:00.000Z"
    },
    estimatedDeliveryTime: "2-3 business days",
    deliveryStatus: "Pending",
    courierService: "Domex",
    status: "Pending",
    invoice: {
      invoiceId: "INV-24002",
      generatedAt: "2026-06-10T11:12:00.000Z",
      printable: true,
      downloadable: true
    },
    returnRequestStatus: "Pending",
    exchangeRequestStatus: "Not Requested",
    createdAt: "2026-06-10T11:10:00.000Z"
  },
  {
    id: "BC-24003",
    customerId: "cus-3",
    customerName: "Shenali Fernando",
    email: "shenali@example.com",
    phone: "0768459981",
    address: "8 Flower Lane",
    city: "Galle",
    district: "Galle",
    items: [
      {
        productId: "prod-8",
        productName: "Luna Evening Co-ord",
        image:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
        sku: "BC-CO-008",
        size: "M",
        color: "Champagne",
        quantity: 1,
        price: 11490,
        variantId: "prod-8-v4"
      }
    ],
    subtotal: 11490,
    deliveryFee: 500,
    total: 11990,
    paymentMethod: "Online Card Payment",
    paymentStatus: "Paid",
    paymentTimeline: [
      { id: "p5", label: "Order placed", createdAt: "2026-06-08T15:00:00.000Z" },
      { id: "p6", label: "Card payment authorized", createdAt: "2026-06-08T15:25:00.000Z" },
      { id: "p7", label: "Payment captured", createdAt: "2026-06-08T16:10:00.000Z" }
    ],
    transactionId: "TXN-BC24003-8F4Q2",
    paidAt: "2026-06-08T16:10:00.000Z",
    estimatedDeliveryTime: "2-4 business days",
    deliveryStatus: "Out for Delivery",
    courierService: "Koombiyo",
    trackingNumber: "KMB-BC24003",
    status: "Out for Delivery",
    invoice: {
      invoiceId: "INV-24003",
      generatedAt: "2026-06-08T15:02:00.000Z",
      printable: true,
      downloadable: true
    },
    returnRequestStatus: "Not Requested",
    exchangeRequestStatus: "Not Requested",
    createdAt: "2026-06-08T15:00:00.000Z"
  },
  {
    id: "BC-24004",
    customerId: "cus-1",
    customerName: "Nethmi Perera",
    email: "nethmi@example.com",
    phone: "0771234567",
    address: "12 Temple Road",
    city: "Colombo",
    district: "Colombo",
    items: [
      {
        productId: "prod-6",
        productName: "Soft Beige Everyday Tee",
        image:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
        sku: "BC-TP-006",
        size: "M",
        color: "White",
        quantity: 2,
        price: 3490,
        variantId: "prod-6-v6"
      }
    ],
    subtotal: 6980,
    deliveryFee: 350,
    total: 7330,
    paymentMethod: "Online Card Payment",
    paymentStatus: "Paid",
    paymentTimeline: [
      { id: "p8", label: "Order placed", createdAt: "2026-06-11T09:00:00.000Z" },
      { id: "p9", label: "Card payment authorized", createdAt: "2026-06-11T09:01:00.000Z" },
      { id: "p10", label: "Payment captured", createdAt: "2026-06-11T09:02:00.000Z" }
    ],
    transactionId: "TXN-BC24004-1P9LM",
    paidAt: "2026-06-11T09:02:00.000Z",
    estimatedDeliveryTime: "1-2 business days",
    deliveryStatus: "Dispatched",
    courierService: "Prompt Xpress",
    trackingNumber: "PXP-BC24004",
    status: "Dispatched",
    invoice: {
      invoiceId: "INV-24004",
      generatedAt: "2026-06-11T09:05:00.000Z",
      printable: true,
      downloadable: true
    },
    returnRequestStatus: "Not Requested",
    exchangeRequestStatus: "Not Requested",
    createdAt: "2026-06-11T09:00:00.000Z"
  }
];

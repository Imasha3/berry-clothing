export const mockDashboardStats = {
  todayRevenue: 148750,
  todayOrders: 24,
  pendingOrders: 14,
  lowStockProducts: 5,
  monthlyRevenue: 386750,
  paymentMethodSummary: [
    { label: "Cash on Delivery", value: 31, amount: 95400 },
    { label: "Bank Deposit", value: 24, amount: 73450 },
    { label: "Online Card Payment", value: 45, amount: 217900 }
  ],
  salesByCategory: [
    { label: "Tops", value: 24 },
    { label: "T-shirts", value: 18 },
    { label: "Frocks", value: 31 },
    { label: "Full dress", value: 22 }
  ],
  monthlyRevenueTrend: [
    { month: "Jan", revenue: 198000 },
    { month: "Feb", revenue: 214000 },
    { month: "Mar", revenue: 228500 },
    { month: "Apr", revenue: 251200 },
    { month: "May", revenue: 329400 },
    { month: "Jun", revenue: 386750 }
  ],
  bestSellingProducts: [
    { name: "Rosette Linen Midi Dress", units: 32, revenue: 87600 },
    { name: "Luna Evening Co-ord", units: 25, revenue: 71500 },
    { name: "Pearl Button Blouse", units: 24, revenue: 54200 },
    { name: "Celine Wrap Skirt", units: 18, revenue: 39900 }
  ]
};

export const mockReports = [
  {
    title: "Sales Report",
    description: "Revenue trend, average order value, and top performing sales days.",
    metric: "LKR 386,750"
  },
  {
    title: "Revenue Report",
    description: "Revenue by payment method, verified receipts, and pending collections.",
    metric: "LKR 128,430 collected"
  },
  {
    title: "Orders Report",
    description: "Order volume, fulfillment stage counts, and courier allocation summary.",
    metric: "128 orders"
  },
  {
    title: "Product Performance",
    description: "Best sellers, slow movers, and discount-driven products.",
    metric: "8 key SKUs"
  },
  {
    title: "Inventory Report",
    description: "Low stock summary, stock movement, and replenishment priorities.",
    metric: "5 low stock alerts"
  },
  {
    title: "Customer Report",
    description: "Repeat purchase behavior, top spenders, and returning buyers.",
    metric: "61% returning"
  },
  {
    title: "Payment Report",
    description: "COD, bank deposit, and online card payment tracking.",
    metric: "3 payment flows"
  }
];

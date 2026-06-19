import type { InventoryMovement } from "@/types/inventory";

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: "inv-1",
    productId: "prod-1",
    productName: "Rosette Linen Midi Dress",
    sku: "BC-DR-001",
    variant: "Rose Pink / M",
    createdAt: "2026-06-07T08:30:00.000Z",
    type: "Stock In",
    quantity: 6,
    reason: "Restock from supplier",
    previousStock: 1,
    newStock: 7,
    updatedBy: "Imesha Silva"
  },
  {
    id: "inv-2",
    productId: "prod-1",
    productName: "Rosette Linen Midi Dress",
    sku: "BC-DR-001",
    variant: "Ivory / S",
    createdAt: "2026-06-09T09:10:00.000Z",
    type: "Stock Out",
    quantity: 1,
    reason: "Reserved for order BC-24001",
    previousStock: 2,
    newStock: 1,
    updatedBy: "Kavindi Fernando"
  },
  {
    id: "inv-3",
    productId: "prod-2",
    productName: "Berry Bloom Co-ord Set",
    sku: "BC-CO-002",
    variant: "Soft Beige / L",
    createdAt: "2026-06-09T12:00:00.000Z",
    type: "Stock Out",
    quantity: 3,
    reason: "Customer orders packed",
    previousStock: 6,
    newStock: 3,
    updatedBy: "Imesha Silva"
  },
  {
    id: "inv-4",
    productId: "prod-7",
    productName: "Ribbon Detail Skirt",
    sku: "BC-BT-007",
    variant: "Dusty Pink / M",
    createdAt: "2026-06-10T10:45:00.000Z",
    type: "Stock Out",
    quantity: 2,
    reason: "Instagram orders dispatched",
    previousStock: 4,
    newStock: 2,
    updatedBy: "Kavindi Fernando"
  },
  {
    id: "inv-5",
    productId: "prod-6",
    productName: "Soft Beige Everyday Tee",
    sku: "BC-TP-006",
    variant: "White / M",
    createdAt: "2026-06-11T09:05:00.000Z",
    type: "Stock Out",
    quantity: 2,
    reason: "Allocated to order BC-24004",
    previousStock: 9,
    newStock: 7,
    updatedBy: "Imesha Silva"
  }
];

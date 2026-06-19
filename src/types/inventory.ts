export type InventoryMovementType = "Stock In" | "Stock Out";

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variant: string;
  createdAt: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  updatedBy: string;
}

export interface StockFilterOption {
  label: string;
  value: string;
}

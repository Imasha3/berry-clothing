"use client";

import { notFound, useParams } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { formatDate } from "@/lib/utils";

export default function AdminInventoryDetailPage() {
  const params = useParams<{ productId: string }>();
  const { isReady, products, inventoryMovements } = useCommerceStore();

  if (!isReady) {
    return null;
  }

  const product = products.find((item) => item.id === params.productId);
  if (!product) notFound();

  const movements = inventoryMovements.filter((movement) => movement.productId === product.id);
  const stockIn = movements.filter((movement) => movement.type === "Stock In").reduce((sum, item) => sum + item.quantity, 0);
  const stockOut = movements.filter((movement) => movement.type === "Stock Out").reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AdminPage
      eyebrow="Stock Control"
      title={product.productName}
      description="Variant-level stock summary with stock in/out totals, low stock alerts, and movement history."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Current Stock</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{product.stockQuantity}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Total Stock In</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{stockIn}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Total Stock Out</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{stockOut}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Low Stock Alert</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {product.stockQuantity <= product.minStockLevel ? "Yes" : "No"}
          </p>
        </div>
      </div>
      <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="font-display text-2xl text-ink">Variant Stock Levels</h2>
        <div className="mt-5 overflow-hidden rounded-[24px] bg-[#fff7f6] ring-1 ring-black/8">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fff1ef]">
              <tr>
                {["Color", "Size", "Stock", "Minimum Level", "Alert"].map((head) => (
                  <th key={head} className="px-4 py-3 font-semibold text-ink">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr key={variant.id} className="border-t border-black/8">
                  <td className="px-4 py-3">{variant.colorName}</td>
                  <td className="px-4 py-3">{variant.size}</td>
                  <td className="px-4 py-3">{variant.stockQuantity}</td>
                  <td className="px-4 py-3">{product.minStockLevel}</td>
                  <td className="px-4 py-3">
                    {variant.stockQuantity <= product.minStockLevel ? "Low Stock" : "Healthy"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-4">
        {movements.map((movement) => (
          <div key={movement.id} className="rounded-[24px] bg-white p-5 shadow-soft ring-1 ring-black/5 text-sm text-black/65">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-ink">
                {movement.type} - {movement.variant}
              </p>
              <p>{formatDate(movement.createdAt)}</p>
            </div>
            <p className="mt-2">Quantity: {movement.quantity}</p>
            <p className="mt-2">Reason: {movement.reason}</p>
            <p className="mt-2">
              Previous stock {movement.previousStock}, new stock {movement.newStock}
            </p>
            <p className="mt-2">Updated by: {movement.updatedBy}</p>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

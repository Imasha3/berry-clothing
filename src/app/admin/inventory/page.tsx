"use client";

import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { formatDate } from "@/lib/utils";

export default function AdminInventoryPage() {
  const { products, inventoryMovements } = useCommerceStore();
  const lowStockProducts = products.filter((product) => product.stockQuantity <= product.minStockLevel);

  return (
    <AdminPage
      eyebrow="Stock Control"
      title="Inventory"
      description="Inventory history, stock movement filters, low-stock alerts, and minimum stock planning for each product variant."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Total products tracked</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{products.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Low stock alerts</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{lowStockProducts.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Stock in records</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {inventoryMovements.filter((movement) => movement.type === "Stock In").length}
          </p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
          <p className="text-sm text-black/55">Stock out records</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {inventoryMovements.filter((movement) => movement.type === "Stock Out").length}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/admin/inventory/${product.id}`} className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/5">
            <p className="font-semibold text-ink">{product.productName}</p>
            <p className="mt-2 text-sm text-black/60">Current stock: {product.stockQuantity}</p>
            <p className="mt-2 text-sm text-black/60">SKU: {product.sku}</p>
            <p className="mt-2 text-sm text-black/60">Minimum stock level: {product.minStockLevel}</p>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fff6f5]">
            <tr>
              {["Product", "SKU", "Variant", "Date/Time", "Type", "Quantity", "Reason", "Previous", "New", "Updated By"].map((head) => (
                <th key={head} className="px-4 py-4 font-semibold text-ink">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventoryMovements.map((movement) => (
              <tr key={movement.id} className="border-t border-black/8">
                <td className="px-4 py-4">{movement.productName}</td>
                <td className="px-4 py-4">{movement.sku}</td>
                <td className="px-4 py-4">{movement.variant}</td>
                <td className="px-4 py-4">{formatDate(movement.createdAt)}</td>
                <td className="px-4 py-4">{movement.type}</td>
                <td className="px-4 py-4">{movement.quantity}</td>
                <td className="px-4 py-4">{movement.reason}</td>
                <td className="px-4 py-4">{movement.previousStock}</td>
                <td className="px-4 py-4">{movement.newStock}</td>
                <td className="px-4 py-4">{movement.updatedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}

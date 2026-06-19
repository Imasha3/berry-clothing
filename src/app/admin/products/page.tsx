"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { ProductImage } from "@/components/product/product-image";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { getLowStockVariants, getProductMainImage } from "@/lib/product";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const { products, deleteProduct } = useCommerceStore();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const successMessage = window.sessionStorage.getItem("admin-products-success");
    if (!successMessage) {
      return;
    }

    setMessage(successMessage);
    window.sessionStorage.removeItem("admin-products-success");
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.productName.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
  };

  return (
    <AdminPage
      eyebrow="Merchandising"
      title="Products"
      description="Manage mock products, images, price rules, variant stock, and permission-gated delete actions."
    >
      {message ? (
        <div className="rounded-[20px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by product name or SKU"
          className="w-full max-w-md rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft"
        />
        <PermissionGuard permission="products.create">
          <Link href="/admin/products/add" className={buttonStyles()}>
            Add Product
          </Link>
        </PermissionGuard>
      </div>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fff6f5]">
            <tr>
              {["Product", "SKU", "Category", "Price", "Discount Price", "Stock", "Availability", "Actions"].map((head) => (
                <th key={head} className="px-4 py-4 font-semibold text-ink">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const lowStockVariantCount = getLowStockVariants(product).length;

              return (
                <tr key={product.id} className="border-t border-black/8">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-[#fff1ef]">
                        <ProductImage
                          source={getProductMainImage(product)}
                          alt={product.productName}
                          fallbackLabel={product.productName}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{product.productName}</p>
                        <p className="text-xs text-black/45">{product.material}</p>
                        <p className="mt-1 text-xs text-black/45">
                          {product.variants.length} variants, min stock {product.minStockLevel}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-black/70">{product.sku}</td>
                  <td className="px-4 py-4 text-black/70">{product.category}</td>
                  <td className="px-4 py-4 text-black/70">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-4 text-black/70">
                    {product.discountPrice ? formatCurrency(product.discountPrice) : "-"}
                  </td>
                  <td className="px-4 py-4 text-black/70">{product.stockQuantity}</td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <Badge
                        tone={
                          product.availabilityStatus === "In Stock"
                            ? "success"
                            : product.availabilityStatus === "Low Stock"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {product.availabilityStatus}
                      </Badge>
                      {lowStockVariantCount > 0 ? (
                        <p className="text-xs text-amber-700">{lowStockVariantCount} low-stock variant(s)</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/product/${product.id}`} className="text-black/65">
                        View
                      </Link>
                      <Link href={`/admin/products/edit/${product.id}`} className="text-berry-600">
                        Edit
                      </Link>
                      <PermissionGuard permission="products.delete">
                        <button onClick={() => handleDelete(product.id)} className="text-rose-600">
                          Delete
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}

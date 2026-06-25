"use client";

import { notFound, useParams } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const { isReady, products } = useCommerceStore();

  if (!isReady || !params?.id) {
    return null;
  }

  const product = products.find((item) => item.id === params.id);
  if (!product) notFound();

  return (
    <AdminPage
      eyebrow="Merchandising"
      title={`Edit ${product.productName}`}
      description="Update mock product details, images, sizes, colors, pricing, and stock without changing the current admin UI theme."
    >
      <ProductForm mode="edit" initialProduct={product} />
    </AdminPage>
  );
}

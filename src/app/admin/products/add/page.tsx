import { AdminPage } from "@/components/admin/admin-page";
import { ProductForm } from "@/components/admin/product-form";

export default function AdminAddProductPage() {
  return (
    <AdminPage
      eyebrow="Merchandising"
      title="Add Product"
      description="Mock product creation flow with multi-image upload UI, colors, sizes, pricing, and stock fields."
    >
      <ProductForm mode="add" />
    </AdminPage>
  );
}

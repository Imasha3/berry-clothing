"use client";

import { notFound, useParams } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { CategoryForm } from "@/components/admin/category-form";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { useMockCategories } from "@/lib/categories";

export default function AdminEditCategoryPage() {
  const params = useParams<{ id: string }>();
  const { isReady, categories } = useMockCategories();

  if (!isReady || !params?.id) {
    return null;
  }

  const category = categories.find((item) => item.id === params.id);
  if (!category) {
    notFound();
  }

  return (
    <AdminPage
      eyebrow="Catalog"
      title={`Edit ${category.name}`}
      description="Update the category name, slug, optional description, and status using mock-only data."
    >
      <PermissionGuard
        permission="categories.edit"
        fallback={
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 text-sm text-black/60">
            The current role cannot edit categories.
          </div>
        }
      >
        <CategoryForm mode="edit" initialCategory={category} />
      </PermissionGuard>
    </AdminPage>
  );
}

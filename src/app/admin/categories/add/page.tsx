"use client";

import { AdminPage } from "@/components/admin/admin-page";
import { CategoryForm } from "@/components/admin/category-form";
import { PermissionGuard } from "@/components/admin/permission-guard";

export default function AdminAddCategoryPage() {
  return (
    <AdminPage
      eyebrow="Catalog"
      title="Add Category"
      description="Create a simple category with name, slug, optional description, and active status."
    >
      <PermissionGuard
        permission="categories.create"
        fallback={
          <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5 text-sm text-black/60">
            The current role cannot create categories.
          </div>
        }
      >
        <CategoryForm mode="add" />
      </PermissionGuard>
    </AdminPage>
  );
}

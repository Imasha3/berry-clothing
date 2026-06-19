"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { EmptyState } from "@/components/common/empty-state";
import { useAdminSession } from "@/components/providers/admin-session-provider";
import { buttonStyles } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";
import { useMockCategories } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const { currentRole } = useAdminSession();
  const { isReady, categories, deleteCategory, getCategoryProductCount } = useMockCategories();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesSearch =
          category.name.toLowerCase().includes(search.toLowerCase()) ||
          category.slug.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "All" || category.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [categories, search, statusFilter]
  );

  const handleDelete = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    if (getCategoryProductCount(category.name) > 0) {
      setNotice("This category has products. Please move or remove products before deleting.");
      return;
    }

    deleteCategory(categoryId);
    setNotice("Mock category deleted successfully.");
  };

  return (
    <AdminPage
      eyebrow="Catalog"
      title="Categories"
      description="Manage simple product categories with name, slug, status, search, and product-aware delete blocking."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories by name or slug"
            className="w-full max-w-md rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full max-w-[220px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <PermissionGuard permission="categories.create">
          <Link href="/admin/categories/add" className={buttonStyles()}>
            Add Category
          </Link>
        </PermissionGuard>
      </div>

      {notice ? (
        <div className="rounded-[20px] bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div>
      ) : null}

      {!isReady ? null : filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Try a different search or filter, or create a new category if your role allows it."
          ctaLabel={currentRole && hasPermission(currentRole, "categories.create") ? "Add Category" : undefined}
          ctaHref={currentRole && hasPermission(currentRole, "categories.create") ? "/admin/categories/add" : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-black/5">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fff6f5]">
              <tr>
                {["Category Name", "Slug", "Total Products", "Status", "Created Date", "Actions"].map((head) => (
                  <th key={head} className="px-4 py-4 font-semibold text-ink">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-t border-black/8">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{category.name}</p>
                    {category.description ? (
                      <p className="mt-1 text-xs text-black/50">{category.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-black/70">{category.slug}</td>
                  <td className="px-4 py-4 text-black/70">{getCategoryProductCount(category.name)}</td>
                  <td className="px-4 py-4 text-black/70">{category.status}</td>
                  <td className="px-4 py-4 text-black/70">{formatDate(category.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-3">
                      <PermissionGuard permission="categories.edit">
                        <Link href={`/admin/categories/edit/${category.id}`} className="text-berry-600">
                          Edit
                        </Link>
                      </PermissionGuard>
                      <PermissionGuard permission="categories.delete">
                        <button onClick={() => handleDelete(category.id)} className="text-rose-600">
                          Delete
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}

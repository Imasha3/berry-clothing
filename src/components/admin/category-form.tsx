"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createCategorySlug, useMockCategories } from "@/lib/categories";
import type { Category } from "@/types/product";

interface CategoryFormProps {
  mode: "add" | "edit";
  initialCategory?: Category;
}

export function CategoryForm({ mode, initialCategory }: CategoryFormProps) {
  const router = useRouter();
  const { addCategory, updateCategory } = useMockCategories();
  const [name, setName] = useState(initialCategory?.name ?? "");
  const [description, setDescription] = useState(initialCategory?.description ?? "");
  const [status, setStatus] = useState<Category["status"]>(initialCategory?.status ?? "Active");
  const [message, setMessage] = useState("");

  const slug = useMemo(() => createCategorySlug(name), [name]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timestamp = new Date().toISOString();

    if (mode === "add") {
      addCategory({
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        status,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      router.push("/admin/categories");
      return;
    }

    if (!initialCategory) {
      return;
    }

    updateCategory(initialCategory.id, {
      name: name.trim(),
      slug,
      description: description.trim() || undefined,
      status,
      updatedAt: timestamp
    });
    setMessage("Category updated successfully.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Category name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter category name"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Slug</span>
          <input
            value={slug}
            readOnly
            className="w-full rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm"
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-ink">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional category description"
            className="min-h-28 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Category["status"])}
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      {message ? (
        <div className="rounded-[20px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={!name.trim() || !slug}>
          {mode === "add" ? "Create category" : "Save category changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/categories")}>
          Back to Categories
        </Button>
      </div>
    </form>
  );
}

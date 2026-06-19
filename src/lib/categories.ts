"use client";

import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { getDefaultStore } from "@/components/providers/commerce-store-provider";

export function getDefaultCategories() {
  return getDefaultStore().categories;
}

export function createCategorySlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useMockCategories() {
  const {
    isReady,
    categories,
    activeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    products
  } = useCommerceStore();

  const getCategoryProductCount = (categoryName: string) =>
    products.filter((product) => product.category === categoryName).length;

  return {
    isReady,
    categories,
    activeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryProductCount
  };
}

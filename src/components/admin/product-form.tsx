"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product/product-image";
import { Button, buttonStyles } from "@/components/ui/button";
import {
  createProductId,
  getAvailabilityStatus,
  getDefaultStore,
  useCommerceStore
} from "@/components/providers/commerce-store-provider";
import { useMockCategories } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { uploadCloudinaryAsset } from "@/lib/cloudinary";
import type {
  Product,
  ProductAvailabilityStatus,
  ProductColor,
  ProductImage as ProductImageRecord,
  ProductVariant
} from "@/types/product";

const predefinedSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const availabilityOptions: ProductAvailabilityStatus[] = ["In Stock", "Low Stock", "Out of Stock"];

interface EditableProductImage {
  id: string;
  previewUrl?: string;
  file?: File;
  name: string;
  isMain: boolean;
  storedPreviewUrl?: string;
  uploadProgress?: number;
  uploadError?: string;
  resourceType?: "image" | "video";
}

interface ProductFormProps {
  mode: "add" | "edit";
  initialProduct?: Product;
}

function createEmptyProduct() {
  const defaultCategory = getDefaultStore().categories.find((category) => category.status === "Active")?.name ?? "";

  return {
    productName: "",
    sku: "",
    category: defaultCategory,
    price: "",
    discountPrice: "",
    material: "",
    description: "",
    stockQuantity: "0",
    minStockLevel: "5",
    availabilityStatus: "In Stock" as ProductAvailabilityStatus,
    isNewArrival: false,
    isBestSeller: false,
    isSaleItem: false
  };
}

function mapProductImages(images: ProductImageRecord[]) {
  return images.map((image) => ({
    id: image.id,
    previewUrl: image.previewUrl || image.url,
    name: image.alt || image.id,
    isMain: false,
    storedPreviewUrl: image.url,
    resourceType: image.resourceType ?? (image.url.includes("/video/") ? "video" : "image")
  }));
}

function isEphemeralMediaUrl(value?: string) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("file:") ||
    value.startsWith("C:\\")
  );
}

function getPersistableImageUrl(image: EditableProductImage) {
  const candidate = image.storedPreviewUrl ?? image.previewUrl;
  return candidate && !isEphemeralMediaUrl(candidate) ? candidate : "";
}

function createPersistableProductImage(image: EditableProductImage) {
  const url = getPersistableImageUrl(image);
  const resourceType =
    image.resourceType ?? (url.includes("/video/") ? "video" : "image");

  return {
    id: image.id,
    url,
    previewUrl: url,
    resourceType,
    alt: image.name
  };
}

function createVariantId() {
  return `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const { addProduct, updateProduct } = useCommerceStore();
  const { activeCategories, isReady: categoriesReady } = useMockCategories();
  const [fields, setFields] = useState(() =>
    initialProduct
      ? {
          productName: initialProduct.productName,
          sku: initialProduct.sku,
          category: initialProduct.category,
          price: String(initialProduct.price),
          discountPrice: initialProduct.discountPrice ? String(initialProduct.discountPrice) : "",
          material: initialProduct.material,
          description: initialProduct.description,
          stockQuantity: String(initialProduct.stockQuantity),
          minStockLevel: String(initialProduct.minStockLevel),
          availabilityStatus: initialProduct.availabilityStatus,
          isNewArrival: initialProduct.isNewArrival,
          isBestSeller: initialProduct.isBestSeller,
          isSaleItem: initialProduct.isSaleItem
        }
      : createEmptyProduct()
  );
  const [sizes, setSizes] = useState<string[]>(initialProduct?.sizes ?? []);
  const [customSize, setCustomSize] = useState("");
  const [colors, setColors] = useState<ProductColor[]>(initialProduct?.colors ?? []);
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>(initialProduct?.variants ?? []);
  const [variantForm, setVariantForm] = useState({
    colorName: initialProduct?.colors[0]?.name ?? "",
    size: initialProduct?.sizes[0] ?? "",
    stockQuantity: "0"
  });
  const [images, setImages] = useState<EditableProductImage[]>(() => {
    if (!initialProduct) {
      return [];
    }

    return mapProductImages(initialProduct.images).map((image) => ({
      ...image,
      isMain:
        image.storedPreviewUrl === initialProduct.mainImage || image.previewUrl === initialProduct.mainImage
    }));
  });
  const [message, setMessage] = useState("");
  const [failedPreviewImageIds, setFailedPreviewImageIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const isGiftItemsCategory = fields.category === "Gift Items";

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!categoriesReady || activeCategories.length === 0) {
      return;
    }

    setFields((current) => {
      const categoryStillValid = activeCategories.some((category) => category.name === current.category);
      if (categoryStillValid) {
        return current;
      }

      return {
        ...current,
        category: activeCategories[0].name
      };
    });
  }, [activeCategories, categoriesReady]);

  useEffect(() => {
    if (isGiftItemsCategory) {
      return;
    }

    const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
    setFields((current) => ({
      ...current,
      stockQuantity: String(totalStock),
      availabilityStatus: getAvailabilityStatus(totalStock, Number(current.minStockLevel || 0))
    }));
  }, [isGiftItemsCategory, variants]);

  const categoryOptions = useMemo(() => {
    if (!fields.category || activeCategories.some((category) => category.name === fields.category)) {
      return activeCategories;
    }

    return [
      ...activeCategories,
      {
        id: "legacy-category",
        name: fields.category,
        slug: fields.category.toLowerCase(),
        status: "Inactive" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }, [activeCategories, fields.category]);

  const handleFieldChange = (field: keyof typeof fields, value: string | boolean) => {
    setFields((current) => ({
      ...current,
      [field]: value
    }));
  };

  const toggleSize = (size: string) => {
    setSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size]
    );
  };

  const addCustomSize = () => {
    const normalizedSize = customSize.trim().toUpperCase();
    if (!normalizedSize || sizes.includes(normalizedSize)) {
      return;
    }

    setSizes((current) => [...current, normalizedSize]);
    setCustomSize("");
    setVariantForm((current) => ({ ...current, size: normalizedSize }));
  };

  const removeSize = (size: string) => {
    setSizes((current) => current.filter((item) => item !== size));
    setVariants((current) => current.filter((variant) => variant.size !== size));
  };

  const addColor = () => {
    const normalizedName = colorName.trim();
    if (!normalizedName || colors.some((color) => color.name.toLowerCase() === normalizedName.toLowerCase())) {
      return;
    }

    setColors((current) => [
      ...current,
      {
        name: normalizedName,
        code: colorCode.trim() || undefined
      }
    ]);
    setVariantForm((current) => ({ ...current, colorName: normalizedName }));
    setColorName("");
    setColorCode("");
  };

  const removeColor = (name: string) => {
    setColors((current) => current.filter((color) => color.name !== name));
    setVariants((current) => current.filter((variant) => variant.colorName !== name));
  };

  const addVariant = () => {
    if (!variantForm.colorName || !variantForm.size) {
      return;
    }

    const selectedColor = colors.find((color) => color.name === variantForm.colorName);
    const existingVariant = variants.find(
      (variant) => variant.colorName === variantForm.colorName && variant.size === variantForm.size
    );

    if (existingVariant) {
      setVariants((current) =>
        current.map((variant) =>
          variant.id === existingVariant.id
            ? { ...variant, stockQuantity: Number(variantForm.stockQuantity || 0) }
            : variant
        )
      );
      return;
    }

    setVariants((current) => [
      ...current,
      {
        id: createVariantId(),
        colorName: variantForm.colorName,
        colorCode: selectedColor?.code,
        size: variantForm.size,
        stockQuantity: Number(variantForm.stockQuantity || 0)
      }
    ]);
  };

  const removeVariant = (variantId: string) => {
    setVariants((current) => current.filter((variant) => variant.id !== variantId));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files ?? []);
    if (uploadedFiles.length === 0) {
      return;
    }

    const hasMainImage = images.some((image) => image.isMain);
    const nextImages = uploadedFiles.map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);

      const resourceType = file.type.startsWith("video/") ? "video" : "image";

      return {
        id: `upload-${Date.now()}-${index}`,
        file,
        previewUrl: objectUrl,
        name: file.name,
        isMain: !hasMainImage && index === 0,
        resourceType,
        uploadProgress: 0
      } as EditableProductImage;
    });

    setImages((current) => [...current, ...nextImages]);
    setFailedPreviewImageIds((current) => current.filter((id) => !nextImages.some((image) => image.id === id)));

    event.target.value = "";
  };

  const removeImage = (imageId: string) => {
    setImages((current) => {
      const imageToRemove = current.find((image) => image.id === imageId);
      if (imageToRemove?.file && imageToRemove.previewUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
        objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== imageToRemove.previewUrl);
      }

      const nextImages = current.filter((image) => image.id !== imageId);
      if (imageToRemove?.isMain && nextImages[0]) {
        nextImages[0] = {
          ...nextImages[0],
          isMain: true
        };
      }
      return nextImages;
    });
    setFailedPreviewImageIds((current) => current.filter((id) => id !== imageId));
  };

  const markImageAsMain = (imageId: string) => {
    setImages((current) =>
      current.map((image) => ({
        ...image,
        isMain: image.id === imageId
      }))
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const pendingUploads = images.filter((image) => image.file);

    try {
      await Promise.all(
        pendingUploads.map(async (image) => {
          const response = await uploadCloudinaryAsset(image.file!, (progress) => {
            setImages((current) =>
              current.map((entry) =>
                entry.id === image.id ? { ...entry, uploadProgress: progress } : entry
              )
            );
          });

          setImages((current) =>
            current.map((entry) =>
              entry.id === image.id
                ? {
                    ...entry,
                    previewUrl: response.secure_url,
                    storedPreviewUrl: response.secure_url,
                    uploadProgress: 100,
                    uploadError: undefined,
                    file: undefined,
                    resourceType: response.resource_type === "video" ? "video" : "image"
                  }
                : entry
            )
          );
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Product upload failed.";
      setMessage(`Upload error: ${errorMessage}`);
      return;
    }

    const stockQuantity = Number(fields.stockQuantity || 0);
    const minStockLevel = Number(fields.minStockLevel || 0);
    const normalizedImages = images.map((image) => {
      const imageUrl = getPersistableImageUrl(image);
      return {
        id: image.id,
        url: imageUrl,
        previewUrl: imageUrl,
        resourceType: image.resourceType ?? (imageUrl.includes("/video/") ? "video" : "image"),
        alt: image.name
      };
    });

    const mainImage =
      normalizedImages.find((image) => images.find((entry) => entry.id === image.id)?.isMain)?.previewUrl ??
      normalizedImages[0]?.previewUrl ??
      "";
    const normalizedProduct: Product = {
      id: initialProduct?.id ?? createProductId(fields.productName),
      productName: fields.productName.trim(),
      sku: fields.sku.trim(),
      category: fields.category,
      price: Number(fields.price || 0),
      discountPrice: fields.discountPrice ? Number(fields.discountPrice) : undefined,
      sizes: isGiftItemsCategory ? [] : sizes,
      colors: isGiftItemsCategory ? [] : colors,
      material: isGiftItemsCategory ? "" : fields.material.trim(),
      description: fields.description.trim(),
      images: normalizedImages,
      mainImage,
      minStockLevel,
      stockQuantity,
      availabilityStatus: isGiftItemsCategory
        ? fields.availabilityStatus
        : getAvailabilityStatus(stockQuantity, minStockLevel),
      variants: isGiftItemsCategory ? [] : variants,
      isNewArrival: fields.isNewArrival,
      isBestSeller: fields.isBestSeller,
      isSaleItem: fields.isSaleItem,
      featuredReview: initialProduct?.featuredReview
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("[ProductForm] submit", normalizedProduct);
    }

    if (mode === "add") {
      addProduct(normalizedProduct);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("admin-products-success", "Product created successfully.");
      }
      router.push("/admin/products");
      return;
    }

    updateProduct(initialProduct!.id, normalizedProduct);
    setMessage("Product updated successfully.");
  };

  const lowStockVariants = variants.filter(
    (variant) => variant.stockQuantity <= Number(fields.minStockLevel || 0)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Product name</span>
          <input
            value={fields.productName}
            onChange={(event) => handleFieldChange("productName", event.target.value)}
            placeholder="Enter product name"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">SKU / product code</span>
          <input
            value={fields.sku}
            onChange={(event) => handleFieldChange("sku", event.target.value)}
            placeholder="BC-DR-001"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Category</span>
          <select
            value={fields.category}
            onChange={(event) => handleFieldChange("category", event.target.value)}
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            disabled={categoryOptions.length === 0}
          >
            {categoryOptions.length === 0 ? <option value="">No active categories available</option> : null}
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {categoryOptions.length === 0 ? (
            <p className="text-xs text-rose-600">Create an active category before assigning products.</p>
          ) : null}
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Availability status</span>
          <select
            value={fields.availabilityStatus}
            onChange={(event) => handleFieldChange("availabilityStatus", event.target.value)}
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Price</span>
          <input
            type="number"
            min="0"
            value={fields.price}
            onChange={(event) => handleFieldChange("price", event.target.value)}
            placeholder="0"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Discount price</span>
          <input
            type="number"
            min="0"
            value={fields.discountPrice}
            onChange={(event) => handleFieldChange("discountPrice", event.target.value)}
            placeholder="Optional sale price"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        {!isGiftItemsCategory ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Material</span>
            <input
              value={fields.material}
              onChange={(event) => handleFieldChange("material", event.target.value)}
              placeholder="Cotton satin"
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            />
          </label>
        ) : null}
        {!isGiftItemsCategory ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Minimum stock level</span>
            <input
              type="number"
              min="0"
              value={fields.minStockLevel}
              onChange={(event) => handleFieldChange("minStockLevel", event.target.value)}
              placeholder="5"
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            />
          </label>
        ) : null}
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">
            {isGiftItemsCategory ? "Quantity / Stock" : "Total stock quantity"}
          </span>
          <input
            type="number"
            min="0"
            value={fields.stockQuantity}
            onChange={(event) => handleFieldChange("stockQuantity", event.target.value)}
            readOnly={!isGiftItemsCategory}
            className={cn(
              "w-full rounded-2xl border border-black/10 px-4 py-3 text-sm",
              isGiftItemsCategory ? "bg-white" : "bg-black/5"
            )}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-ink">Description</span>
          <textarea
            value={fields.description}
            onChange={(event) => handleFieldChange("description", event.target.value)}
            placeholder="Describe fit, fabric, and styling details"
            className="min-h-32 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />
        </label>
      </div>

      {!isGiftItemsCategory ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[24px] border border-black/8 bg-[#fffaf9] p-5">
              <h2 className="text-base font-semibold text-ink">Product sizes</h2>
              <p className="mt-1 text-sm text-black/60">Choose standard sizes or add a custom option.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {predefinedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      sizes.includes(size) ? "bg-berry-500 text-white" : "bg-white text-ink ring-1 ring-black/10"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={customSize}
                  onChange={(event) => setCustomSize(event.target.value)}
                  placeholder="Add custom size"
                  className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-sm"
                />
                <Button type="button" variant="secondary" onClick={addCustomSize}>
                  Add size
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm ring-1 ring-black/8"
                  >
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="text-black/45 hover:text-rose-600">
                      Remove
                    </button>
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-[#fffaf9] p-5">
              <h2 className="text-base font-semibold text-ink">Product colors</h2>
              <p className="mt-1 text-sm text-black/60">Add multiple colors with an optional hex code.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                <input
                  value={colorName}
                  onChange={(event) => setColorName(event.target.value)}
                  placeholder="Color name"
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
                />
                <input
                  value={colorCode}
                  onChange={(event) => setColorCode(event.target.value)}
                  placeholder="#000000"
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
                />
                <Button type="button" variant="secondary" onClick={addColor}>
                  Add color
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {colors.map((color) => (
                  <div
                    key={color.name}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-black/8"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-5 w-5 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: color.code || "#f6d7d4" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">{color.name}</p>
                        <p className="text-xs text-black/50">{color.code || "No code added"}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeColor(color.name)} className="text-sm text-rose-600">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-[24px] border border-black/8 bg-[#fffaf9] p-5">
            <h2 className="text-base font-semibold text-ink">Variant stock management</h2>
            <p className="mt-1 text-sm text-black/60">
              Manage stock by size and color combination to support accurate inventory tracking.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
              <select
                value={variantForm.colorName}
                onChange={(event) => setVariantForm((current) => ({ ...current, colorName: event.target.value }))}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
              >
                <option value="">Select color</option>
                {colors.map((color) => (
                  <option key={color.name} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
              <select
                value={variantForm.size}
                onChange={(event) => setVariantForm((current) => ({ ...current, size: event.target.value }))}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
              >
                <option value="">Select size</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={variantForm.stockQuantity}
                onChange={(event) =>
                  setVariantForm((current) => ({ ...current, stockQuantity: event.target.value }))
                }
                placeholder="Stock"
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
              />
              <Button type="button" variant="secondary" onClick={addVariant}>
                Add variant
              </Button>
            </div>
            <div className="mt-5 overflow-hidden rounded-[22px] bg-white ring-1 ring-black/8">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#fff4f2]">
                  <tr>
                    {["Color", "Size", "Stock", "Status", "Action"].map((head) => (
                      <th key={head} className="px-4 py-3 font-semibold text-ink">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id} className="border-t border-black/8">
                      <td className="px-4 py-3">{variant.colorName}</td>
                      <td className="px-4 py-3">{variant.size}</td>
                      <td className="px-4 py-3">{variant.stockQuantity}</td>
                      <td className="px-4 py-3">
                        {variant.stockQuantity <= Number(fields.minStockLevel || 0) ? "Low Stock" : "Healthy"}
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => removeVariant(variant.id)} className="text-rose-600">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lowStockVariants.length > 0 ? (
              <div className="mt-4 rounded-[20px] bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {lowStockVariants.length} variant(s) are below the minimum stock level.
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      <section className="rounded-[24px] border border-black/8 bg-[#fffaf9] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Product image upload</h2>
            <p className="mt-1 text-sm text-black/60">
              Placeholder upload flow for now. Multiple images, preview, remove, and main image selection are ready.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button type="button" onClick={() => inputRef.current?.click()} className={buttonStyles("secondary")}>
            Upload images
          </button>
        </div>
        {images.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-sm text-black/55">
            Add one or more product images to preview them here. Cloudinary integration will be connected later.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {images.map((image) => {
              const hasPreviewError = failedPreviewImageIds.includes(image.id);
              return (
                <div key={image.id} className="overflow-hidden rounded-[24px] bg-white ring-1 ring-black/8">
                  <div className="relative aspect-[4/5] bg-[#f7efed]">
                    <ProductImage
                      source={{
                        url: image.previewUrl,
                        previewUrl: image.previewUrl,
                        resourceType: image.resourceType
                      }}
                      alt={image.name || "Product preview"}
                      fallbackLabel={fields.productName || "No Image"}
                    />
                    {image.isMain ? (
                      <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                        Main image
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="truncate text-sm text-black/60">{image.name || "Uploaded image"}</p>
                    {image.uploadProgress != null && image.uploadProgress < 100 ? (
                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full bg-berry-500"
                            style={{ width: `${image.uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-black/60">Uploading {image.uploadProgress}%</p>
                      </div>
                    ) : null}
                    {image.uploadError ? (
                      <p className="text-xs text-rose-600">{image.uploadError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => markImageAsMain(image.id)}
                        className={buttonStyles("ghost", "px-0 py-0 text-sm font-semibold text-berry-600")}
                      >
                        {image.isMain ? "Selected as main" : "Mark as main"}
                      </button>
                      <button type="button" onClick={() => removeImage(image.id)} className="text-sm font-semibold text-rose-600">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!isGiftItemsCategory ? (
        <section className="rounded-[24px] border border-black/8 bg-[#fffaf9] p-5">
          <h2 className="text-base font-semibold text-ink">Product flags</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["isNewArrival", "New Arrival"],
              ["isBestSeller", "Best Seller"],
              ["isSaleItem", "Sale Item"]
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/8">
                <input
                  type="checkbox"
                  checked={Boolean(fields[field as keyof typeof fields])}
                  onChange={(event) => handleFieldChange(field as keyof typeof fields, event.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-berry-500 focus:ring-berry-200"
                />
                <span className="text-sm font-medium text-ink">{label}</span>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {message ? (
        <div className="rounded-[20px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit">{mode === "add" ? "Create product" : "Save product changes"}</Button>
        <Button type="button" variant="secondary" onClick={() => setMessage("")}>
          Clear notice
        </Button>
      </div>
    </form>
  );
}

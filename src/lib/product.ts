import { resolveProductImageSource, type ResolvableProductImageSource } from "@/lib/product-image";
import type { Product, ProductColor, ProductImage } from "@/types/product";

export function getProductMainImage(product: Product) {
  return resolveProductImageSource(product.mainImage) || getProductImageUrls(product)[0] || "";
}

export function getProductImageUrls(product: Product) {
  return product.images
    .map((image) => resolveProductImageSource(image))
    .filter((image): image is string => Boolean(image));
}

export function getProductImageSources(product: Product) {
  const sources: ResolvableProductImageSource[] = [];
  const seen = new Set<string>();

  const pushSource = (source?: string | ProductImage | null) => {
    const resolved = resolveProductImageSource(source);
    if (!resolved || seen.has(resolved)) {
      return;
    }

    seen.add(resolved);
    if (typeof source === "string") {
      sources.push({ url: source });
      return;
    }

    sources.push({
      url: source?.url,
      previewUrl: source?.previewUrl,
      resourceType: source?.resourceType,
      alt: source?.alt
    });
  };

  pushSource(product.mainImage);
  product.images.forEach((image) => pushSource(image));
  return sources;
}

export function getProductColorNames(colors: ProductColor[]) {
  return colors.map((color) => color.name);
}

export function hasProductColor(colors: ProductColor[], colorName: string) {
  return colors.some((color) => color.name === colorName);
}

export function getProductVariantLabel(colorName: string, size: string) {
  return `${colorName} / ${size}`;
}

export function getLowStockVariants(product: Product) {
  return product.variants.filter((variant) => variant.stockQuantity <= product.minStockLevel);
}

export function calculateDiscountedPrice(originalPrice: number, discountPercentage: number) {
  const normalizedPercentage = Math.min(100, Math.max(0, discountPercentage));
  return Math.round((originalPrice - originalPrice * normalizedPercentage / 100) * 100) / 100;
}

export function getProductPricing(product: Product) {
  const originalPrice = product.originalPrice ?? product.price;
  const discountPercentage =
    product.discountPercentage ??
    (product.discountPrice && product.discountPrice < originalPrice
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0);
  const isDiscounted = Boolean(product.isDiscounted ?? discountPercentage > 0);
  const discountedPrice = isDiscounted
    ? product.discountedPrice ?? product.discountPrice ?? calculateDiscountedPrice(originalPrice, discountPercentage)
    : originalPrice;
  const savings = Math.max(0, originalPrice - discountedPrice);

  return {
    originalPrice,
    discountPercentage,
    discountedPrice,
    isDiscounted: isDiscounted && savings > 0,
    savings
  };
}

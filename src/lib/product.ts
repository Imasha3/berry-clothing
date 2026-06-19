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

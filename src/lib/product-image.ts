export interface ResolvableProductImageSource {
  url?: string;
  previewUrl?: string;
  resourceType?: "image" | "video";
  alt?: string;
}

export function resolveProductImageSource(source?: ResolvableProductImageSource | string | null) {
  if (!source) {
    return "";
  }

  if (typeof source === "string") {
    return source;
  }

  return source.previewUrl || source.url || "";
}

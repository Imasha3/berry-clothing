"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveProductImageSource, type ResolvableProductImageSource } from "@/lib/product-image";
import { cn } from "@/lib/utils";

export type ProductImageSource = ResolvableProductImageSource;

interface ProductImageProps {
  source?: ProductImageSource | string | null;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  loading?: "lazy" | "eager";
}

function getInitials(label: string) {
  const parts = label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "No Image";
  }

  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "No Image";
}

function isVideoSource(source?: ProductImageSource | string | null, resolvedSource?: string) {
  if (typeof source === "object" && source?.resourceType === "video") {
    return true;
  }

  if (!resolvedSource) {
    return false;
  }

  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(resolvedSource) || resolvedSource.includes("/video/");
}

export function ProductImage({
  source,
  alt,
  fallbackLabel,
  className,
  imageClassName,
  fallbackClassName,
  loading = "lazy"
}: ProductImageProps) {
  const resolvedSource = useMemo(() => resolveProductImageSource(source), [source]);
  const isVideo = useMemo(() => isVideoSource(source, resolvedSource), [source, resolvedSource]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [resolvedSource]);

  if (!resolvedSource || hasError) {
    return (
      <div
        aria-label={alt}
        className={cn(
          "flex h-full w-full items-center justify-center bg-[#fff4f2] text-center text-black/45",
          className,
          fallbackClassName
        )}
      >
        <span className="px-3 text-sm font-semibold uppercase tracking-[0.12em]">
          {getInitials(fallbackLabel || alt)}
        </span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={resolvedSource}
        controls
        onError={() => setHasError(true)}
        className={cn("h-full w-full object-cover", className, imageClassName)}
      />
    );
  }

  return (
    <img
      src={resolvedSource}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover object-center", className, imageClassName)}
    />
  );
}

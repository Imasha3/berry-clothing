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

export function ProductImage({
  source,
  alt,
  fallbackLabel,
  className,
  imageClassName,
  fallbackClassName
}: ProductImageProps) {
  const resolvedSource = useMemo(() => resolveProductImageSource(source), [source]);
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

  return (
    <img
      src={resolvedSource}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover", className, imageClassName)}
    />
  );
}

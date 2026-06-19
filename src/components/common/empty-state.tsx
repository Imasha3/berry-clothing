import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-black/15 bg-white p-8 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-sm text-black/60">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={buttonStyles("primary", "mt-5")}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

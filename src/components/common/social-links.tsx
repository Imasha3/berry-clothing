"use client";

import type { SocialLinks } from "@/types/settings";
import { cn } from "@/lib/utils";

const socialIconSources = {
  facebook: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
  tiktok: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
  whatsapp: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
  instagram: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
  youtube: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
};

const labels = {
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  youtube: "YouTube"
};

export function SocialLinksRow({
  links,
  showText = false,
  className,
  iconClassName
}: {
  links: SocialLinks;
  showText?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const entries = (["facebook", "tiktok", "whatsapp", "instagram", "youtube"] as const)
    .map((key) => ({ key, href: links[key] }))
    .filter((entry) => Boolean(entry.href));

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {entries.map(({ key, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={labels[key]}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-black/10 transition duration-300 hover:-translate-y-[3px] hover:shadow-soft",
            iconClassName
          )}
        >
          <img src={socialIconSources[key]} alt="" className="h-5 w-5 object-contain" loading="lazy" />
          {showText ? <span>{labels[key]}</span> : null}
        </a>
      ))}
    </div>
  );
}

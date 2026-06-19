import type { ReactNode } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { SectionHeading } from "@/components/common/section-heading";

export function AdminPage({
  eyebrow,
  title,
  description,
  children,
  empty
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  empty?: {
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
}) {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      {children}
      {empty ? <EmptyState {...empty} /> : null}
    </div>
  );
}

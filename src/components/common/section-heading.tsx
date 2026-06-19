export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-3 inline-flex rounded-full bg-[#ffe3ea] px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-berry-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl text-ink md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-sm text-black/65 md:text-base">{description}</p> : null}
    </div>
  );
}

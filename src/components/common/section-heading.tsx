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
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-2 inline-flex rounded-full bg-[#fff0f4] px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-berry-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl text-ink md:text-4xl lg:text-5xl leading-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm text-black/65 md:text-base">{description}</p> : null}
    </div>
  );
}

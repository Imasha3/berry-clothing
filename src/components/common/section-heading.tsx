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
    <div className="max-w-3xl mb-8 md:mb-12">
      {eyebrow ? (
        <p className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.3em] text-berry-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-light text-ink md:text-4xl lg:text-5xl leading-tight tracking-wide">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60 font-body font-light">
          {description}
        </p>
      ) : null}
    </div>
  );
}

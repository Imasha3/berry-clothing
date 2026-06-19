export function StatCard({
  label,
  value,
  helpText
}: {
  label: string;
  value: string;
  helpText?: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#f2d8dd] bg-white/90 p-5 shadow-[0_18px_45px_rgba(34,24,27,0.08)] ring-1 ring-white/70 backdrop-blur">
      <p className="text-sm font-medium text-black/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {helpText ? <p className="mt-2 text-sm text-black/60">{helpText}</p> : null}
    </div>
  );
}

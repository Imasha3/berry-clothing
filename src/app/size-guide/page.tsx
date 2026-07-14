const ladiesSizes = [
  ["XS", "30-32", "24-26", "33-35", "14", "34"],
  ["S", "32-34", "26-28", "35-37", "14.5", "35"],
  ["M", "34-36", "28-30", "37-39", "15", "36"],
  ["L", "36-38", "30-32", "39-41", "15.5", "37"],
  ["XL", "38-40", "32-34", "41-43", "16", "38"],
  ["XXL", "40-42", "34-36", "43-45", "16.5", "39"],
];

function SizeTable({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_25px_60px_rgba(23,18,18,0.10)] ring-1 ring-berry-100 border border-berry-100">
      {" "}
      <div className="border-b border-berry-100 bg-gradient-to-r from-berry-50 to-pink-50 px-8 py-6 sm:px-10">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">
          Ladies' Size Guide
        </h2>
        <p className="mt-2 text-base text-black/60">
          Body measurements are shown in inches.
        </p>
      </div>
      <div className="overflow-x-auto rounded-b-2xl">
        <table className="min-w-full border-separate border-spacing-0 text-left">
       
          <thead className="bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 text-berry-900">
            <tr>
              {["Size", "Bust", "Waist", "Hip", "Shoulder", "Length"].map(
                (head) => (
                  <th
                    key={head}
                    className="whitespace-nowrap px-6 py-5 text-[15px] font-semibold uppercase tracking-wider first:rounded-tl-xl last:rounded-tr-xl"
                  >
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[0]}
                className="border-b border-berry-100 even:bg-gray-50/50 hover:bg-pink-50 transition-all duration-300"
              >
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${cell}`}
                    className={`whitespace-nowrap px-6 py-5 text-[15px] ${
                      index === 0
                        ? "font-semibold text-berry-800"
                        : "text-gray-700"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-berry-700">
            Size Guide
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-ink">
            Perfect fits, made easier.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-black/64">
            Use this guide for dresses, tops, shirts, pants, and other Berry
            Clothing styles. Measure over light clothing and compare against the
            chart before placing your order.
          </p>
        </div>
        <div className="group overflow-hidden rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-black/5">
          <img
            src="/body_measurement_guide.png"
            alt="Body measurement guide diagram showing where to measure"
            className="w-full h-auto rounded-[16px] object-contain transition duration-[350ms] ease-out group-hover:scale-[1.02]"
          />
        </div>
      </section>

      <section className="py-12">
        <SizeTable rows={ladiesSizes} />
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-berry-700">
          How To Measure
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Shoulder Width",
              "Measure across the back from the edge of one shoulder bone to the other.",
            ],
            [
              "Bust / Chest",
              "Measure around the fullest part of your bust/chest, keeping the tape horizontal.",
            ],
            [
              "Sleeve Length",
              "Measure from the shoulder joint down to the wrist bone.",
            ],
            [
              "Waist",
              "Measure around the narrowest part of your waistline (usually just above the belly button).",
            ],
            [
              "Hips",
              "Measure around the fullest part of your hips (usually 7-8 inches below the waist).",
            ],
            [
              "Inseam",
              "Measure from the crotch point down to the ankle bone along the inner leg (if applicable).",
            ],
            [
              "Overall Length",
              "Measure from the highest point of the shoulder down to the desired garment hemline.",
            ],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-[20px] bg-berry-50 p-5 ring-1 ring-berry-100/50"
            >
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-black/60">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

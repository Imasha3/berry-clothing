export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
        <h1 className="font-display text-5xl text-ink">Size Guide</h1>
        <p className="mt-5 text-sm text-black/60">Mock size guide content for dresses, co-ords, tops, and bottoms.</p>
        <div className="mt-8 overflow-hidden rounded-[24px] border border-black/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fff6f5] text-ink">
              <tr>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Bust</th>
                <th className="px-4 py-3">Waist</th>
                <th className="px-4 py-3">Hips</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["S", "32-34", "26-28", "35-37"],
                ["M", "34-36", "28-30", "37-39"],
                ["L", "36-38", "30-32", "39-41"],
                ["XL", "38-40", "32-34", "41-43"]
              ].map((row) => (
                <tr key={row[0]} className="border-t border-black/10">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3 text-black/65">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

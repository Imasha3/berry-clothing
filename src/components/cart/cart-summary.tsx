import { formatCurrency } from "@/lib/utils";

export function CartSummary({ subtotal }: { subtotal: number }) {
  const deliveryFee = subtotal > 0 ? 450 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
      <h2 className="font-display text-2xl text-ink">Order Summary</h2>
      <div className="mt-5 space-y-3 text-sm text-black/65">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

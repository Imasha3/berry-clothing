import { formatCurrency } from "@/lib/utils";

export function CartSummary({
  subtotal,
  originalSubtotal = subtotal,
  discountTotal = 0,
  deliveryFee: deliveryFeeOverride
}: {
  subtotal: number;
  originalSubtotal?: number;
  discountTotal?: number;
  deliveryFee?: number;
}) {
  const deliveryFee = subtotal > 0 ? 450 : 0;
  const finalDeliveryFee = deliveryFeeOverride ?? deliveryFee;
  const total = subtotal + finalDeliveryFee;

  return (
    <div className="rounded-[8px] bg-white p-6 shadow-soft ring-1 ring-black/5">
      <h2 className="font-display text-2xl text-ink">Order Summary</h2>
      <div className="mt-5 space-y-3 text-sm text-black/65">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(originalSubtotal)}</span>
        </div>
        <div className="flex justify-between text-emerald-700">
          <span>Discount</span>
          <span>-{formatCurrency(discountTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatCurrency(finalDeliveryFee)}</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

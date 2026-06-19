import { mockPaymentHistory } from "@/data/mockBusiness";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountPaymentHistoryPage() {
  return (
    <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-black/5">
      <h1 className="font-display text-4xl text-ink">Payment History</h1>
      <div className="mt-6 space-y-4">
        {mockPaymentHistory.map((payment) => (
          <div key={payment.id} className="rounded-[24px] border border-black/8 p-5 text-sm text-black/65">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-ink">{payment.orderId}</p>
              <p>{formatDate(payment.createdAt)}</p>
            </div>
            <p className="mt-2">Method: {payment.method}</p>
            <p className="mt-2">Status: {payment.status}</p>
            <p className="mt-2">Amount: {formatCurrency(payment.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

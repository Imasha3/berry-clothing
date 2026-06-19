import { AdminPage } from "@/components/admin/admin-page";

const promotions = [
  { title: "Weekend Dress Drop", type: "Discount", detail: "15% off selected dresses" },
  { title: "First Order Coupon", type: "Coupon", detail: "BERRY10 for first-time customers" },
  { title: "Avurudu Edit", type: "Seasonal Offer", detail: "Curated festive collection landing banner" }
];

export default function AdminPromotionsPage() {
  return (
    <AdminPage
      eyebrow="Growth"
      title="Promotions"
      description="Promotion management UI for discounts, coupons, seasonal offers, and sale item planning."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promotions.map((promotion) => (
          <div key={promotion.title} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="font-semibold text-ink">{promotion.title}</p>
            <p className="mt-2 text-sm text-black/60">{promotion.type}</p>
            <p className="mt-4 text-sm leading-7 text-black/60">{promotion.detail}</p>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

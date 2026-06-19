import { AdminPage } from "@/components/admin/admin-page";
import { mockReports } from "@/data/mockReports";

export default function AdminReportsPage() {
  return (
    <AdminPage
      eyebrow="Insights"
      title="Reports"
      description="Mock dashboards for sales, revenue, orders, inventory, customers, product performance, and payments."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockReports.map((report) => (
          <div key={report.title} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="font-semibold text-ink">{report.title}</p>
            <p className="mt-2 text-sm leading-7 text-black/60">{report.description}</p>
            <p className="mt-4 font-display text-2xl text-berry-700">{report.metric}</p>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

import { AdminPage } from "@/components/admin/admin-page";
import { mockEmailTemplates } from "@/data/mockBusiness";

export default function AdminEmailTemplatesPage() {
  return (
    <AdminPage
      eyebrow="Communication"
      title="Email Templates"
      description="Mock email-management UI ready for future Resend integration and transactional order workflows."
    >
      <div className="space-y-4">
        {mockEmailTemplates.map((template) => (
          <div key={template.key} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="font-semibold text-ink">{template.name}</p>
            <p className="mt-2 text-sm text-black/60">Subject: {template.subject}</p>
            <p className="mt-3 text-sm leading-7 text-black/60">{template.body}</p>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}

import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";
import { FeedbackTable } from "@/components/admin/feedback-table";
import { getAdminFeedback } from "@/lib/queries/admin";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["meta.adminFeedback"] };
}

export default async function AdminFeedbackPage() {
  const feedback = await getAdminFeedback();

  return (
    <main id="contenu" className="px-4 py-6 sm:px-8">
      <div className="mb-6">
        <AdminHeader
          title="Feedback"
          subtitle={`Beta feedback from members. ${feedback.length} total.`}
        />
      </div>

      <FeedbackTable items={feedback} />
    </main>
  );
}

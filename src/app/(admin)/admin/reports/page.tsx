import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";
import { ReportsTable } from "@/components/admin/reports-table";
import { getReports } from "@/lib/queries/admin";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["meta.adminReports"] };
}

export default async function AdminReportsPage() {
  const reports = await getReports();
  const open = reports.filter((r) => r.status === "open");

  return (
    <main className="px-4 py-6 sm:px-8">
      <div className="mb-6">
        <AdminHeader
          title="Reports"
          subtitle={`Flagged posts and comments. ${open.length} open.`}
        />
      </div>

      <ReportsTable initial={reports} />
    </main>
  );
}

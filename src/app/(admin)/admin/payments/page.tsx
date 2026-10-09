import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Card } from "@/components/ui/card";
import { getRecentPayments } from "@/lib/queries/admin-stats";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.adminPayments"],
  };
}

export default async function AdminPaymentsPage() {
  const payments = await getRecentPayments(20);
  const succeeded = payments.filter((p) => p.status === "succeeded").length;
  const failed = payments.filter((p) => p.status === "failed").length;

  return (
    <main className="px-4 py-6 sm:px-8">
      <AdminHeader
        title="Payments"
        subtitle="Recent Stripe billing events. Amounts aren't stored on the audit log yet — see Payments query TODO."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Succeeded</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-green-bright">
            {succeeded}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Failed / canceled</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-danger">
            {failed}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Net revenue</p>
          <p className="mt-1 font-serif text-3xl font-semibold">—</p>
        </Card>
      </div>

      {payments.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No billing events yet.</p>
        </Card>
      ) : (
        <DataTable
          rows={payments}
          columns={[
            {
              key: "user",
              header: "Customer",
              render: (r) => <span className="font-medium">{r.user}</span>,
            },
            { key: "plan", header: "Plan", className: "text-muted" },
            { key: "amount", header: "Amount" },
            {
              key: "status",
              header: "Status",
              render: (r) => <StatusPill status={r.status} />,
            },
            { key: "date", header: "Date", className: "text-muted" },
          ]}
        />
      )}
    </main>
  );
}

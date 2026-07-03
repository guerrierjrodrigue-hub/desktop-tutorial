import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Card } from "@/components/ui/card";
import { adminPayments } from "@/data/admin";

export const metadata: Metadata = { title: "Admin · Payments" };

export default function AdminPaymentsPage() {
  const succeeded = adminPayments.filter((p) => p.status === "succeeded").length;
  const failed = adminPayments.filter((p) => p.status === "failed").length;

  return (
    <main className="px-4 py-6 sm:px-8">
      <AdminHeader
        title="Payments"
        subtitle="Recent Stripe activity and subscription revenue."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Succeeded (24h)</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-green-bright">
            {succeeded}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Failed (24h)</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-danger">
            {failed}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Net revenue (24h)</p>
          <p className="mt-1 font-serif text-3xl font-semibold">$97.00</p>
        </Card>
      </div>

      <DataTable
        rows={adminPayments}
        columns={[
          { key: "user", header: "Customer", render: (r) => <span className="font-medium">{r.user}</span> },
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
    </main>
  );
}

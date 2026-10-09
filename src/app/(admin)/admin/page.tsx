import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/admin/data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { getAdminStats, getRecentUsers, getAdminLogs } from "@/lib/queries/admin-stats";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.adminOverview"],
  };
}

const logColor: Record<string, string> = {
  info: "text-green-bright",
  warn: "text-warning",
  error: "text-danger",
};

export default async function AdminOverviewPage() {
  const [stats, users, logs] = await Promise.all([
    getAdminStats(),
    getRecentUsers(5),
    getAdminLogs(8),
  ]);

  return (
    <main className="px-4 py-6 sm:px-8">
      <AdminHeader
        title="Overview"
        subtitle="The health of Kingdom Athlete at a glance."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 font-serif text-3xl font-semibold">{s.value}</p>
            <p
              className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                s.positive ? "text-green-bright" : "text-danger"
              }`}
            >
              {s.positive ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {s.delta}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Recent users</h2>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sm text-gold-bright hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <DataTable
            rows={users}
            columns={[
              { key: "name", header: "Name" },
              { key: "plan", header: "Plan" },
              {
                key: "status",
                header: "Status",
                render: (r) => <StatusPill status={r.status} />,
              },
              { key: "joined", header: "Joined", className: "text-muted" },
            ]}
          />
        </div>

        <div>
          <h2 className="mb-3 font-serif text-lg font-semibold">System logs</h2>
          <Card>
            {logs.length === 0 ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log.id} className="flex gap-3 text-sm">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full bg-current ${logColor[log.level]}`}
                    />
                    <div>
                      <p className="leading-snug text-foreground/90">{log.message}</p>
                      <p className="text-xs text-faint">{log.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

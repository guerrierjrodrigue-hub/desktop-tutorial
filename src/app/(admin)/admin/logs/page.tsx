import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { getAdminLogs } from "@/lib/queries/admin-stats";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Logs" };

const levelStyle: Record<string, string> = {
  info: "bg-green/15 text-green-bright",
  warn: "bg-warning/15 text-warning",
  error: "bg-danger/15 text-danger",
};

export default async function AdminLogsPage() {
  const logs = await getAdminLogs(30);

  return (
    <main className="px-4 py-6 sm:px-8">
      <AdminHeader
        title="Logs"
        subtitle="Activity feed from billing events and signups."
      />

      <Card className="p-0">
        {logs.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">
            No recent activity.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
                    levelStyle[log.level],
                  )}
                >
                  {log.level}
                </span>
                <span className="flex-1 text-foreground/90">{log.message}</span>
                <span className="shrink-0 text-xs text-faint">{log.time}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}

import type { Metadata } from "next";
import { Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminUsers } from "@/data/admin";

export const metadata: Metadata = { title: "Admin · Users" };

export default function AdminUsersPage() {
  return (
    <main className="px-4 py-6 sm:px-8">
      <AdminHeader
        title="Users"
        subtitle={`${adminUsers.length.toLocaleString()} members shown · manage accounts and plans.`}
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="h-10 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <Button variant="secondary" size="sm">
          Export CSV
        </Button>
      </div>

      <DataTable
        rows={adminUsers}
        columns={[
          {
            key: "name",
            header: "User",
            render: (r) => (
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-faint">{r.email}</p>
              </div>
            ),
          },
          {
            key: "plan",
            header: "Plan",
            render: (r) => (
              <Badge variant={r.plan === "Seeker" ? "neutral" : "gold"}>
                {r.plan}
              </Badge>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <StatusPill status={r.status} />,
          },
          { key: "joined", header: "Joined", className: "text-muted" },
          {
            key: "actions",
            header: "",
            render: () => (
              <button className="text-sm text-gold-bright hover:underline">
                Manage
              </button>
            ),
          },
        ]}
      />
    </main>
  );
}

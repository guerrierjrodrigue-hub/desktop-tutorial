import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminContent } from "@/data/admin";

export const metadata: Metadata = { title: "Admin · Content" };

export default function AdminContentPage() {
  return (
    <main className="px-4 py-6 sm:px-8">
      <div className="mb-6 flex items-end justify-between">
        <AdminHeader
          title="Content"
          subtitle="Programs, devotionals, verses, and reading plans."
        />
        <Button size="sm">
          <Plus className="size-4" /> New content
        </Button>
      </div>

      <DataTable
        rows={adminContent}
        columns={[
          {
            key: "type",
            header: "Type",
            render: (r) => <Badge variant="neutral">{r.type}</Badge>,
          },
          {
            key: "title",
            header: "Title",
            render: (r) => <span className="font-medium">{r.title}</span>,
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <StatusPill status={r.status} />,
          },
          { key: "updated", header: "Updated", className: "text-muted" },
          {
            key: "actions",
            header: "",
            render: () => (
              <button className="text-sm text-gold-bright hover:underline">
                Edit
              </button>
            ),
          },
        ]}
      />
    </main>
  );
}

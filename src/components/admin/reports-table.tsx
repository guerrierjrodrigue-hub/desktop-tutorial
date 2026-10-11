"use client";

import { useState, useTransition } from "react";
import { EyeOff, Eye, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  setContentHidden,
  deleteReportedContent,
  resolveReport,
} from "@/app/(admin)/admin/reports/actions";
import type { AdminReport } from "@/lib/queries/admin";

export function ReportsTable({ initial }: { initial: AdminReport[] }) {
  const [reports, setReports] = useState(initial);
  const [pending, startTransition] = useTransition();

  function patch(id: string, next: Partial<AdminReport>) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)));
  }

  function toggleHide(r: AdminReport) {
    const hidden = !r.hidden;
    patch(r.id, { hidden });
    startTransition(async () => {
      await setContentHidden({ targetType: r.targetType, targetId: r.targetId, hidden });
    });
  }

  function remove(r: AdminReport) {
    setReports((prev) => prev.filter((x) => x.id !== r.id));
    startTransition(async () => {
      await deleteReportedContent({ targetType: r.targetType, targetId: r.targetId });
    });
  }

  function resolve(r: AdminReport) {
    patch(r.id, { status: "resolved" });
    startTransition(async () => {
      await resolveReport(r.id);
    });
  }

  if (!reports.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface-2 p-8 text-center text-sm text-muted">
        No reports. The community is behaving itself.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-border bg-surface p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{r.targetType}</Badge>
            {r.hidden && <Badge variant="premium">hidden</Badge>}
            <Badge variant={r.status === "open" ? "accent" : "green"}>{r.status}</Badge>
            <span className="text-xs text-muted">
              by {r.authorName} · reported by {r.reporterName}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
            {r.content || <span className="italic text-faint">(content removed)</span>}
          </p>
          {r.reason && (
            <p className="mt-1 text-xs text-muted">Reason: {r.reason}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => toggleHide(r)}>
              {r.hidden ? (
                <>
                  <Eye className="size-4" /> Unhide
                </>
              ) : (
                <>
                  <EyeOff className="size-4" /> Hide
                </>
              )}
            </Button>
            <Button size="sm" variant="danger" disabled={pending} onClick={() => remove(r)}>
              <Trash2 className="size-4" /> Delete
            </Button>
            {r.status === "open" && (
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => resolve(r)}>
                <Check className="size-4" /> Resolve
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

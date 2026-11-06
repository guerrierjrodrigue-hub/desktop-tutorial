import { Badge } from "@/components/ui/badge";
import type { AdminFeedback } from "@/lib/queries/admin";

const KIND_LABEL: Record<AdminFeedback["kind"], string> = {
  bug: "Bug",
  idee: "Idée",
  autre: "Autre",
};

const KIND_VARIANT: Record<AdminFeedback["kind"], "accent" | "green" | "neutral"> = {
  bug: "accent",
  idee: "green",
  autre: "neutral",
};

/** Read-only list of beta feedback for the admin console. */
export function FeedbackTable({ items }: { items: AdminFeedback[] }) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-border bg-surface/40 px-4 py-8 text-center text-sm text-muted">
        No feedback yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((f) => (
        <li key={f.id} className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <Badge variant={KIND_VARIANT[f.kind]}>{KIND_LABEL[f.kind]}</Badge>
            <span className="font-medium text-foreground">{f.authorName}</span>
            <span>·</span>
            <time dateTime={f.createdAt}>{new Date(f.createdAt).toLocaleString("fr-CA")}</time>
            {f.page && (
              <>
                <span>·</span>
                <span className="font-mono">{f.page}</span>
              </>
            )}
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground">{f.message}</p>
        </li>
      ))}
    </ul>
  );
}

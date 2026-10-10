import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-green/20 text-green-bright",
  succeeded: "bg-green/20 text-green-bright",
  Published: "bg-green/20 text-green-bright",
  past_due: "bg-warning/15 text-warning",
  failed: "bg-danger/15 text-danger",
  Draft: "bg-surface-2 text-muted",
  Scheduled: "bg-accent/12 text-accent-bright",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-surface-2 text-muted",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

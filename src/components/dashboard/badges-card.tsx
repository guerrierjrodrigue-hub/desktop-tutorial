import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { badges } from "@/data/dashboard";
import { cn } from "@/lib/utils";

export function BadgesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <span className="text-xs text-muted">
          {badges.filter((b) => b.earned).length}/{badges.length} earned
        </span>
      </CardHeader>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            title={`${badge.name} — ${badge.description}`}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition",
              badge.earned
                ? "border-gold/25 bg-gold/8"
                : "border-border bg-surface-2 opacity-50",
            )}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full",
                badge.earned
                  ? "bg-gradient-to-br from-gold-bright to-gold-deep text-background"
                  : "bg-elevated text-faint",
              )}
            >
              <Icon name={badge.icon} className="size-5" />
            </span>
            <span className="text-[11px] font-medium leading-tight">
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

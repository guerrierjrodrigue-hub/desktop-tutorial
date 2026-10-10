import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getBadges } from "@/lib/queries/badges";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export async function BadgesCard() {
  const locale = await getLocale();
  const [badges, dict] = await Promise.all([getBadges(locale), getDictionary(locale)]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["dashboard.achievements"]}</CardTitle>
        <span className="text-xs text-muted">
          {dict["badges.earnedCount"]
            .replace("{n}", String(badges.filter((b) => b.earned).length))
            .replace("{total}", String(badges.length))}
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
                ? "border-accent/25 bg-accent/8"
                : "border-border bg-surface-2 opacity-50",
            )}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full",
                badge.earned
                  ? "bg-gradient-to-br from-accent-bright to-accent-deep text-accent-fg"
                  : "bg-elevated text-faint",
              )}
            >
              <Icon name={badge.icon} className="size-5" />
            </span>
            <span className="text-xs font-medium leading-tight">
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

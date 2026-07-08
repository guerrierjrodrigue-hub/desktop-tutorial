import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/queries/profile";
import { getHabits } from "@/lib/queries/habits";
import { getRecommendations } from "@/lib/recommendations";
import { programs } from "@/data/programs";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function RecommendationsCard() {
  const [user, habits, dict] = await Promise.all([
    getCurrentUser(),
    getHabits(),
    getDictionary(await getLocale()),
  ]);
  const recs = getRecommendations(user, programs, habits, dict);
  if (!recs.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["dashboard.recommended"]}</CardTitle>
      </CardHeader>
      <div className="space-y-2">
        {recs.map((rec) => (
          <Link
            key={rec.id}
            href={rec.href}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3 transition hover:border-gold/30"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold-bright">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{rec.label}</p>
                <p className="text-xs text-muted">{rec.description}</p>
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-gold-bright" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

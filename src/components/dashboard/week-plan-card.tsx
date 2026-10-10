import Link from "next/link";
import { CalendarRange, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/queries/profile";
import { getPrograms } from "@/lib/queries/programs";
import { buildWeekPlan } from "@/lib/week-plan";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

/** "Your 7-day plan" — a program + weekly cadence from the user's profile. */
export async function WeekPlanCard() {
  const locale = await getLocale();
  const [user, programs, dict] = await Promise.all([
    getCurrentUser(),
    getPrograms(locale),
    getDictionary(locale),
  ]);

  const plan = buildWeekPlan(programs, {
    level: user.level,
    equipment: user.equipment,
    trainingDays: user.trainingDays,
    goals: user.primaryGoals,
  });
  if (!plan.program) return null;

  const dayLabels =
    locale === "fr"
      ? ["L", "M", "M", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <CalendarRange className="size-4 text-gold-bright" /> {dict["dashboard.weekPlan"]}
          </span>
        </CardTitle>
      </CardHeader>

      <Link
        href={`/fitness/${plan.program.id}`}
        className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3 transition hover:border-gold/30"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold group-hover:text-gold-bright">
            {plan.program.title}
          </p>
          <p className="text-xs text-muted">
            {dict["dashboard.weekPlanBasedOn"].replace("{n}", String(plan.trainingDays))}
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
      </Link>

      <div className="mt-4 flex justify-between gap-1.5">
        {plan.days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-faint">{dayLabels[i]}</span>
            <span
              className={cn(
                "grid h-8 w-full place-items-center rounded-lg text-xs font-semibold",
                d === "train"
                  ? "bg-gradient-to-br from-gold-bright to-gold-deep text-background"
                  : "bg-surface-2 text-faint",
              )}
            >
              {d === "train" ? dict["dashboard.weekPlanTrain"] : dict["dashboard.weekPlanRest"]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

import Link from "next/link";
import { Footprints, Timer, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRunPlans, getRunGoal } from "@/lib/queries/running";
import { segmentsTotalSeconds, formatDuration } from "@/lib/running";
import { getUserTimezone } from "@/lib/timezone";
import { getUserToday } from "@/lib/date";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * Dashboard "today's run" for runners: the run session from the active plan.
 * The active plan is derived from the user's goal distance (10 km -> the 10k
 * plan, otherwise the 5k plan); the session of the day rotates deterministically
 * through the plan's first week so the card is stable within a day.
 */
export async function RunTodayCard() {
  const locale = await getLocale();
  const [dict, plans, goal, tz] = await Promise.all([
    getDictionary(locale),
    getRunPlans(locale),
    getRunGoal(),
    getUserTimezone(),
  ]);
  if (plans.length === 0) return null;

  const wantTenK = (goal?.targetDistanceM ?? 0) >= 10000;
  const plan = plans.find((p) => p.slug === (wantTenK ? "c10k-10" : "c5k-8")) ?? plans[0];
  const week1 = plan.weekMeta[0];
  if (!week1 || week1.sessions.length === 0) return null;

  // Rotate through week 1's sessions by the day of the month (stable per day).
  const today = getUserToday(tz);
  const dayNum = Number(today.slice(-2));
  const session = week1.sessions[(dayNum - 1) % week1.sessions.length];

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-accent/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Badge variant="accent">{dict["course.todayTitle"]}</Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Timer className="size-4" />
            {formatDuration(segmentsTotalSeconds(session.segments))}
          </span>
        </div>

        <h3 className="mt-3 font-serif text-2xl font-semibold">{session.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Footprints className="size-4 text-accent/70" />
          {plan.title} · {dict["course.todaySuggested"]}
        </p>

        <Link href={`/course/seance/${session.id}`} className="mt-5 block">
          <Button className="w-full group">
            {dict["course.plan.startSession"]}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
        <Link href={`/course/plans/${plan.slug}`} className="mt-2 block">
          <Button variant="secondary" className="w-full">
            {dict["course.openPlan"]}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

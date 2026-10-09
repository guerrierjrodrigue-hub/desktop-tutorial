import Link from "next/link";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { passageForDay } from "@/lib/reading-plan-passages";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ReadingPlan } from "@/types";

/** Deep-link into the Bible reader at a plan's next unread day, carrying the
 * plan + day so the reader can offer "mark as read". */
function readHref(plan: ReadingPlan, day: number): string | null {
  const passage = passageForDay(plan.titleEn ?? plan.title, day);
  if (!passage) return null;
  const q = new URLSearchParams({
    b: passage.book,
    c: String(passage.chapter),
    plan: plan.id,
    day: String(day),
  });
  return `/spiritual/bible?${q.toString()}`;
}

export function ReadingPlans({ initial, dict }: { initial: ReadingPlan[]; dict: Dictionary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["spiritual.readingPlansTitle"]}</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {initial.map((plan) => {
          const done = plan.completedDays >= plan.totalDays;
          const nextDay = Math.min(plan.completedDays + 1, plan.totalDays);
          const href = done ? null : readHref(plan, nextDay);
          return (
            <div key={plan.id} className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif font-semibold leading-tight">{plan.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{plan.description}</p>
                </div>
                {done && (
                  <Badge variant="green">
                    <CheckCircle2 className="size-3" /> {dict["spiritual.planDone"]}
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <Progress value={plan.completedDays / plan.totalDays} />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted">
                    {plan.completedDays}/{plan.totalDays} {dict["spiritual.daysUnit"]}
                  </p>
                  {href && (
                    <Link
                      href={href}
                      className="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-gold-bright hover:bg-surface-3"
                    >
                      <BookOpen className="size-3.5" /> {dict["spiritual.readToday"]}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

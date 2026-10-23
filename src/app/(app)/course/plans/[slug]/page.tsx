import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, HandHeart, Timer } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getRunPlan } from "@/lib/queries/running";
import { segmentsTotalSeconds, formatDuration, formatKm } from "@/lib/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const plan = await getRunPlan(slug, locale);
  return { title: plan?.title ?? (await getDictionary(locale))["course.plans.title"] };
}

export default async function RunPlanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const [dict, plan] = await Promise.all([getDictionary(locale), getRunPlan(slug, locale)]);
  if (!plan) notFound();

  return (
    <>
      <Topbar title={plan.title} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <Link href="/course/plans" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground">
          <ArrowLeft className="size-4" /> {dict["course.plan.back"]}
        </Link>
        <PageHeader
          title={plan.title}
          subtitle={`${plan.description} · ${plan.weeks} ${dict["course.plans.weeks"]}${plan.goalDistanceM ? ` · ${formatKm(plan.goalDistanceM)} km` : ""}`}
        />

        <div className="space-y-5">
          {plan.weekMeta.map((week) => (
            <Card key={week.week}>
              <CardHeader>
                <CardTitle>
                  {dict["course.plan.week"]} {week.week}
                </CardTitle>
              </CardHeader>

              <div className="mb-4 rounded-xl border border-border bg-surface-2 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-faint">
                  <BookOpen className="size-3.5 text-accent/80" /> {dict["course.plan.verse"]}
                </p>
                <p className="mt-1 text-sm italic text-foreground/90">{week.verseText}</p>
                <p className="mt-1 text-xs text-accent-bright">{week.verseRef}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-faint">
                  <HandHeart className="size-3.5 text-accent/80" /> {dict["course.plan.prayer"]}
                </p>
                <p className="mt-1 text-sm text-muted">{week.prayer}</p>
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                {dict["course.plan.sessions"]}
              </p>
              <ul className="space-y-2">
                {week.sessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/course/seance/${session.id}`}
                      className="flex items-start justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm transition hover:border-accent/40"
                    >
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="font-medium">{session.title}</span>
                          <span className="text-xs text-faint">
                            {formatDuration(segmentsTotalSeconds(session.segments))}
                          </span>
                        </span>
                        {session.instructions && (
                          <span className="mt-0.5 block text-xs text-muted">{session.instructions}</span>
                        )}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-accent-bright">
                        <Timer className="size-3.5" /> {dict["course.plan.startSession"]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

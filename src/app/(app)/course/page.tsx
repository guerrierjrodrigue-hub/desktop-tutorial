import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Route, Timer, Footprints, ShieldAlert, Sparkles, AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RunList } from "@/components/course/run-list";
import { RunnerOnboarding } from "@/components/course/runner-onboarding";
import {
  getRuns, getRunPlan, getRunnerOnboarding, weekStats, weeklyDistances, records,
} from "@/lib/queries/running";
import { getUserTimezone } from "@/lib/timezone";
import { getUserToday } from "@/lib/date";
import { formatDuration, formatKm, formatPace, recommendPlanSlug, weeklyLoadWarning } from "@/lib/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["meta.course"] };
}

export default async function CoursePage() {
  const locale = await getLocale();
  const [dict, runs, tz, onboarding] = await Promise.all([
    getDictionary(locale),
    getRuns(),
    getUserTimezone(),
    getRunnerOnboarding(),
  ]);

  // First visit: ask the two questions before anything else.
  if (!onboarding.answered) {
    return (
      <>
        <Topbar title={dict["course.title"]} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
          <PageHeader title={dict["course.title"]} subtitle={dict["course.subtitle"]} />
          <RunnerOnboarding dict={dict} initialLevel={onboarding.level} initialGoal={onboarding.goalKind} />
        </main>
      </>
    );
  }

  const today = getUserToday(tz);
  const week = weekStats(runs, today);
  const series = weeklyDistances(runs, today, 8);
  const prs = records(runs);
  const maxWeek = Math.max(1, ...series.map((s) => s.distanceM));

  // Recommended plan (null in free mode), and the week-over-week load advisory.
  const recoSlug = onboarding.level && onboarding.goalKind
    ? recommendPlanSlug(onboarding.level, onboarding.goalKind)
    : null;
  const recoPlan = recoSlug ? await getRunPlan(recoSlug, locale) : null;
  const load = series.length >= 2
    ? weeklyLoadWarning(series[series.length - 1].distanceM, series[series.length - 2].distanceM)
    : null;

  // The 1 km record is a best pace (no measured splits yet), shown as m:ss /km;
  // the 5/10 km records are finish-time estimates shown as a duration.
  const recordRows: { label: string; value?: number; isPace?: boolean }[] = [
    { label: dict["course.recordBestPace"], value: prs.oneK, isPace: true },
    { label: "5 km", value: prs.fiveK },
    { label: "10 km", value: prs.tenK },
  ];

  return (
    <>
      <Topbar title={dict["course.title"]} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader title={dict["course.title"]} subtitle={dict["course.subtitle"]} />

        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/course/nouvelle" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="size-4" /> {dict["course.logRun"]}
          </Link>
          <Link href="/course/plans" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "gap-1.5")}>
            <Route className="size-4" /> {dict["course.plans.title"]}
          </Link>
          <Link href="/course/outils" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "gap-1.5")}>
            <Timer className="size-4" /> {dict["course.tools.title"]}
          </Link>
          <Link href="/course/demarrer" className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "gap-1.5")}>
            <SlidersHorizontal className="size-4" /> {dict["course.start.change"]}
          </Link>
        </div>

        {/* Caution: always visible for runners. */}
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-ember/30 bg-ember/10 p-3 text-sm text-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-ember" />
          <span>{dict["course.caution"]}</span>
        </p>

        {/* Recommended plan, or free-mode note. */}
        {recoPlan ? (
          <Card className="mb-5 bg-gradient-to-br from-accent/12 to-surface">
            <CardHeader>
              <CardTitle>{dict["course.reco.title"]}</CardTitle>
              <Sparkles className="size-4 text-accent-bright" />
            </CardHeader>
            <p className="text-sm text-muted">{dict["course.reco.body"]}</p>
            <p className="mt-2 font-serif text-lg font-semibold">{recoPlan.title}</p>
            <Link href={`/course/plans/${recoPlan.slug}`} className={cn(buttonVariants({ size: "sm" }), "mt-3 gap-1.5")}>
              <Route className="size-4" /> {dict["course.plans.view"]}
            </Link>
          </Card>
        ) : (
          <Card className="mb-5">
            <CardHeader>
              <CardTitle>{dict["course.free.title"]}</CardTitle>
              <Footprints className="size-4 text-accent/80" />
            </CardHeader>
            <p className="text-sm text-muted">{dict["course.free.body"]}</p>
          </Card>
        )}

        {/* Weekly load advisory (never blocking). */}
        {load && (
          <Card className={cn("mb-5", load.over && "border-ember/40")}>
            <CardHeader>
              <CardTitle>{dict["course.load.title"]}</CardTitle>
              {load.over && <AlertTriangle className="size-4 text-ember" />}
            </CardHeader>
            <p className={cn("text-sm", load.over ? "text-ember" : "text-muted")}>
              {load.over ? dict["course.load.warn"] : dict["course.load.ok"]}
            </p>
          </Card>
        )}

        {/* This week */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{dict["course.thisWeek"]}</CardTitle>
              <Footprints className="size-4 text-accent/80" />
            </CardHeader>
            <p className="font-serif text-4xl font-semibold">
              {formatKm(week.distanceM)} <span className="text-lg text-muted">km</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {week.runs} {dict["course.statRuns"]}
            </p>
            <p className="mt-3 text-sm">
              <span className="text-muted">{dict["course.longRun"]}: </span>
              <span className="font-semibold">{formatKm(week.longestM)} km</span>
            </p>
          </Card>

          {/* 8-week chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{dict["course.weeklyVolume"]}</CardTitle>
            </CardHeader>
            <div className="flex h-36 items-end gap-2" role="img" aria-label={dict["course.weeklyVolume"]}>
              {series.map((s) => (
                <div key={s.weekStart} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-accent/40 to-accent-bright/80"
                    style={{ height: `${Math.round((s.distanceM / maxWeek) * 100)}%`, minHeight: s.distanceM > 0 ? 4 : 0 }}
                  />
                  <span className="text-[10px] tabular-nums text-faint">{formatKm(s.distanceM)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Records */}
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>{dict["course.records"]}</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-3">
            {recordRows.map((r) => (
              <div key={r.label} className="rounded-xl border border-border bg-surface-2 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-faint">{r.label}</p>
                <p className="mt-1 font-serif text-2xl font-semibold">
                  {r.value ? (
                    r.isPace ? (
                      <>
                        {formatPace(r.value)}
                        <span className="ml-1 text-sm text-muted">{dict["course.tools.perKm"]}</span>
                      </>
                    ) : (
                      formatDuration(r.value)
                    )
                  ) : (
                    <span className="text-base text-muted">{dict["course.noRecord"]}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent runs */}
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>{dict["course.recentRuns"]}</CardTitle>
          </CardHeader>
          <RunList initial={runs} dict={dict} locale={locale} />
        </Card>
      </main>
    </>
  );
}

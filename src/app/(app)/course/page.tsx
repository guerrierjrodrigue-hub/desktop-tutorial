import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Route, Timer, Footprints, Flame } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRuns, weekStats, weeklyDistances, records } from "@/lib/queries/running";
import { getUserTimezone } from "@/lib/timezone";
import { getUserToday } from "@/lib/date";
import { formatDuration, formatKm, formatPace } from "@/lib/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { RunKind } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["meta.course"] };
}

function kindLabel(kind: RunKind, dict: Dictionary): string {
  return dict[`course.kind.${kind}` as keyof Dictionary] as string;
}

function formatRunDate(iso: string, locale: LocaleCode): string {
  const tag = locale === "fr" ? "fr-CA" : "en-US";
  return new Date(iso + "T00:00:00").toLocaleDateString(tag, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function CoursePage() {
  const locale = await getLocale();
  const [dict, runs, tz] = await Promise.all([
    getDictionary(locale),
    getRuns(),
    getUserTimezone(),
  ]);
  const today = getUserToday(tz);
  const week = weekStats(runs, today);
  const series = weeklyDistances(runs, today, 8);
  const prs = records(runs);
  const maxWeek = Math.max(1, ...series.map((s) => s.distanceM));

  const recordRows: { label: string; value?: number }[] = [
    { label: "1 km", value: prs.oneK },
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
        </div>

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
                  {r.value ? formatDuration(r.value) : <span className="text-base text-muted">{dict["course.noRecord"]}</span>}
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
          {runs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">
              {dict["course.noRuns"]}
            </p>
          ) : (
            <ul className="space-y-2">
              {runs.map((r) => (
                <li
                  key={r.id}
                  data-testid="run-row"
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{formatKm(r.distanceM)} km</span>
                    <span className="text-xs text-faint">{formatRunDate(r.ranOn, locale)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                    <span>{formatDuration(r.durationS)}</span>
                    <span className="flex items-center gap-1">
                      <Flame className="size-3.5 text-ember/70" />
                      {formatPace(r.paceSPerKm)}
                    </span>
                    <span className="hidden rounded-full bg-elevated px-2 py-0.5 sm:inline">{kindLabel(r.kind, dict)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </>
  );
}

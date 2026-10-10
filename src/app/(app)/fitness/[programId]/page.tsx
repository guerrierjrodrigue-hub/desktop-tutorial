import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, CalendarDays, Dumbbell, ChevronLeft, Lock } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PremiumGate } from "@/components/billing/premium-gate";
import { programs } from "@/data/programs";
import { getProgramBySlug } from "@/lib/queries/programs";
import { getCurrentUser } from "@/lib/queries/profile";
import { formatDuration } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isFreeMode } from "@/lib/flags";
import { showPremiumLock } from "@/lib/premium-ui";

export function generateStaticParams() {
  return programs.map((p) => ({ programId: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string }>;
}): Promise<Metadata> {
  const { programId } = await params;
  const program = await getProgramBySlug(programId, await getLocale());
  return {
    title: program?.title ?? "Program",
    description: program?.description,
  };
}

export default async function ProgramDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { programId } = await params;
  const { week } = await searchParams;
  const locale = await getLocale();
  const program = await getProgramBySlug(programId, locale);
  if (!program) notFound();

  const user = await getCurrentUser();
  const dict = await getDictionary(locale);
  const locked = program.premium && !user.isPremium;

  const requestedWeek = Number(week) || 1;
  const activeWeek =
    program.schedule.find((w) => w.week === requestedWeek) ?? program.schedule[0];

  return (
    <>
      <Topbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/fitness"
          className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> {dict["fitness.backToPrograms"]}
        </Link>

        {/* Hero */}
        <div
          className={`mt-4 overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${program.coverColor} p-8`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" className="bg-black/30 text-foreground backdrop-blur">
              {dict[`level.${program.level}`]}
            </Badge>
            <Badge variant="neutral" className="bg-black/30 text-foreground backdrop-blur">
              {dict[`category.${program.category}`]}
            </Badge>
            {showPremiumLock(isFreeMode(), program.premium) && (
              <Badge variant="premium" className="bg-black/30 backdrop-blur">
                <Lock className="size-3" /> {dict["fitness.premium"]}
              </Badge>
            )}
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {program.title}
          </h1>
          <p className="mt-2 max-w-2xl text-foreground/80">
            {program.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              {dict["fitness.weeksDaysPerWeek"]
                .replace("{weeks}", String(program.weeks))
                .replace("{days}", String(program.daysPerWeek))}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4" />
              {formatDuration(program.durationMinutes)} {dict["fitness.perSession"]}
            </span>
          </div>
          {!locked && activeWeek?.days[0] && (
            <Link href={`/fitness/${program.id}/session/${activeWeek.days[0].id}`}>
              <Button className="mt-6">
                {dict["fitness.startWeek"].replace("{week}", String(activeWeek.week))}
              </Button>
            </Link>
          )}
        </div>

        {locked && <PremiumGate />}

        <div className={locked ? "pointer-events-none mt-8 opacity-40 blur-sm select-none" : "mt-8"} aria-hidden={locked}>
          {program.schedule.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {program.schedule.map((w) => (
                <Link key={w.week} href={`/fitness/${program.id}?week=${w.week}`} scroll={false}>
                  <Badge
                    variant={w.week === activeWeek?.week ? "accent" : "neutral"}
                    className="cursor-pointer px-3 py-1.5"
                  >
                    {dict["fitness.week"].replace("{week}", String(w.week))}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <h2 className="font-serif text-xl font-semibold">
            {dict["fitness.week"].replace("{week}", String(activeWeek?.week ?? 1))}
          </h2>
          <p className="text-sm text-muted">
            {dict["fitness.progressiveOverload"].replace("{weeks}", String(program.weeks))}
          </p>

          <div className="mt-4 space-y-4">
            {activeWeek?.days.map((day, i) => (
              <Card key={day.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-green/20 text-sm font-semibold text-green-bright">
                      {dict["fitness.dayShort"]}
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-semibold leading-tight">
                        {day.title}
                      </h3>
                      <p className="text-xs text-muted">{day.focus}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
                      <Clock className="size-4" />
                      {formatDuration(day.durationMinutes)}
                    </span>
                    <Link href={`/fitness/${program.id}/session/${day.id}`}>
                      <Button size="sm" variant="secondary">
                        {dict["fitness.start"]}
                      </Button>
                    </Link>
                  </div>
                </div>

                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {day.exercises.map((ex) => (
                    <li
                      key={ex.id}
                      className="flex items-center justify-between gap-3 bg-surface-2 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {ex.imageUrl ? (
                          <Image
                            src={ex.imageUrl}
                            alt={ex.name}
                            width={36}
                            height={36}
                            className="size-9 shrink-0 rounded-md object-cover"
                            unoptimized
                          />
                        ) : (
                          <Dumbbell className="size-4 shrink-0 text-accent/70" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{ex.name}</p>
                          <p className="text-xs text-faint">
                            {ex.muscles.join(" · ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">
                          {ex.sets} × {ex.reps}
                        </p>
                        <p className="text-xs text-faint">
                          {dict["fitness.restSeconds"].replace("{seconds}", String(ex.restSeconds))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

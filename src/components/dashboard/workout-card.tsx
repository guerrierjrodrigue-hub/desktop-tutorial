import Link from "next/link";
import { Dumbbell, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPrograms, getProgramBySlug } from "@/lib/queries/programs";
import { formatDuration } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function WorkoutCard() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const programs = await getPrograms(locale);
  const summary = programs[0];
  const program = summary ? await getProgramBySlug(summary.id, locale) : undefined;
  const day = program?.schedule[0]?.days[0];

  if (!program || !day) return null;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-green/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Badge variant="green">{dict["dashboard.todaysWorkout"]}</Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Clock className="size-4" />
            {formatDuration(day.durationMinutes)}
          </span>
        </div>

        <h3 className="mt-3 font-serif text-2xl font-semibold">{day.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {program.title} · {day.focus}
        </p>

        <ul className="mt-4 space-y-2">
          {day.exercises.slice(0, 4).map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2.5">
                <Dumbbell className="size-4 text-gold/70" />
                {ex.name}
              </span>
              <span className="text-muted">
                {ex.sets} × {ex.reps}
              </span>
            </li>
          ))}
        </ul>

        <Link href={`/fitness/${program.id}/session/${day.id}`} className="mt-5 block">
          <Button className="w-full group">
            {dict["dashboard.startWorkout"]}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

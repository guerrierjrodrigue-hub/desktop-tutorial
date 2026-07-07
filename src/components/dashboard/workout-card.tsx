import Link from "next/link";
import { Dumbbell, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { workoutOfDay, programs } from "@/data/programs";
import { formatDuration } from "@/lib/utils";

export function WorkoutCard() {
  const program = programs[0];
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-green/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Badge variant="green">Today&apos;s workout</Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Clock className="size-4" />
            {formatDuration(workoutOfDay.durationMinutes)}
          </span>
        </div>

        <h3 className="mt-3 font-serif text-2xl font-semibold">
          {workoutOfDay.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {program.title} · {workoutOfDay.focus}
        </p>

        <ul className="mt-4 space-y-2">
          {workoutOfDay.exercises.slice(0, 4).map((ex) => (
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

        <Link
          href={`/fitness/${program.id}/session/${workoutOfDay.id}`}
          className="mt-5 block"
        >
          <Button className="w-full group">
            Start workout
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronDown, ChevronLeft, Clock, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { logWorkoutCompletion } from "@/app/(app)/fitness/actions";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { WorkoutDay } from "@/types";

export function WorkoutSession({
  programId,
  day,
}: {
  programId: string;
  day: WorkoutDay;
}) {
  const router = useRouter();
  const [setsDone, setSetsDone] = useState<Record<string, number>>(() =>
    Object.fromEntries(day.exercises.map((ex) => [ex.id, 0])),
  );
  const [resting, setResting] = useState<{ exerciseId: string; secondsLeft: number } | null>(
    null,
  );
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!resting) return;
    const t = setTimeout(() => {
      setResting((r) => {
        if (!r) return r;
        if (r.secondsLeft <= 1) return null;
        return { ...r, secondsLeft: r.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [resting]);

  const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = Object.values(setsDone).reduce((a, b) => a + b, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  function toggleSet(exerciseId: string, setIndex: number, restSeconds: number) {
    const current = setsDone[exerciseId] ?? 0;
    const wasCompleting = setIndex >= current;
    setSetsDone((prev) => ({
      ...prev,
      [exerciseId]: setIndex < current ? setIndex : setIndex + 1,
    }));
    if (wasCompleting && restSeconds > 0) {
      setResting({ exerciseId, secondsLeft: restSeconds });
    } else {
      setResting(null);
    }
  }

  async function finish() {
    setSaving(true);
    track("workout_completed");
    await logWorkoutCompletion(day.durationMinutes);
    setSaving(false);
    setFinished(true);
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-background">
          <PartyPopper className="size-8" />
        </span>
        <h1 className="font-serif text-2xl font-semibold">Workout complete!</h1>
        <p className="max-w-sm text-sm text-muted">
          Great work finishing <span className="text-foreground">{day.title}</span> —{" "}
          {completedSets} of {totalSets} sets logged in about {day.durationMinutes} minutes.
        </p>
        <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={`/fitness/${programId}`}
        className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Exit workout
      </Link>

      <Card>
        <div className="mb-2 flex items-center justify-between text-sm text-muted">
          <span>
            {completedSets} / {totalSets} sets
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {day.durationMinutes} min
          </span>
        </div>
        <Progress value={progress} />
      </Card>

      <div className="space-y-4">
        {day.exercises.map((ex) => {
          const done = setsDone[ex.id] ?? 0;
          const complete = done >= ex.sets;
          return (
            <Card
              key={ex.id}
              className={cn(complete && "border-green-bright/30 bg-green/5")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold leading-tight">
                    {ex.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {ex.muscles.join(" · ")} · {ex.reps} reps · {ex.restSeconds}s rest
                  </p>
                </div>
                {complete && <Check className="size-5 shrink-0 text-green-bright" />}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: ex.sets }).map((_, i) => {
                  const setComplete = i < done;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSet(ex.id, i, ex.restSeconds)}
                      aria-pressed={setComplete}
                      aria-label={`Set ${i + 1} of ${ex.name}`}
                      className={cn(
                        "grid size-10 place-items-center rounded-xl border text-sm font-semibold transition",
                        setComplete
                          ? "border-green-bright/40 bg-green-bright text-background"
                          : "border-border bg-surface-2 text-muted hover:border-gold/40",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {resting?.exerciseId === ex.id && (
                <p className="mt-2 text-xs font-medium text-gold-bright">
                  Resting… {resting.secondsLeft}s
                </p>
              )}

              {(ex.instructions?.length || ex.imageUrl) && (
                <details className="group mt-3 rounded-xl border border-border bg-surface-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-muted">
                    How to
                    <ChevronDown className="size-3.5 transition group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-3 px-3 pb-3 sm:flex-row">
                    {ex.imageUrl && (
                      <Image
                        src={ex.imageUrl}
                        alt={ex.name}
                        width={160}
                        height={160}
                        className="h-32 w-full shrink-0 rounded-lg object-cover sm:w-32"
                        unoptimized
                      />
                    )}
                    {ex.instructions?.length ? (
                      <ol className="list-decimal space-y-1 pl-4 text-xs text-muted">
                        {ex.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                </details>
              )}
            </Card>
          );
        })}
      </div>

      <Button className="w-full" size="lg" onClick={finish} disabled={saving}>
        {completedSets >= totalSets
          ? "Finish workout"
          : `Finish workout (${completedSets}/${totalSets} sets)`}
      </Button>
    </div>
  );
}

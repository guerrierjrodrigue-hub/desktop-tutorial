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
import { showXp } from "@/components/gamification/xp-toast";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { WorkoutDay } from "@/types";

export function WorkoutSession({
  programId,
  day,
  dict,
}: {
  programId: string;
  day: WorkoutDay;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [setsDone, setSetsDone] = useState<Record<string, number>>(() =>
    Object.fromEntries(day.exercises.map((ex) => [ex.id, 0])),
  );
  const [resting, setResting] = useState<{ exerciseId: string; secondsLeft: number } | null>(
    null,
  );
  const [finished, setFinished] = useState(false);
  const [finishedMinutes, setFinishedMinutes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPartial, setConfirmPartial] = useState(false);
  // Real session clock: starts when the session screen opens.
  const [startedAt] = useState(() => Date.now());
  const [nowMs, setNowMs] = useState(() => Date.now());

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

  // Tick the elapsed clock every second until the session is finished.
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = Object.values(setsDone).reduce((a, b) => a + b, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  const elapsedSec = Math.max(0, Math.floor((nowMs - startedAt) / 1000));
  const elapsedClock = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;
  // At least half the sets must be done to finish without an explicit confirm.
  const halfReached = totalSets === 0 || completedSets >= totalSets / 2;

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
    if (saving) return; // guard against a double-click before state settles
    // Require an explicit confirmation when under half the sets are done.
    if (!halfReached && !confirmPartial) {
      setConfirmPartial(true);
      return;
    }
    setSaving(true);
    setError(null);
    track("workout_completed");
    // Real elapsed minutes (clamped to the action's 1–300 bound).
    const minutes = Math.min(300, Math.max(1, Math.round((Date.now() - startedAt) / 60000)));
    const result = await logWorkoutCompletion({
      programId,
      dayId: day.id,
      durationMinutes: minutes,
    });
    setSaving(false);
    if (result.ok) {
      showXp(result.xp);
      setFinishedMinutes(minutes);
      setFinished(true);
    } else {
      // Keep the user on the session so they can retry; surface a friendly note.
      setError(result.error ? dict[result.error as keyof Dictionary] ?? null : null);
    }
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-accent-bright to-accent-deep text-accent-fg">
          <PartyPopper className="size-8" />
        </span>
        <h1 className="font-serif text-2xl font-semibold">{dict["session.complete"]}</h1>
        <p className="max-w-sm text-sm text-muted">
          {dict["session.greatWorkPre"]} <span className="text-foreground">{day.title}</span>.{" "}
          {dict["session.setsSummary"]
            .replace("{done}", String(completedSets))
            .replace("{total}", String(totalSets))
            .replace("{min}", String(finishedMinutes))}
        </p>
        <Button onClick={() => router.push("/dashboard")}>{dict["session.backToDashboard"]}</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={`/fitness/${programId}`}
        className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> {dict["session.exit"]}
      </Link>

      <Card>
        <div className="mb-2 flex items-center justify-between text-sm text-muted">
          <span>
            {completedSets} / {totalSets} {dict["session.sets"]}
          </span>
          <span className="flex items-center gap-1.5 tabular-nums" aria-label={dict["session.elapsedAria"]}>
            <Clock className="size-4" />
            {elapsedClock}
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
                    {ex.muscles.join(" · ")} · {ex.reps} {dict["session.repsUnit"]} · {ex.restSeconds}s {dict["session.restUnit"]}
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
                      aria-label={dict["session.setAria"]
                        .replace("{i}", String(i + 1))
                        .replace("{name}", ex.name)}
                      className={cn(
                        "grid size-10 place-items-center rounded-xl border text-sm font-semibold transition",
                        setComplete
                          ? "border-green-bright/40 bg-green-bright text-background"
                          : "border-border bg-surface-2 text-muted hover:border-accent/40",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {resting?.exerciseId === ex.id && (
                <p className="mt-2 text-xs font-medium text-accent-bright">
                  {dict["session.resting"]} {resting.secondsLeft}s
                </p>
              )}

              {(ex.instructions?.length || ex.imageUrl) && (
                <details className="group mt-3 rounded-xl border border-border bg-surface-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-muted">
                    {dict["session.howTo"]}
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

      {error && (
        <p role="alert" className="text-center text-sm text-ember">
          {error}
        </p>
      )}

      {confirmPartial && (
        <p role="status" className="text-center text-sm text-muted">
          {dict["session.halfConfirm"]
            .replace("{done}", String(completedSets))
            .replace("{total}", String(totalSets))}
        </p>
      )}

      <Button className="w-full" size="lg" onClick={finish} disabled={saving}>
        {confirmPartial
          ? dict["session.finishAnyway"]
          : completedSets >= totalSets
            ? dict["session.finish"]
            : dict["session.finishPartial"]
                .replace("{done}", String(completedSets))
                .replace("{total}", String(totalSets))}
      </Button>
    </div>
  );
}

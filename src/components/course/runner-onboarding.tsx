"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setRunnerProfile } from "@/app/(app)/course/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { RunGoalKind, RunLevel } from "@/types";

const LEVELS: RunLevel[] = ["new", "5k", "10k"];
const GOALS: RunGoalKind[] = ["5k", "10k", "half", "free"];

/**
 * The first-visit runner questions (experience + objective). Writes
 * profiles.run_level + run_goal_kind, then refreshes /course so the right plan
 * is recommended. Reused by the "change later" control.
 */
export function RunnerOnboarding({
  dict,
  initialLevel = null,
  initialGoal = null,
  showSkip = false,
}: {
  dict: Dictionary;
  initialLevel?: RunLevel | null;
  initialGoal?: RunGoalKind | null;
  /** First-visit only: offer a "Skip" link to the overview without a plan. */
  showSkip?: boolean;
}) {
  const router = useRouter();
  const [level, setLevel] = useState<RunLevel | null>(initialLevel);
  const [goal, setGoal] = useState<RunGoalKind | null>(initialGoal);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const choice = (active: boolean) =>
    cn(
      "rounded-xl border px-4 py-3 text-left text-sm transition",
      active
        ? "border-accent/60 bg-accent/10 font-semibold text-foreground"
        : "border-border bg-surface-2 text-muted hover:border-accent/30 hover:text-foreground",
    );

  function submit() {
    if (!level || !goal) return;
    startTransition(async () => {
      const res = await setRunnerProfile({ level, goalKind: goal });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["course.start.title"]}</CardTitle>
      </CardHeader>
      <p className="text-sm text-muted">{dict["course.start.subtitle"]}</p>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-ember/30 bg-ember/10 p-3 text-xs text-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-ember" />
        <span>{dict["course.caution"]}</span>
      </p>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium">{dict["course.start.levelQ"]}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={choice(level === l)}
            >
              {dict[`course.start.level.${l}` as keyof Dictionary] as string}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium">{dict["course.start.goalQ"]}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={goal === g}
              onClick={() => setGoal(g)}
              className={choice(goal === g)}
            >
              {dict[`course.start.goal.${g}` as keyof Dictionary] as string}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="button" className="mt-5 w-full" onClick={submit} disabled={!level || !goal || pending}>
        {dict["course.start.submit"]}
      </Button>
      {saved && (
        <p role="status" className="mt-2 text-center text-sm text-green-bright">
          {dict["course.start.saved"]}
        </p>
      )}
      {showSkip && (
        <p className="mt-3 text-center text-sm">
          <Link href="/course?vue=1" className="text-muted underline-offset-2 transition hover:text-foreground hover:underline">
            {dict["course.start.skip"]}
          </Link>
        </p>
      )}
    </Card>
  );
}

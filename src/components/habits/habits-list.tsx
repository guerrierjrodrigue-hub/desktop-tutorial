"use client";

import { useState, useTransition } from "react";
import { Check, Flame, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toggleHabit } from "@/app/(app)/dashboard/actions";
import { createHabit } from "@/app/(app)/habits/actions";
import { showXp } from "@/components/gamification/xp-toast";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Habit } from "@/types";

const ICON_CHOICES = ["Check", "Dumbbell", "BookOpen", "Droplet", "Moon", "Sun", "Heart", "Brain"];

export function HabitsList({
  initial,
  title,
  dict,
}: {
  initial: Habit[];
  title: string;
  dict: Dictionary;
}) {
  const [habits, setHabits] = useState(initial);
  const [composing, setComposing] = useState(false);
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [error, setError] = useState<string | null>(null);
  // Habits whose real DB id isn't known yet (optimistic insert in flight).
  // Toggling one would upsert a log against a phantom habit id, so it stays
  // disabled until the create resolves with the real id.
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const clearPending = (id: string) =>
    setPending((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
  const failMessage = (code?: string) =>
    (code && (dict[code as keyof Dictionary] as string)) || dict["errors.writeNoRows"];

  function toggle(id: string) {
    let nextDone = false;
    const snapshot = habits;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        nextDone = !h.done;
        return { ...h, done: nextDone, streak: nextDone ? h.streak + 1 : h.streak - 1 };
      }),
    );
    setError(null);
    startTransition(async () => {
      const result = await toggleHabit(id, nextDone);
      if (result.ok) {
        showXp(result.xp);
      } else {
        // Toggle didn't persist: roll back and surface the error.
        setHabits(snapshot);
        setError(failMessage(result.error));
      }
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;

    const tempId = crypto.randomUUID();
    const optimistic: Habit = {
      id: tempId,
      label: trimmed,
      icon,
      done: false,
      streak: 0,
    };
    setHabits((prev) => [...prev, optimistic]);
    setPending((p) => new Set(p).add(tempId));
    setLabel("");
    setComposing(false);
    setError(null);
    startTransition(async () => {
      const result = await createHabit(trimmed, icon);
      if (result.ok) {
        // Swap the temp id for the real one so a toggle targets the real row.
        if (result.id) {
          const realId = result.id;
          setHabits((prev) => prev.map((h) => (h.id === tempId ? { ...h, id: realId } : h)));
        }
        clearPending(tempId);
      } else {
        setHabits((prev) => prev.filter((h) => h.id !== tempId));
        clearPending(tempId);
        setError(failMessage(result.error));
      }
    });
  }

  const done = habits.filter((h) => h.done).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs font-semibold text-accent-bright">
          {done}/{habits.length}
        </span>
      </CardHeader>

      {error && (
        <p role="alert" className="mb-3 text-center text-sm text-ember">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {habits.map((habit) => (
          <li key={habit.id}>
            <button
              onClick={() => toggle(habit.id)}
              aria-pressed={habit.done}
              disabled={pending.has(habit.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50",
                habit.done
                  ? "border-green-bright/30 bg-green/15"
                  : "border-border bg-surface-2 hover:border-accent/30",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition",
                  habit.done ? "bg-green-bright text-background" : "bg-elevated text-muted",
                )}
              >
                {habit.done ? <Check className="size-4" /> : <Icon name={habit.icon} className="size-4" />}
              </span>
              <span className={cn("flex-1 text-sm font-medium", habit.done && "text-muted line-through")}>
                {habit.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-faint">
                <Flame className="size-3.5 text-ember/70" />
                {habit.streak}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {composing ? (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-border bg-surface-2 p-3">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={dict["habits.namePlaceholder"]}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent/40"
          />
          <div className="flex flex-wrap gap-2">
            {ICON_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setIcon(choice)}
                aria-pressed={icon === choice}
                className={cn(
                  "grid size-9 place-items-center rounded-lg border transition",
                  icon === choice
                    ? "border-accent/50 bg-accent/15 text-accent-bright"
                    : "border-border bg-surface text-muted hover:border-accent/30",
                )}
              >
                <Icon name={choice} className="size-4" />
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setComposing(false)}>
              {dict["common.cancel"]}
            </Button>
            <Button type="submit" size="sm" disabled={!label.trim()}>
              {dict["habits.addHabit"]}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setComposing(true)}>
          <Plus className="size-4" /> {dict["habits.addCustom"]}
        </Button>
      )}
    </Card>
  );
}

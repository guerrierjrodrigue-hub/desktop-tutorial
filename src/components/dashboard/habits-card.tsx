"use client";

import { useState, useTransition } from "react";
import { Check, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { habits as seedHabits } from "@/data/dashboard";
import { toggleHabit } from "@/app/(app)/dashboard/actions";
import { cn } from "@/lib/utils";

export function HabitsCard() {
  const [habits, setHabits] = useState(seedHabits);
  const [, startTransition] = useTransition();
  const done = habits.filter((h) => h.done).length;

  function toggle(id: string) {
    let nextDone = false;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        nextDone = !h.done;
        return {
          ...h,
          done: nextDone,
          streak: nextDone ? h.streak + 1 : h.streak - 1,
        };
      }),
    );
    startTransition(async () => {
      await toggleHabit(id, nextDone);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s habits</CardTitle>
        <span className="text-xs font-semibold text-gold-bright">
          {done}/{habits.length}
        </span>
      </CardHeader>
      <ul className="space-y-2">
        {habits.map((habit) => (
          <li key={habit.id}>
            <button
              onClick={() => toggle(habit.id)}
              aria-pressed={habit.done}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                habit.done
                  ? "border-green-bright/30 bg-green/15"
                  : "border-border bg-surface-2 hover:border-gold/30",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition",
                  habit.done
                    ? "bg-green-bright text-background"
                    : "bg-elevated text-muted",
                )}
              >
                {habit.done ? (
                  <Check className="size-4" />
                ) : (
                  <Icon name={habit.icon} className="size-4" />
                )}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm font-medium",
                  habit.done && "text-muted line-through",
                )}
              >
                {habit.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-faint">
                <Flame className="size-3.5 text-gold/70" />
                {habit.streak}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

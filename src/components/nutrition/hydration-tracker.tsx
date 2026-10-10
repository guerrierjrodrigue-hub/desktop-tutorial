"use client";

import { useState, useTransition } from "react";
import { Droplet, Plus, Undo2 } from "lucide-react";
import { addWater } from "@/app/(app)/nutrition/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";

const SEGMENTS = 8;

/**
 * Interactive hydration tracker. Optimistically updates the local total and
 * persists each change via `addWater` (which writes to `daily_stats`), so the
 * value survives a refresh and feeds the dashboard activity ring.
 */
export function HydrationTracker({
  initialMl,
  goalMl,
  dict,
}: {
  initialMl: number;
  goalMl: number;
  dict: Dictionary;
}) {
  const [ml, setMl] = useState(initialMl);
  const [pending, startTransition] = useTransition();

  function change(deltaMl: number) {
    const next = Math.max(0, ml + deltaMl);
    if (next === ml) return;
    setMl(next);
    startTransition(async () => {
      await addWater(deltaMl);
    });
  }

  const filled = goalMl > 0 ? Math.round((ml / goalMl) * SEGMENTS) : 0;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Droplet className="size-4 text-ember" /> {dict["hydration.title"]}
        </span>
        <span className="text-muted">
          {(ml / 1000).toFixed(1)}L / {(goalMl / 1000).toFixed(1)}L
        </span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`h-8 flex-1 rounded-md transition-colors ${
              i < filled ? "bg-gradient-to-t from-ember to-accent" : "bg-elevated"
            }`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => change(250)}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-elevated px-3 py-2 text-sm font-medium transition hover:border-accent/40 disabled:opacity-50"
        >
          <Plus className="size-3.5" /> 250 ml
        </button>
        <button
          onClick={() => change(500)}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-elevated px-3 py-2 text-sm font-medium transition hover:border-accent/40 disabled:opacity-50"
        >
          <Plus className="size-3.5" /> 500 ml
        </button>
        <button
          onClick={() => change(-250)}
          disabled={pending || ml === 0}
          aria-label={dict["hydration.undoAria"]}
          className="grid size-9 place-items-center rounded-lg border border-border bg-elevated text-muted transition hover:border-accent/40 disabled:opacity-40"
        >
          <Undo2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

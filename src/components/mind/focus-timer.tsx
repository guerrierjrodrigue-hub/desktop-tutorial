"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESETS_MIN = [15, 25, 45];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusTimer() {
  const [durationMin, setDurationMin] = useState(PRESETS_MIN[1]);
  const [remainingSec, setRemainingSec] = useState(PRESETS_MIN[1] * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (remainingSec <= 1) {
        setRunning(false);
        setSessionsToday((n) => n + 1);
        setRemainingSec(durationMin * 60);
      } else {
        setRemainingSec(remainingSec - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [running, remainingSec, durationMin]);

  function selectPreset(min: number) {
    setDurationMin(min);
    setRemainingSec(min * 60);
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setRemainingSec(durationMin * 60);
  }

  const progress = 1 - remainingSec / (durationMin * 60);

  return (
    <div className="space-y-5">
      <Card className="flex flex-col items-center py-10 text-center">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <Timer className="size-4" /> Focus session
        </span>
        <p className="mt-4 font-serif text-6xl font-semibold tabular-nums">
          {formatTime(remainingSec)}
        </p>

        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright transition-[width] duration-1000 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <Button size="lg" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="lg" variant="secondary" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <div className="mt-6 flex gap-2">
          {PRESETS_MIN.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => selectPreset(min)}
              aria-pressed={durationMin === min}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                durationMin === min
                  ? "border-gold/50 bg-gold/15 text-gold-bright"
                  : "border-border bg-surface-2 text-muted hover:border-gold/30",
              )}
            >
              {min} min
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Sessions today</p>
          <p className="text-xs text-muted">Each completed session builds your streak.</p>
        </div>
        <p className="font-serif text-3xl font-semibold text-gold-bright">{sessionsToday}</p>
      </Card>
    </div>
  );
}

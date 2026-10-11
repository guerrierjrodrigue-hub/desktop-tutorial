/**
 * Pure workout helpers — safe to import anywhere (no server-only deps), so the
 * server action, the program page, and unit tests share one source of truth.
 */
import type { Program } from "@/types";

export const MIN_WORKOUT_MINUTES = 1;
export const MAX_WORKOUT_MINUTES = 300;

/** Whether a duration is a valid whole number of minutes in range (1–300). */
export function isValidWorkoutDuration(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= MIN_WORKOUT_MINUTES &&
    minutes <= MAX_WORKOUT_MINUTES
  );
}

/** Completed-day count and total across a program's whole schedule. */
export function programProgress(
  program: Pick<Program, "schedule">,
  completed: Set<string>,
): { done: number; total: number; fraction: number } {
  const allDayIds = program.schedule.flatMap((w) => w.days.map((d) => d.id));
  const total = allDayIds.length;
  const done = allDayIds.filter((id) => completed.has(id)).length;
  return { done, total, fraction: total > 0 ? done / total : 0 };
}

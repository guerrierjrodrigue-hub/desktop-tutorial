/**
 * Pure workout helpers — safe to import anywhere (no server-only deps), so the
 * server action, the program page, and unit tests share one source of truth.
 */
import type { Program } from "@/types";

export const MIN_WORKOUT_MINUTES = 1;
export const MAX_WORKOUT_MINUTES = 300;

/** A session must last at least this long (real elapsed minutes) to earn XP. */
export const WORKOUT_XP_MIN_MINUTES = 5;

/** Whether a duration is a valid whole number of minutes in range (1–300). */
export function isValidWorkoutDuration(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= MIN_WORKOUT_MINUTES &&
    minutes <= MAX_WORKOUT_MINUTES
  );
}

/**
 * Whether a logged session is a genuine workout that earns XP and counts toward
 * badges: at least half of its sets completed AND at least 5 real minutes. A
 * "finish anyway" session (under half the sets) or a sub-5-minute tap is still
 * recorded in history, but earns nothing. Mirrors the ka_xp_workout DB trigger
 * (migration 0030) — the DB is the source of truth; this guard drives the
 * client's XP toast and the server action's reported amount.
 */
export function earnsWorkoutXp(
  setsDone: number,
  setsTotal: number,
  minutes: number,
): boolean {
  return (
    Number.isFinite(setsDone) &&
    Number.isFinite(setsTotal) &&
    setsTotal > 0 &&
    setsDone * 2 >= setsTotal &&
    minutes >= WORKOUT_XP_MIN_MINUTES
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

/**
 * Pure running helpers: pace, formatting, Riegel time prediction, and the
 * anti-cheat limits. No next/* imports, so these are safe to use on the server
 * and the client and are unit-tested in running.test.ts. Metric throughout
 * (metres, seconds, seconds-per-kilometre).
 */

import type { RunKind, RunSegment } from "@/types";

/** Plausible human pace bounds, in seconds per kilometre. */
export const MIN_PACE_S_PER_KM = 150; // 2:30 /km
export const MAX_PACE_S_PER_KM = 900; // 15:00 /km
/** A single manual entry may not exceed this distance. */
export const MAX_RUN_DISTANCE_M = 100_000; // 100 km
/** At most this many runs may be logged for one day. */
export const MAX_RUNS_PER_DAY = 5;
/** Riegel endurance exponent (1.06 is the classic fatigue factor). */
export const RIEGEL_EXPONENT = 1.06;

export const RUN_KINDS: RunKind[] = ["easy", "tempo", "intervals", "long", "race"];

/** Seconds per kilometre for a distance (m) run in a duration (s). */
export function paceSecPerKm(distanceM: number, durationS: number): number {
  if (distanceM <= 0 || durationS <= 0) return 0;
  return Math.round((durationS * 1000) / distanceM);
}

/** Pace as "m:ss" (per km); "0:00" when undefined. */
export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "0:00";
  const total = Math.round(secPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Duration as "m:ss" under an hour, else "h:mm:ss". */
export function formatDuration(totalS: number): string {
  const t = Math.max(0, Math.round(totalS));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Metres as kilometres, trimmed (e.g. 5000 -> "5", 5250 -> "5.25"). */
export function formatKm(distanceM: number): string {
  const km = distanceM / 1000;
  return (Math.round(km * 100) / 100).toString();
}

/** Parse h/m/s fields into total seconds (missing parts count as 0). */
export function durationToSeconds(h: number, m: number, s: number): number {
  const hh = Number.isFinite(h) ? Math.max(0, Math.floor(h)) : 0;
  const mm = Number.isFinite(m) ? Math.max(0, Math.floor(m)) : 0;
  const ss = Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
  return hh * 3600 + mm * 60 + ss;
}

/**
 * Riegel's race-time prediction: T2 = T1 * (D2 / D1) ^ 1.06. Given a known
 * distance/time, predict the time for a target distance. Returns seconds
 * (rounded), or 0 for invalid inputs.
 */
export function riegelPredict(
  knownDistanceM: number,
  knownTimeS: number,
  targetDistanceM: number,
  exponent: number = RIEGEL_EXPONENT,
): number {
  if (knownDistanceM <= 0 || knownTimeS <= 0 || targetDistanceM <= 0) return 0;
  return Math.round(knownTimeS * Math.pow(targetDistanceM / knownDistanceM, exponent));
}

export interface RunValidation {
  ok: boolean;
  /** Dictionary key for the error, when not ok. */
  error?: string;
}

/**
 * Validate a manual run against the anti-cheat limits. `distanceM` and
 * `durationS` are required; the daily count (how many runs already logged for
 * this date) is checked by the caller against MAX_RUNS_PER_DAY.
 */
export function validateRun(distanceM: number, durationS: number): RunValidation {
  if (!Number.isFinite(distanceM) || distanceM <= 0) return { ok: false, error: "course.error.distance" };
  if (distanceM > MAX_RUN_DISTANCE_M) return { ok: false, error: "course.error.tooFar" };
  if (!Number.isFinite(durationS) || durationS <= 0) return { ok: false, error: "course.error.duration" };
  const pace = paceSecPerKm(distanceM, durationS);
  if (pace < MIN_PACE_S_PER_KM || pace > MAX_PACE_S_PER_KM) return { ok: false, error: "course.error.pace" };
  return { ok: true };
}

/** Total seconds of a session's segments (zero-length segments ignored). */
export function segmentsTotalSeconds(segments: RunSegment[]): number {
  return segments.reduce((sum, s) => sum + (s.seconds > 0 ? s.seconds : 0), 0);
}

/** Drop zero/negative-length segments (defensive for the timer and displays). */
export function cleanSegments(segments: RunSegment[]): RunSegment[] {
  return segments.filter((s) => s.seconds > 0);
}

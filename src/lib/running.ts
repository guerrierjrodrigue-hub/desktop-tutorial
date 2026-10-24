/**
 * Pure running helpers: pace, formatting, Riegel time prediction, and the
 * anti-cheat limits. No next/* imports, so these are safe to use on the server
 * and the client and are unit-tested in running.test.ts. Metric throughout
 * (metres, seconds, seconds-per-kilometre).
 */

import type { RunGoalKind, RunKind, RunLevel, RunSegment } from "@/types";

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

// --- Training paces (estimation, no AI) ----------------------------------
// Simple, documented rule: predict an equivalent 5 km time with Riegel, take
// that 5 km pace, then set each training zone as a fixed multiple of it. These
// multipliers are ballpark relationships between 5 km pace and the common
// zones; always shown with an "estimation" caveat, never as a prescription.

export type PaceZone = "easy" | "long" | "tempo" | "interval" | "repetition";

/** [faster-end, slower-end] multipliers applied to the estimated 5 km pace
 * (a larger multiple is a slower pace, i.e. more seconds per km). */
export const PACE_ZONE_FACTORS: Record<PaceZone, [number, number]> = {
  easy: [1.25, 1.4],
  long: [1.15, 1.25],
  tempo: [1.05, 1.1],
  interval: [0.97, 1.02],
  repetition: [0.9, 0.95],
};

export interface PaceRange {
  /** Slower end of the range, seconds per km. */
  slowSPerKm: number;
  /** Faster end of the range, seconds per km. */
  fastSPerKm: number;
}

export interface TrainingPaces {
  /** Estimated 5 km pace the zones are derived from. */
  fiveKPaceSPerKm: number;
  zones: Record<PaceZone, PaceRange>;
}

/**
 * Estimate training paces from a recent race (distance + time). Returns null
 * for invalid inputs or an implausible resulting pace.
 */
export function trainingPaces(raceDistanceM: number, raceTimeS: number): TrainingPaces | null {
  if (!Number.isFinite(raceDistanceM) || !Number.isFinite(raceTimeS)) return null;
  if (raceDistanceM <= 0 || raceTimeS <= 0) return null;
  const fiveKTime = riegelPredict(raceDistanceM, raceTimeS, 5000);
  const p5 = paceSecPerKm(5000, fiveKTime);
  if (p5 < MIN_PACE_S_PER_KM || p5 > MAX_PACE_S_PER_KM) return null;
  const zones = {} as Record<PaceZone, PaceRange>;
  for (const zone of Object.keys(PACE_ZONE_FACTORS) as PaceZone[]) {
    const [fast, slow] = PACE_ZONE_FACTORS[zone];
    zones[zone] = {
      fastSPerKm: Math.round(p5 * fast),
      slowSPerKm: Math.round(p5 * slow),
    };
  }
  return { fiveKPaceSPerKm: p5, zones };
}

// --- Race countdown ------------------------------------------------------

/** Whole days from `fromISO` (YYYY-MM-DD) to `toISO`, inclusive of partial days as ceil. */
export function daysUntil(fromISO: string, toISO: string): number | null {
  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to = Date.parse(`${toISO}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.round((to - from) / 86_400_000);
}

// --- Interval builder ----------------------------------------------------

export type IntervalMode = "duration" | "distance";

export interface IntervalBuilderInput {
  reps: number;
  mode: IntervalMode;
  /** Required when mode = "duration": seconds per rep. */
  runSeconds?: number;
  /** Required when mode = "distance": metres per rep. */
  runDistanceM?: number;
  /** Required when mode = "distance": pace used to convert metres to seconds. */
  paceSPerKm?: number;
  recoverySeconds: number;
  warmupSeconds?: number;
  cooldownSeconds?: number;
}

/** Max reps the interval builder accepts (keeps a session sane). */
export const MAX_INTERVAL_REPS = 30;

/**
 * Turn an interval description into timer segments: optional warm-up, then each
 * rep as a run segment with a walk (recovery) between reps, then an optional
 * cool-down. Distance reps are converted to seconds with the given pace.
 * Returns an empty array for invalid input.
 */
export function buildIntervalSegments(input: IntervalBuilderInput): RunSegment[] {
  const reps = Math.floor(input.reps);
  if (!Number.isFinite(reps) || reps < 1 || reps > MAX_INTERVAL_REPS) return [];

  let runSeconds = 0;
  if (input.mode === "duration") {
    runSeconds = Math.floor(input.runSeconds ?? 0);
  } else {
    const m = input.runDistanceM ?? 0;
    const pace = input.paceSPerKm ?? 0;
    if (m <= 0 || pace <= 0) return [];
    runSeconds = Math.round((m / 1000) * pace);
  }
  if (!Number.isFinite(runSeconds) || runSeconds <= 0) return [];

  const warmup = Math.max(0, Math.floor(input.warmupSeconds ?? 0));
  const cooldown = Math.max(0, Math.floor(input.cooldownSeconds ?? 0));
  const recovery = Math.max(0, Math.floor(input.recoverySeconds ?? 0));

  const segments: RunSegment[] = [];
  if (warmup > 0) segments.push({ kind: "warmup", seconds: warmup });
  for (let i = 0; i < reps; i++) {
    segments.push({ kind: "run", seconds: runSeconds });
    if (i < reps - 1 && recovery > 0) segments.push({ kind: "walk", seconds: recovery });
  }
  if (cooldown > 0) segments.push({ kind: "cooldown", seconds: cooldown });
  return segments;
}

// --- Weekly load ---------------------------------------------------------

/** Advised ceiling on week-over-week distance growth (the classic 10% rule). */
export const WEEKLY_LOAD_WARN_RATIO = 1.1;

export interface WeeklyLoad {
  ratio: number;
  /** True when this week exceeds last week by more than 10%. Advisory only. */
  over: boolean;
}

/** Compare this week's distance to last week's. Null when there is no baseline. */
export function weeklyLoadWarning(thisWeekM: number, lastWeekM: number): WeeklyLoad | null {
  if (!Number.isFinite(lastWeekM) || lastWeekM <= 0) return null;
  if (!Number.isFinite(thisWeekM) || thisWeekM < 0) return null;
  const ratio = thisWeekM / lastWeekM;
  return { ratio, over: ratio > WEEKLY_LOAD_WARN_RATIO };
}

// --- Shoe wear -----------------------------------------------------------

/** Suggest checking a shoe pair once it passes this cumulative distance. */
export const SHOE_WEAR_ALERT_M = 700_000; // 700 km

/** Whether a shoe pair has reached the wear-check threshold. Advisory only. */
export function shoeWearAlert(distanceM: number): boolean {
  return Number.isFinite(distanceM) && distanceM >= SHOE_WEAR_ALERT_M;
}

// --- Plan recommendation -------------------------------------------------

/** Concrete target distance (metres) for a goal kind; null for free running. */
export function goalKindDistanceM(goalKind: RunGoalKind): number | null {
  switch (goalKind) {
    case "5k": return 5000;
    case "10k": return 10000;
    case "half": return 21097;
    case "free": return null;
  }
}

/**
 * Recommend a plan slug from the runner's experience and goal. Free runners
 * get no plan (null). A 5 km goal sends a complete beginner to the 8-week
 * couch-to-5k and anyone already running to the 6-week "faster 5k".
 */
export function recommendPlanSlug(level: RunLevel, goalKind: RunGoalKind): string | null {
  switch (goalKind) {
    case "free": return null;
    case "5k": return level === "new" ? "c5k-8" : "c5k-faster-6";
    case "10k": return "c10k-10";
    case "half": return "half-12";
  }
}

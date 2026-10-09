/**
 * Pure challenge-window math. A challenge's window runs from the day the user
 * joined for `durationDays` days — so "days left" is personal, not a fixed
 * seeded date. Testable without Supabase.
 */

/** Whole days from date `a` to date `b` (both YYYY-MM-DD); b - a. */
export function daysBetween(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00Z`);
  const db = Date.parse(`${b}T00:00:00Z`);
  return Math.round((db - da) / 86_400_000);
}

/** Days remaining in a joined challenge's window (never negative). */
export function daysLeftFor(
  joinedDate: string,
  durationDays: number,
  todayStr: string,
): number {
  const elapsed = daysBetween(joinedDate, todayStr);
  return Math.max(0, durationDays - elapsed);
}

/** Target for the workout-count challenge ("30 workouts"). */
export const WORKOUT_CHALLENGE_TARGET = 30;

/** Progress (0..1) for a workout-count challenge from a real workout count. */
export function workoutProgress(
  count: number,
  target: number = WORKOUT_CHALLENGE_TARGET,
): number {
  if (target <= 0) return 0;
  return Math.min(1, Math.max(0, count) / target);
}

/**
 * Pick which challenge the dashboard card features: the user's joined challenge
 * (shown as "in progress" with real progress) if any, otherwise the first
 * challenge as a recommendation (shown with its duration + a Join button).
 */
export function pickDashboardChallenge<T extends { joined: boolean }>(
  challenges: T[],
): T | undefined {
  return challenges.find((c) => c.joined) ?? challenges[0];
}

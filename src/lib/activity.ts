/**
 * Activity mode helpers (A1). A profile's primary_activity is "strength",
 * "running", "both", or unset. These pure predicates decide what each mode
 * sees. An unset mode (no choice yet) is treated as "both" so nothing is hidden
 * before the user picks, while the dashboard nudges them to choose.
 */

export type ActivityMode = "strength" | "running" | "both";

/** Strength surfaces (Fitness) are shown for strength, both, and unset. */
export function showsStrength(mode: ActivityMode | null | undefined): boolean {
  return mode !== "running";
}

/** Running surfaces (Course) are shown for running, both, and unset. */
export function showsRunning(mode: ActivityMode | null | undefined): boolean {
  return mode !== "strength";
}

/**
 * Pure derivations over a list of runs (week totals, weekly distance series,
 * personal records). No next/* or DB imports, so they are unit-tested directly.
 */
import { addDaysToDateStr } from "@/lib/date";
import type { Run, RunRecords, RunWeekStats } from "@/types";

/** Monday (YYYY-MM-DD) of the ISO week containing `dateStr`. */
export function isoWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = (dt.getUTCDay() + 6) % 7; // 0 = Monday
  return addDaysToDateStr(dateStr, -dow);
}

/** Current-week totals (distance, number of runs, longest run). */
export function weekStats(runs: Run[], todayStr: string): RunWeekStats {
  const start = isoWeekStart(todayStr);
  const end = addDaysToDateStr(start, 7);
  const inWeek = runs.filter((r) => r.ranOn >= start && r.ranOn < end);
  return {
    distanceM: inWeek.reduce((s, r) => s + r.distanceM, 0),
    runs: inWeek.length,
    longestM: inWeek.reduce((m, r) => Math.max(m, r.distanceM), 0),
  };
}

/** Distance per ISO week for the last `weeks` weeks, oldest first. */
export function weeklyDistances(
  runs: Run[],
  todayStr: string,
  weeks = 8,
): { weekStart: string; distanceM: number }[] {
  const thisStart = isoWeekStart(todayStr);
  const out: { weekStart: string; distanceM: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDaysToDateStr(thisStart, -7 * i);
    const end = addDaysToDateStr(start, 7);
    const distanceM = runs
      .filter((r) => r.ranOn >= start && r.ranOn < end)
      .reduce((s, r) => s + r.distanceM, 0);
    out.push({ weekStart: start, distanceM });
  }
  return out;
}

/**
 * Personal records at 1 km, 5 km and 10 km. For each distance we take the best
 * (smallest) pace over any run that covered at least that distance, expressed as
 * the time for exactly that distance. A simple, honest step-1 estimate (no GPS
 * splits), comparable across runs.
 */
export function records(runs: Run[]): RunRecords {
  const best = (distanceM: number): number | undefined => {
    const eligible = runs.filter((r) => r.distanceM >= distanceM && r.paceSPerKm > 0);
    if (eligible.length === 0) return undefined;
    const bestPace = Math.min(...eligible.map((r) => r.paceSPerKm));
    return Math.round((bestPace * distanceM) / 1000);
  };
  return { oneK: best(1000), fiveK: best(5000), tenK: best(10000) };
}

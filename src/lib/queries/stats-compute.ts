import type { DailyStats } from "@/types";

/** Zeroed stats with sensible default goals, used when no `daily_stats` row exists. */
export const BLANK_STATS: DailyStats = {
  caloriesBurned: 0,
  caloriesGoal: 650,
  activeMinutes: 0,
  activeMinutesGoal: 45,
  proteinG: 0,
  waterMl: 0,
  waterGoalMl: 3000,
};

/** Rough estimate: no per-workout calorie source exists, so we approximate from
 * active minutes at a moderate ~8 kcal/min. Transparent and clearly an estimate. */
export const CALORIES_PER_ACTIVE_MINUTE = 8;

/** The `daily_stats` columns we read (goals + water; other fields are derived). */
export interface RawDailyStatsRow {
  calories_burned?: number | null;
  calories_goal?: number | null;
  active_minutes_goal?: number | null;
  protein_g?: number | null;
  water_ml?: number | null;
  water_goal_ml?: number | null;
}

/**
 * Pure composition of a day's stats from its sources: protein comes from the
 * summed `food_logs` (falling back to a stored row value), active minutes from
 * `workout_logs`, calories burned are estimated from active minutes unless the
 * row already has a value, and goals/water come from the row or defaults.
 * Pure and dependency-free so it can be unit-tested without touching Supabase.
 */
export function composeTodayStats(
  row: RawDailyStatsRow | null,
  proteinSum: number,
  activeMinutes: number,
): DailyStats {
  return {
    caloriesBurned:
      row?.calories_burned || activeMinutes * CALORIES_PER_ACTIVE_MINUTE,
    caloriesGoal: row?.calories_goal ?? BLANK_STATS.caloriesGoal,
    activeMinutes,
    activeMinutesGoal: row?.active_minutes_goal ?? BLANK_STATS.activeMinutesGoal,
    proteinG: proteinSum || (row?.protein_g ?? 0),
    waterMl: row?.water_ml ?? 0,
    waterGoalMl: row?.water_goal_ml ?? BLANK_STATS.waterGoalMl,
  };
}

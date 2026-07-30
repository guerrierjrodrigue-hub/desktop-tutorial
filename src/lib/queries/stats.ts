import { getAuthedContext } from "@/lib/supabase/auth";
import { todayStats as mockTodayStats } from "@/data/dashboard";
import type { DailyStats } from "@/types";

const BLANK_STATS: DailyStats = {
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
const CALORIES_PER_ACTIVE_MINUTE = 8;

/**
 * The signed-in user's activity stats for today.
 *
 * Computed live from the source tables the user actually writes to — protein
 * from `food_logs`, active minutes from `workout_logs` — rather than a
 * `daily_stats` row (which nothing populates yet). Goals and water come from a
 * `daily_stats` row if one exists, otherwise sensible defaults. Demo data when
 * Supabase is unconfigured.
 */
export async function getTodayStats(): Promise<DailyStats> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockTodayStats;

  const todayStr = new Date().toISOString().slice(0, 10);
  const startOfDay = `${todayStr}T00:00:00.000Z`;

  const [statsRes, foodRes, workoutRes] = await Promise.all([
    ctx.supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("stat_date", todayStr)
      .maybeSingle(),
    ctx.supabase
      .from("food_logs")
      .select("protein_g")
      .eq("user_id", ctx.userId)
      .eq("log_date", todayStr),
    ctx.supabase
      .from("workout_logs")
      .select("duration_minutes")
      .eq("user_id", ctx.userId)
      .gte("completed_at", startOfDay),
  ]);

  const row = statsRes.data as {
    calories_burned?: number;
    calories_goal?: number;
    active_minutes_goal?: number;
    protein_g?: number;
    water_ml?: number;
    water_goal_ml?: number;
  } | null;

  const proteinG =
    ((foodRes.data as { protein_g: number }[] | null) ?? []).reduce(
      (sum, r) => sum + (r.protein_g ?? 0),
      0,
    ) || (row?.protein_g ?? 0);

  const activeMinutes = (
    (workoutRes.data as { duration_minutes: number }[] | null) ?? []
  ).reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0);

  const caloriesBurned =
    row?.calories_burned || activeMinutes * CALORIES_PER_ACTIVE_MINUTE;

  return {
    caloriesBurned,
    caloriesGoal: row?.calories_goal ?? BLANK_STATS.caloriesGoal,
    activeMinutes,
    activeMinutesGoal: row?.active_minutes_goal ?? BLANK_STATS.activeMinutesGoal,
    proteinG,
    waterMl: row?.water_ml ?? 0,
    waterGoalMl: row?.water_goal_ml ?? BLANK_STATS.waterGoalMl,
  };
}

/** Whether the signed-in user has logged a workout today (demo mode always false — quests never fake completion). */
export async function getWorkoutDoneToday(): Promise<boolean> {
  const ctx = await getAuthedContext();
  if (!ctx) return false;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await ctx.supabase
    .from("workout_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .gte("completed_at", startOfDay.toISOString());

  return (count ?? 0) > 0;
}

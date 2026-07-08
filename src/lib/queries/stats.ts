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

/** The signed-in user's activity stats for today (demo data when unconfigured, zeroed goals when no log exists yet). */
export async function getTodayStats(): Promise<DailyStats> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockTodayStats;

  const todayStr = new Date().toISOString().slice(0, 10);
  const { data } = await ctx.supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("stat_date", todayStr)
    .maybeSingle();

  if (!data) return BLANK_STATS;

  return {
    caloriesBurned: data.calories_burned,
    caloriesGoal: data.calories_goal,
    activeMinutes: data.active_minutes,
    activeMinutesGoal: data.active_minutes_goal,
    proteinG: data.protein_g,
    waterMl: data.water_ml,
    waterGoalMl: data.water_goal_ml,
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

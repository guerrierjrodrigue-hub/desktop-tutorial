import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday, startOfLocalDayUTC } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { todayStats as mockTodayStats } from "@/data/dashboard";
import type { DailyStats } from "@/types";
import { composeTodayStats, type RawDailyStatsRow } from "./stats-compute";

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

  const tz = await getUserTimezone();
  const todayStr = getUserToday(tz);
  const startOfDay = startOfLocalDayUTC(tz);

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

  const row = statsRes.data as RawDailyStatsRow | null;

  const proteinSum = (
    (foodRes.data as { protein_g: number }[] | null) ?? []
  ).reduce((sum, r) => sum + (r.protein_g ?? 0), 0);

  const activeMinutes = (
    (workoutRes.data as { duration_minutes: number }[] | null) ?? []
  ).reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0);

  return composeTodayStats(row, proteinSum, activeMinutes);
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

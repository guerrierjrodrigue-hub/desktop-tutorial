import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday, addDaysToDateStr } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { habits as mockHabits } from "@/data/dashboard";
import type { Habit } from "@/types";

/**
 * Consecutive done-days ending on `todayStr` (or ending yesterday if today
 * isn't done yet). Works on YYYY-MM-DD strings so it's timezone-correct.
 */
export function computeStreak(doneDates: Set<string>, todayStr: string): number {
  let cursor = todayStr;
  if (!doneDates.has(cursor)) {
    cursor = addDaysToDateStr(cursor, -1);
    if (!doneDates.has(cursor)) return 0;
  }
  let streak = 0;
  while (doneDates.has(cursor)) {
    streak++;
    cursor = addDaysToDateStr(cursor, -1);
  }
  return streak;
}

/** The signed-in user's habits with today's completion + running streak (demo data when unconfigured). */
export async function getHabits(): Promise<Habit[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockHabits;

  const { data: habitRows } = await ctx.supabase
    .from("habits")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: true });
  if (!habitRows) return [];

  const tz = await getUserTimezone();
  const todayStr = getUserToday(tz);
  const { data: logRows } = await ctx.supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", ctx.userId)
    .gte("log_date", addDaysToDateStr(todayStr, -90));

  const logsByHabit = new Map<string, Set<string>>();
  for (const log of logRows ?? []) {
    if (!log.done) continue;
    if (!logsByHabit.has(log.habit_id)) logsByHabit.set(log.habit_id, new Set());
    logsByHabit.get(log.habit_id)!.add(log.log_date);
  }

  return habitRows.map((row) => {
    const doneDates = logsByHabit.get(row.id) ?? new Set<string>();
    return {
      id: row.id,
      label: row.label,
      icon: row.icon,
      done: doneDates.has(todayStr),
      streak: computeStreak(doneDates, todayStr),
    };
  });
}

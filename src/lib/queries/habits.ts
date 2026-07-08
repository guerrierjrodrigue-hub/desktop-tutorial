import { getAuthedContext } from "@/lib/supabase/auth";
import { habits as mockHabits } from "@/data/dashboard";
import type { Habit } from "@/types";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Consecutive done-days ending today (or ending yesterday if today isn't done yet). */
function computeStreak(doneDates: Set<string>, today: Date): number {
  const cursor = new Date(today);
  if (!doneDates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!doneDates.has(toDateStr(cursor))) return 0;
  }
  let streak = 0;
  while (doneDates.has(toDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
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

  const since = new Date();
  since.setDate(since.getDate() - 90);
  const { data: logRows } = await ctx.supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", ctx.userId)
    .gte("log_date", toDateStr(since));

  const logsByHabit = new Map<string, Set<string>>();
  for (const log of logRows ?? []) {
    if (!log.done) continue;
    if (!logsByHabit.has(log.habit_id)) logsByHabit.set(log.habit_id, new Set());
    logsByHabit.get(log.habit_id)!.add(log.log_date);
  }

  const today = new Date();
  const todayStr = toDateStr(today);

  return habitRows.map((row) => {
    const doneDates = logsByHabit.get(row.id) ?? new Set<string>();
    return {
      id: row.id,
      label: row.label,
      icon: row.icon,
      done: doneDates.has(todayStr),
      streak: computeStreak(doneDates, today),
    };
  });
}

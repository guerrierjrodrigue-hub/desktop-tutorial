import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday, addDaysToDateStr } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { localizeHabitLabel } from "@/lib/content-i18n";
import { getCurrentUser } from "@/lib/queries/profile";
import { spreadTrainingDays, mondayIndexFromDateStr } from "@/lib/week-plan";
import { computeStreak } from "@/lib/habit-streak";
import { habits as mockHabits } from "@/data/dashboard";
import type { LocaleCode } from "@/i18n/locales";
import type { Habit } from "@/types";

export { computeStreak };

/** The lucide icon that identifies the "complete workout" habit. */
const WORKOUT_HABIT_ICON = "Dumbbell";

/**
 * The signed-in user's habits with today's completion + running streak, with
 * default habit labels localized to `locale` (custom labels kept as typed).
 * Demo data when Supabase is unconfigured.
 */
export async function getHabits(locale: LocaleCode = "en"): Promise<Habit[]> {
  const ctx = await getAuthedContext();
  if (!ctx) {
    return mockHabits.map((h) => ({ ...h, label: localizeHabitLabel(h.label, locale) }));
  }

  const { data: habitRows } = await ctx.supabase
    .from("habits")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: true });
  if (!habitRows) return [];

  const tz = await getUserTimezone();
  const todayStr = getUserToday(tz);
  const since = addDaysToDateStr(todayStr, -90);
  const [{ data: logRows }, { data: workoutRows }] = await Promise.all([
    ctx.supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", ctx.userId)
      .gte("log_date", since),
    // Completed workouts auto-satisfy the "do the workout" habit, so finishing a
    // session checks it off (and feeds its streak) without a second manual tap.
    ctx.supabase
      .from("workout_logs")
      .select("completed_at")
      .eq("user_id", ctx.userId)
      .gte("completed_at", `${since}T00:00:00Z`),
  ]);

  const logsByHabit = new Map<string, Set<string>>();
  for (const log of logRows ?? []) {
    if (!log.done) continue;
    if (!logsByHabit.has(log.habit_id)) logsByHabit.set(log.habit_id, new Set());
    logsByHabit.get(log.habit_id)!.add(log.log_date);
  }

  // Local days (user's timezone) on which a workout was completed.
  const workoutDays = new Set<string>();
  for (const w of (workoutRows ?? []) as { completed_at: string }[]) {
    workoutDays.add(getUserToday(tz, new Date(w.completed_at)));
  }

  // Rest-day pattern from the user's weekly cadence (Mon→Sun). A planned rest
  // day neither breaks the workout habit's streak nor counts against the user.
  const user = await getCurrentUser();
  const weekPattern = spreadTrainingDays(user.trainingDays ?? 3);
  const isWorkoutRestDay = (dateStr: string) =>
    weekPattern[mondayIndexFromDateStr(dateStr)] === "rest";
  const todayIsRest = isWorkoutRestDay(todayStr);

  return habitRows.map((row) => {
    const isWorkoutHabit = row.icon === WORKOUT_HABIT_ICON;
    const doneDates = logsByHabit.get(row.id) ?? new Set<string>();
    // The workout habit also counts every day a session was actually completed.
    if (isWorkoutHabit) for (const d of workoutDays) doneDates.add(d);
    return {
      id: row.id,
      label: localizeHabitLabel(row.label, locale),
      icon: row.icon,
      done: doneDates.has(todayStr),
      streak: computeStreak(
        doneDates,
        todayStr,
        isWorkoutHabit ? isWorkoutRestDay : undefined,
      ),
      ...(isWorkoutHabit && todayIsRest ? { restExempt: true } : {}),
    };
  });
}

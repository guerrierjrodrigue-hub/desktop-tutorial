"use server";

import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/**
 * Record whether a habit was completed today. Upserts a single row per
 * (habit, day) so toggling on/off is idempotent.
 */
export async function toggleHabit(
  habitId: string,
  done: boolean,
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const today = getUserToday(await getUserTimezone());
  const { error } = await ctx.supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: ctx.userId, log_date: today, done },
      { onConflict: "habit_id,log_date" },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Persist the signed-in user's dashboard widget order/visibility. */
export async function saveDashboardLayout(
  layout: { id: string; hidden: boolean }[],
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("user_preferences")
    .upsert({ user_id: ctx.userId, dashboard_layout: layout }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

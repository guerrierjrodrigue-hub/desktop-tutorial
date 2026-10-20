"use server";

import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { XP_REWARDS } from "@/lib/gamification";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

const toggleHabitSchema = z.object({
  habitId: z.string().uuid(),
  done: z.boolean(),
});

const layoutSchema = z
  .array(z.object({ id: z.string().min(1), hidden: z.boolean() }))
  .max(50);

/**
 * Record whether a habit was completed today. Upserts a single row per
 * (habit, day) so toggling on/off is idempotent.
 */
export async function toggleHabit(
  habitId: string,
  done: boolean,
): Promise<ActionResult> {
  // Demo mode first: seed ids aren't real uuids, so returning the no-op success
  // before validation keeps optimistic UI intact instead of a spurious failure.
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(toggleHabitSchema, { habitId, done });
  if (!check.ok) return check.result;

  const today = getUserToday(await getUserTimezone());
  const { error } = await ctx.supabase
    .from("habit_logs")
    .upsert(
      { habit_id: check.data.habitId, user_id: ctx.userId, log_date: today, done: check.data.done },
      { onConflict: "habit_id,log_date" },
    );

  if (error) return logAndFail(error);
  // XP is awarded server-side by a DB trigger only when marking a habit done.
  return { ok: true, xp: done ? XP_REWARDS.habit : undefined };
}

/** Persist the signed-in user's dashboard widget order/visibility. */
export async function saveDashboardLayout(
  layout: { id: string; hidden: boolean }[],
): Promise<ActionResult> {
  const check = validate(layoutSchema, layout);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("user_preferences")
    .upsert({ user_id: ctx.userId, dashboard_layout: check.data }, { onConflict: "user_id" });
  if (error) return logAndFail(error);

  return { ok: true };
}

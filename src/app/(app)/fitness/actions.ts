"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { XP_REWARDS } from "@/lib/gamification";
import {
  isValidWorkoutDuration,
  earnsWorkoutXp,
  MIN_WORKOUT_MINUTES,
  MAX_WORKOUT_MINUTES,
} from "@/lib/workout";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

export interface LogWorkoutInput {
  /** Program slug (the public id used in URLs). */
  programId: string;
  /** workout_days.id of the day being completed. */
  dayId: string;
  durationMinutes: number;
  /** Sets actually checked off, and the day's total — drive the XP eligibility. */
  setsDone: number;
  setsTotal: number;
}

const logWorkoutSchema = z.object({
  programId: z.string().trim().min(1).max(100),
  dayId: z.string().uuid(),
  durationMinutes: z
    .number()
    .int("fitness.error.invalidDuration")
    .min(MIN_WORKOUT_MINUTES, "fitness.error.invalidDuration")
    .max(MAX_WORKOUT_MINUTES, "fitness.error.invalidDuration"),
  setsDone: z.number().int().min(0).max(1000),
  setsTotal: z.number().int().min(0).max(1000),
});

/**
 * Log a completed workout-day for the signed-in user.
 *
 * Hardened: the duration is bounded (1–300 min), the day is verified to belong
 * to the named program, and the write is idempotent per workout-day per calendar
 * day (a double-click or retried request records at most one log, awards XP once,
 * and advances program progress once) — enforced by the DB unique index from
 * migration 0025. XP itself is awarded server-side by the ka_xp_workout trigger.
 */
export async function logWorkoutCompletion(input: LogWorkoutInput): Promise<ActionResult> {
  const check = validate(logWorkoutSchema, input);
  if (!check.ok) return check.result;
  const { programId, dayId, durationMinutes, setsDone, setsTotal } = check.data;

  // Belt-and-suspenders with the shared pure guard (also used by the client).
  if (!isValidWorkoutDuration(durationMinutes)) {
    return { ok: false, error: "fitness.error.invalidDuration" };
  }

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // Verify the day belongs to the named program (day → week → program.slug).
  const { data: dayRow } = await ctx.supabase
    .from("workout_days")
    .select("id, program_weeks!inner(programs!inner(slug))")
    .eq("id", dayId)
    .eq("program_weeks.programs.slug", programId)
    .maybeSingle();
  if (!dayRow) {
    return { ok: false, error: "fitness.error.dayNotInProgram" };
  }

  // Does this session earn XP? At least half the sets AND >= 5 real minutes.
  // A "finish anyway" / too-short session is still recorded (history) below.
  // Mirror of the ka_xp_workout trigger — which is the real source of truth.
  const eligible = earnsWorkoutXp(setsDone, setsTotal, durationMinutes);

  // Workout XP is capped at one reward per local day. Check whether today's
  // reward is already banked, so the toast reports the true amount (the trigger
  // enforces the cap regardless).
  let alreadyEarnedToday = false;
  if (eligible) {
    const today = getUserToday(await getUserTimezone());
    const { count } = await ctx.supabase
      .from("xp_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("type", "workout")
      .eq("ref_id", "")
      .eq("day", today);
    alreadyEarnedToday = (count ?? 0) > 0;
  }

  const { error } = await ctx.supabase.from("workout_logs").insert({
    user_id: ctx.userId,
    workout_day_id: dayId,
    duration_minutes: durationMinutes,
    sets_done: setsDone,
    sets_total: setsTotal,
  });

  if (error) {
    // 23505 = unique_violation: this day was already logged today. Treat the
    // repeat as a successful no-op (no duplicate XP, no double progress).
    if (error.code === "23505") {
      revalidatePath(`/fitness/${programId}`);
      return { ok: true, xp: 0 };
    }
    return logAndFail(error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/fitness/${programId}`);
  return { ok: true, xp: eligible && !alreadyEarnedToday ? XP_REWARDS.workout : 0 };
}

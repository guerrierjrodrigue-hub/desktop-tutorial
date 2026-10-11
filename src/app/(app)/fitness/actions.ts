"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { XP_REWARDS } from "@/lib/gamification";
import { isValidWorkoutDuration, MIN_WORKOUT_MINUTES, MAX_WORKOUT_MINUTES } from "@/lib/workout";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

export interface LogWorkoutInput {
  /** Program slug (the public id used in URLs). */
  programId: string;
  /** workout_days.id of the day being completed. */
  dayId: string;
  durationMinutes: number;
}

const logWorkoutSchema = z.object({
  programId: z.string().trim().min(1).max(100),
  dayId: z.string().uuid(),
  durationMinutes: z
    .number()
    .int("fitness.error.invalidDuration")
    .min(MIN_WORKOUT_MINUTES, "fitness.error.invalidDuration")
    .max(MAX_WORKOUT_MINUTES, "fitness.error.invalidDuration"),
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
  const { programId, dayId, durationMinutes } = check.data;

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

  const { error } = await ctx.supabase.from("workout_logs").insert({
    user_id: ctx.userId,
    workout_day_id: dayId,
    duration_minutes: durationMinutes,
  });

  if (error) {
    // 23505 = unique_violation: this day was already logged today. Treat the
    // repeat as a successful no-op (no duplicate XP, no double progress).
    if (error.code === "23505") {
      revalidatePath(`/fitness/${programId}`);
      return { ok: true };
    }
    return logAndFail(error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/fitness/${programId}`);
  return { ok: true, xp: XP_REWARDS.workout };
}

"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/** Log a completed workout session for the signed-in user. */
export async function logWorkoutCompletion(
  durationMinutes: number,
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("workout_logs").insert({
    user_id: ctx.userId,
    duration_minutes: durationMinutes,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true };
}

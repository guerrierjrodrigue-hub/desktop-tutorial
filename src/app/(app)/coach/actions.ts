"use server";

import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/** Remember which coach persona the signed-in user last talked to. */
export async function setActiveCoach(coachId: string): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("user_preferences")
    .upsert({ user_id: ctx.userId, active_coach: coachId }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

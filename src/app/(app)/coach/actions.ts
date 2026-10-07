"use server";

import { revalidatePath } from "next/cache";
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

/** Delete the signed-in user's saved conversation with one coach. */
export async function clearCoachConversation(coachId: string): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("coach_messages")
    .delete()
    .eq("user_id", ctx.userId)
    .eq("coach_id", coachId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/coach/${coachId}`);
  return { ok: true };
}

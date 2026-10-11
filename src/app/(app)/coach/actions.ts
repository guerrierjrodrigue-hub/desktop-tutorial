"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

const coachIdSchema = z.string().trim().min(1).max(50);

/** Remember which coach persona the signed-in user last talked to. */
export async function setActiveCoach(coachId: string): Promise<ActionResult> {
  const check = validate(coachIdSchema, coachId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("user_preferences")
    .upsert({ user_id: ctx.userId, active_coach: check.data }, { onConflict: "user_id" });
  if (error) return logAndFail(error);

  return { ok: true };
}

/** Delete the signed-in user's saved conversation with one coach. */
export async function clearCoachConversation(coachId: string): Promise<ActionResult> {
  const check = validate(coachIdSchema, coachId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("coach_messages")
    .delete()
    .eq("user_id", ctx.userId)
    .eq("coach_id", check.data);
  if (error) return logAndFail(error);

  revalidatePath(`/coach/${check.data}`);
  return { ok: true };
}

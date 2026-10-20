"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { XP_REWARDS } from "@/lib/gamification";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

const prayerSchema = z.object({
  title: z.string().trim().min(1, "errors.titleRequired").max(200, "errors.tooLong"),
  body: z.string().trim().max(2000, "errors.tooLong"),
});

const advancePlanSchema = z.object({
  planId: z.string().uuid(),
  completedDays: z.number().int().min(0).max(1000),
});

const setAnsweredSchema = z.object({
  id: z.string().uuid(),
  answered: z.boolean(),
});

/** Create a prayer request for the signed-in user. */
export async function createPrayerRequest(input: {
  title: string;
  body: string;
}): Promise<ActionResult> {
  const check = validate(prayerSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { data, error } = await ctx.supabase
    .from("prayer_requests")
    .insert({
      user_id: ctx.userId,
      title: check.data.title,
      body: check.data.body,
    })
    .select("id")
    .single();
  if (error) return logAndFail(error);

  revalidatePath("/spiritual");
  // Return the real id so the client swaps its temp id and a toggle right after
  // adding targets the real prayer row instead of a phantom one.
  return { ok: true, xp: XP_REWARDS.prayer, id: (data as { id: string }).id };
}

/** Advance a reading plan by one day for the signed-in user (idempotent-ish). */
export async function advanceReadingPlan(
  planId: string,
  completedDays: number,
): Promise<ActionResult> {
  const check = validate(advancePlanSchema, { planId, completedDays });
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("reading_progress").upsert(
    {
      user_id: ctx.userId,
      reading_plan_id: check.data.planId,
      completed_days: check.data.completedDays,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,reading_plan_id" },
  );
  if (error) return logAndFail(error);

  revalidatePath("/spiritual");
  return { ok: true, xp: XP_REWARDS.reading_day };
}

/** Mark a prayer request answered / unanswered. */
export async function setPrayerAnswered(
  id: string,
  answered: boolean,
): Promise<ActionResult> {
  // Demo mode first: seed ids aren't real uuids, so returning the no-op success
  // before validation keeps optimistic UI intact instead of a spurious failure.
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(setAnsweredSchema, { id, answered });
  if (!check.ok) return check.result;

  const { data, error } = await ctx.supabase
    .from("prayer_requests")
    .update({ answered: check.data.answered })
    .eq("id", check.data.id)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return logAndFail(error);
  // No row matched (phantom/temp id, or not the owner's) — surface it instead of
  // a silent success, so the client can roll back the optimistic toggle.
  if (!data || data.length === 0) return { ok: false, error: "errors.writeNoRows" };

  revalidatePath("/spiritual");
  return { ok: true };
}

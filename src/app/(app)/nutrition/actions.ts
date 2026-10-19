"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";
import { nextWaterMl, isValidWaterDelta } from "@/lib/hydration";

const macro = z.number().finite().min(0).max(100000);
const foodLogSchema = z.object({
  name: z.string().trim().min(1, "errors.foodNameRequired").max(120, "errors.tooLong"),
  calories: macro,
  proteinG: macro,
  carbsG: macro.default(0),
  fatG: macro.default(0),
});

/** Log a food entry for the signed-in user for today. */
export async function createFoodLog(input: {
  name: string;
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
}): Promise<ActionResult> {
  const check = validate(foodLogSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("food_logs").insert({
    user_id: ctx.userId,
    name: check.data.name,
    calories: Math.round(check.data.calories),
    protein_g: Math.round(check.data.proteinG),
    carbs_g: Math.round(check.data.carbsG ?? 0),
    fat_g: Math.round(check.data.fatG ?? 0),
    log_date: getUserToday(await getUserTimezone()),
  });
  if (error) return logAndFail(error);

  revalidatePath("/nutrition");
  return { ok: true };
}

const updateFoodLogSchema = foodLogSchema.extend({ id: z.string().uuid("errors.invalidId") });

/** Edit one of the signed-in user's food log entries (owner-only via RLS). */
export async function updateFoodLog(input: {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
}): Promise<ActionResult> {
  const check = validate(updateFoodLogSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("food_logs")
    .update({
      name: check.data.name,
      calories: Math.round(check.data.calories),
      protein_g: Math.round(check.data.proteinG),
      carbs_g: Math.round(check.data.carbsG ?? 0),
      fat_g: Math.round(check.data.fatG ?? 0),
    })
    .eq("id", check.data.id)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/nutrition");
  return { ok: true };
}

/** Delete one of the signed-in user's food log entries (owner-only via RLS). */
export async function deleteFoodLog(id: string): Promise<ActionResult> {
  const check = validate(z.object({ id: z.string().uuid("errors.invalidId") }), { id });
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("food_logs")
    .delete()
    .eq("id", check.data.id)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/nutrition");
  return { ok: true };
}

/**
 * Adjust today's hydration total (ml) for the signed-in user. Positive to add
 * a glass, negative to undo. Stored on the existing `daily_stats` row so the
 * dashboard activity ring and the nutrition page stay in sync.
 */
export async function addWater(amountMl: number): Promise<ActionResult> {
  if (!isValidWaterDelta(amountMl)) {
    return { ok: false, error: "errors.amountInvalid" };
  }
  const amount = Math.round(amountMl);

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const today = getUserToday(await getUserTimezone());

  const { data } = await ctx.supabase
    .from("daily_stats")
    .select("water_ml")
    .eq("user_id", ctx.userId)
    .eq("stat_date", today)
    .maybeSingle();

  const current = (data as { water_ml: number } | null)?.water_ml ?? 0;
  const next = nextWaterMl(current, amount);

  const { error } = await ctx.supabase
    .from("daily_stats")
    .upsert(
      { user_id: ctx.userId, stat_date: today, water_ml: next },
      { onConflict: "user_id,stat_date" },
    );
  if (error) return logAndFail(error);

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  return { ok: true };
}

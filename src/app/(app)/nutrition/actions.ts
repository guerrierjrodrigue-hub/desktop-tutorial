"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/** Log a food entry for the signed-in user for today. */
export async function createFoodLog(input: {
  name: string;
  calories: number;
  proteinG: number;
}): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("food_logs").insert({
    user_id: ctx.userId,
    name,
    calories: Math.max(0, Math.round(input.calories) || 0),
    protein_g: Math.max(0, Math.round(input.proteinG) || 0),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/nutrition");
  return { ok: true };
}

/** New hydration total after a delta, never negative. Pure — unit-tested. */
export function nextWaterMl(currentMl: number, deltaMl: number): number {
  return Math.max(0, currentMl + Math.round(deltaMl));
}

/**
 * Adjust today's hydration total (ml) for the signed-in user. Positive to add
 * a glass, negative to undo. Stored on the existing `daily_stats` row so the
 * dashboard activity ring and the nutrition page stay in sync.
 */
export async function addWater(amountMl: number): Promise<ActionResult> {
  const amount = Math.round(amountMl);
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: "Invalid amount." };
  }

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const today = new Date().toISOString().slice(0, 10);

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
  if (error) return { ok: false, error: error.message };

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  return { ok: true };
}

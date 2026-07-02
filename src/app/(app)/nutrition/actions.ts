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

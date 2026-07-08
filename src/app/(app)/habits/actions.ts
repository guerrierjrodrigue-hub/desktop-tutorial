"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/** Create a custom habit for the signed-in user. */
export async function createHabit(label: string, icon: string): Promise<ActionResult> {
  if (!label.trim()) return { ok: false, error: "A habit name is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("habits").insert({
    user_id: ctx.userId,
    label: label.trim(),
    icon,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true };
}

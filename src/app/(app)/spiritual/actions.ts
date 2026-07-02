"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/** Create a prayer request for the signed-in user. */
export async function createPrayerRequest(input: {
  title: string;
  body: string;
}): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "A title is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("prayer_requests").insert({
    user_id: ctx.userId,
    title,
    body: input.body.trim(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/spiritual");
  return { ok: true };
}

/** Mark a prayer request answered / unanswered. */
export async function setPrayerAnswered(
  id: string,
  answered: boolean,
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("prayer_requests")
    .update({ answered })
    .eq("id", id)
    .eq("user_id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/spiritual");
  return { ok: true };
}

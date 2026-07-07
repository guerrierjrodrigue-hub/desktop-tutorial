"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

/** Create a journal entry for the signed-in user. */
export async function createJournalEntry(input: {
  title: string;
  body: string;
}): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "A title is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("journal_entries").insert({
    user_id: ctx.userId,
    title,
    body: input.body.trim(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/journal");
  return { ok: true };
}

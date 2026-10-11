"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { XP_REWARDS } from "@/lib/gamification";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

const journalSchema = z.object({
  title: z.string().trim().min(1, "errors.titleRequired").max(200, "errors.tooLong"),
  body: z.string().trim().max(10000, "errors.tooLong"),
});

/** Create a journal entry for the signed-in user. */
export async function createJournalEntry(input: {
  title: string;
  body: string;
}): Promise<ActionResult> {
  const check = validate(journalSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("journal_entries").insert({
    user_id: ctx.userId,
    title: check.data.title,
    body: check.data.body,
  });
  if (error) return logAndFail(error);

  revalidatePath("/journal");
  return { ok: true, xp: XP_REWARDS.journal };
}

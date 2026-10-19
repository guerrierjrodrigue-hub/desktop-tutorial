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

const updateJournalSchema = journalSchema.extend({ id: z.string().uuid("errors.invalidId") });

/** Edit one of the signed-in user's journal entries (owner-only via RLS). */
export async function updateJournalEntry(input: {
  id: string;
  title: string;
  body: string;
}): Promise<ActionResult> {
  const check = validate(updateJournalSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("journal_entries")
    .update({ title: check.data.title, body: check.data.body })
    .eq("id", check.data.id)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/journal");
  return { ok: true };
}

/** Delete one of the signed-in user's journal entries (owner-only via RLS). */
export async function deleteJournalEntry(id: string): Promise<ActionResult> {
  const check = validate(z.object({ id: z.string().uuid("errors.invalidId") }), { id });
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("journal_entries")
    .delete()
    .eq("id", check.data.id)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/journal");
  return { ok: true };
}

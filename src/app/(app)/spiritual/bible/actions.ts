"use server";

import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

export interface VerseRef {
  translation: string;
  book: string;
  chapter: number;
  verse: number;
}

const verseRefSchema = z.object({
  translation: z.string().trim().min(1).max(20),
  book: z.string().trim().min(1).max(40),
  chapter: z.number().int().min(1).max(200),
  verse: z.number().int().min(1).max(200),
});

const markSchema = z.object({
  ref: verseRefSchema,
  kind: z.enum(["bookmark", "highlight"]),
});

const memorizeSchema = z.object({
  reference: z.string().trim().min(1, "errors.verseRequired").max(60),
  text: z.string().trim().min(1, "errors.verseRequired").max(2000, "errors.tooLong"),
});

const readingDaySchema = z.object({
  planId: z.string().uuid(),
  day: z.number().int().min(1).max(1000),
});

/**
 * Toggle a per-verse bookmark or highlight. Inserts the mark if absent, removes
 * it if present. Returns { ok, active } so the client knows the new state.
 */
export async function toggleBibleMark(
  ref: VerseRef,
  kind: "bookmark" | "highlight",
): Promise<ActionResult & { active?: boolean }> {
  const check = validate(markSchema, { ref, kind });
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return { ...demoOk, active: true };

  const match = {
    user_id: ctx.userId,
    translation: check.data.ref.translation,
    book: check.data.ref.book,
    chapter: check.data.ref.chapter,
    verse: check.data.ref.verse,
    kind: check.data.kind,
  };

  const { data: existing } = await ctx.supabase
    .from("bible_marks")
    .select("id")
    .match(match)
    .maybeSingle();

  if (existing) {
    const { error } = await ctx.supabase.from("bible_marks").delete().eq("id", existing.id);
    if (error) return logAndFail(error);
    return { ok: true, active: false };
  }

  const { error } = await ctx.supabase.from("bible_marks").insert(match);
  if (error) return logAndFail(error);
  return { ok: true, active: true };
}

/** Add a verse to the user's memory list (feeds the memorization feature). */
export async function memorizeVerse(input: {
  reference: string;
  text: string;
}): Promise<ActionResult> {
  const check = validate(memorizeSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("memory_verses").insert({
    user_id: ctx.userId,
    reference: check.data.reference,
    text: check.data.text,
    mastery: 0,
  });
  if (error) return logAndFail(error);
  return { ok: true };
}

/** Mark a reading-plan day as read (progress = the day just read). */
export async function markReadingDay(planId: string, day: number): Promise<ActionResult> {
  // Demo mode first: seed ids aren't real uuids, so returning the no-op success
  // before validation keeps optimistic UI intact instead of a spurious failure.
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(readingDaySchema, { planId, day });
  if (!check.ok) return check.result;

  const { data: existing } = await ctx.supabase
    .from("reading_progress")
    .select("completed_days")
    .match({ user_id: ctx.userId, reading_plan_id: check.data.planId })
    .maybeSingle();

  const completed = Math.max(existing?.completed_days ?? 0, check.data.day);

  const { error } = await ctx.supabase.from("reading_progress").upsert(
    {
      user_id: ctx.userId,
      reading_plan_id: check.data.planId,
      completed_days: completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,reading_plan_id" },
  );
  if (error) return logAndFail(error);
  return { ok: true };
}

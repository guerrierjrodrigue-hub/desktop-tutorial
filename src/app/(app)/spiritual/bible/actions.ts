"use server";

import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

export interface VerseRef {
  translation: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Toggle a per-verse bookmark or highlight. Inserts the mark if absent, removes
 * it if present. Returns { ok, active } so the client knows the new state.
 */
export async function toggleBibleMark(
  ref: VerseRef,
  kind: "bookmark" | "highlight",
): Promise<ActionResult & { active?: boolean }> {
  const ctx = await getAuthedContext();
  if (!ctx) return { ...demoOk, active: true };

  const match = {
    user_id: ctx.userId,
    translation: ref.translation,
    book: ref.book,
    chapter: ref.chapter,
    verse: ref.verse,
    kind,
  };

  const { data: existing } = await ctx.supabase
    .from("bible_marks")
    .select("id")
    .match(match)
    .maybeSingle();

  if (existing) {
    const { error } = await ctx.supabase.from("bible_marks").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, active: false };
  }

  const { error } = await ctx.supabase.from("bible_marks").insert(match);
  if (error) return { ok: false, error: error.message };
  return { ok: true, active: true };
}

/** Add a verse to the user's memory list (feeds the memorization feature). */
export async function memorizeVerse(input: {
  reference: string;
  text: string;
}): Promise<ActionResult> {
  const reference = input.reference.trim();
  const text = input.text.trim();
  if (!reference || !text) return { ok: false, error: "A verse is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("memory_verses").insert({
    user_id: ctx.userId,
    reference,
    text,
    mastery: 0,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mark a reading-plan day as read (progress = the day just read). */
export async function markReadingDay(planId: string, day: number): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { data: existing } = await ctx.supabase
    .from("reading_progress")
    .select("completed_days")
    .match({ user_id: ctx.userId, reading_plan_id: planId })
    .maybeSingle();

  const completed = Math.max(existing?.completed_days ?? 0, Math.max(1, Math.floor(day)));

  const { error } = await ctx.supabase.from("reading_progress").upsert(
    {
      user_id: ctx.userId,
      reading_plan_id: planId,
      completed_days: completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,reading_plan_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

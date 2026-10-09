"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday, addDaysToDateStr } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { resolveReferrer } from "@/lib/referral";
import { type ActionResult, demoOk } from "@/lib/actions/result";

export interface CreateChallengeInput {
  title: string;
  description: string;
  type: "personal" | "friends" | "church";
  endsInDays: number;
}

/** Create a challenge and automatically join it as its first participant. */
export async function createChallenge(input: CreateChallengeInput): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "A title is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const today = getUserToday(await getUserTimezone());
  const endsAt = addDaysToDateStr(today, Math.max(1, input.endsInDays));

  const { data, error } = await ctx.supabase
    .from("challenges")
    .insert({
      title,
      description: input.description.trim(),
      type: input.type,
      ends_at: endsAt,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await ctx.supabase.from("challenge_participants").insert({
    challenge_id: data.id,
    user_id: ctx.userId,
    progress: 0,
    points: 0,
  });

  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Join an existing challenge. The user's own window starts now (their
 * `joined_at`), so "days left" is computed from this moment onward.
 * Idempotent — re-joining is a no-op.
 */
export async function joinChallenge(
  challengeId: string,
  referredBy?: string | null,
): Promise<ActionResult> {
  if (!challengeId) return { ok: false, error: "A challenge is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // Credit the referrer only when it's a valid, different user.
  const referrer = resolveReferrer(referredBy, ctx.userId);

  const { error } = await ctx.supabase
    .from("challenge_participants")
    .upsert(
      { challenge_id: challengeId, user_id: ctx.userId, progress: 0, points: 0, referred_by: referrer },
      { onConflict: "challenge_id,user_id", ignoreDuplicates: true },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  return { ok: true };
}

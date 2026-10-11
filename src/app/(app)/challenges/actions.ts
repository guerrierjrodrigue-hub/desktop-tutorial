"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday, addDaysToDateStr } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { resolveReferrer } from "@/lib/referral";
import { XP_REWARDS } from "@/lib/gamification";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

export interface CreateChallengeInput {
  title: string;
  description: string;
  type: "personal" | "friends" | "church";
  endsInDays: number;
}

const createChallengeSchema = z.object({
  title: z.string().trim().min(1, "errors.challengeTitleRequired").max(120, "errors.tooLong"),
  description: z.string().trim().max(500, "errors.tooLong"),
  type: z.enum(["personal", "friends", "church"]),
  endsInDays: z.number().int().min(1).max(365),
});

/** Create a challenge and automatically join it as its first participant. */
export async function createChallenge(input: CreateChallengeInput): Promise<ActionResult> {
  const check = validate(createChallengeSchema, input);
  if (!check.ok) return check.result;
  const data_in = check.data;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const today = getUserToday(await getUserTimezone());
  const endsAt = addDaysToDateStr(today, data_in.endsInDays);

  const { data, error } = await ctx.supabase
    .from("challenges")
    .insert({
      title: data_in.title,
      description: data_in.description,
      type: data_in.type,
      ends_at: endsAt,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error) return logAndFail(error);

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
 * Leave a challenge the user has joined: remove their own participant row.
 * Owner-only RLS (auth.uid() = user_id) already restricts the delete to the
 * caller's row; the explicit user_id filter is belt-and-suspenders. Participant
 * counts and the leaderboard are derived from this table, so they update on the
 * revalidated pages. Idempotent — leaving when not joined is a no-op.
 */
export async function leaveChallenge(challengeId: string): Promise<ActionResult> {
  const check = validate(z.string().uuid(), challengeId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("challenge_participants")
    .delete()
    .eq("challenge_id", check.data)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

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
  const check = validate(z.string().uuid(), challengeId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // Credit the referrer only when it's a valid, different user.
  const referrer = resolveReferrer(referredBy, ctx.userId);

  const { error } = await ctx.supabase
    .from("challenge_participants")
    .upsert(
      { challenge_id: check.data, user_id: ctx.userId, progress: 0, points: 0, referred_by: referrer },
      { onConflict: "challenge_id,user_id", ignoreDuplicates: true },
    );
  if (error) return logAndFail(error);

  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  return { ok: true, xp: XP_REWARDS.challenge_join };
}

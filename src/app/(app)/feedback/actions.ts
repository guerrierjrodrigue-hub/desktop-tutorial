"use server";

import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";
import { feedbackSchema, type FeedbackInput } from "@/lib/feedback";

/** Store one beta feedback entry for the signed-in user (owner-only via RLS). */
export async function sendFeedback(input: FeedbackInput): Promise<ActionResult> {
  const check = validate(feedbackSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("feedback").insert({
    user_id: ctx.userId,
    kind: check.data.kind,
    message: check.data.message,
    page: check.data.page ?? null,
    user_agent: check.data.userAgent ?? null,
  });
  if (error) return logAndFail(error);

  return { ok: true };
}

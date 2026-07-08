"use server";

import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

export interface OnboardingInput {
  goal: string;
  identities: string[];
}

/** Save the primary goal + identities chosen during onboarding. */
export async function saveOnboarding(input: OnboardingInput): Promise<ActionResult> {
  if (!input.identities.length) {
    return { ok: false, error: "Choose at least one identity." };
  }

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      primary_goal: input.goal,
      identities: input.identities,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

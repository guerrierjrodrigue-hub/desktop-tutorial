"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

export interface ProfileUpdateInput {
  name: string;
  bio: string;
  heightCm?: number;
  weightKg?: number;
  goal: string;
  church: string;
  favoriteVerse: string;
}

/** Update the signed-in user's profile details. */
export async function updateProfileAction(
  input: ProfileUpdateInput,
): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      name: input.name.trim(),
      bio: input.bio.trim() || null,
      height_cm: input.heightCm ?? null,
      weight_kg: input.weightKg ?? null,
      goal: input.goal.trim() || null,
      church: input.church.trim() || null,
      favorite_verse: input.favoriteVerse.trim() || null,
    })
    .eq("id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}

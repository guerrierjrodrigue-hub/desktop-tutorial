"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

export interface ProfileUpdateInput {
  name: string;
  bio: string;
  heightCm?: number;
  weightKg?: number;
  goal: string;
  church: string;
  favoriteVerse: string;
  level?: "beginner" | "intermediate" | "advanced";
  equipment?: string;
  trainingDays?: number;
  reminderTime?: string;
}

const profileSchema = z.object({
  name: z.string().trim().min(1, "errors.nameRequired").max(80, "errors.tooLong"),
  bio: z.string().trim().max(500, "errors.tooLong"),
  heightCm: z.number().finite().min(50).max(300).optional(),
  weightKg: z.number().finite().min(20).max(500).optional(),
  goal: z.string().trim().max(200, "errors.tooLong"),
  church: z.string().trim().max(120, "errors.tooLong"),
  favoriteVerse: z.string().trim().max(200, "errors.tooLong"),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  equipment: z.string().trim().max(40).optional(),
  trainingDays: z.number().int().min(1).max(7).optional(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "errors.validation")
    .optional(),
});

/** Set the signed-in user's primary activity (strength / running / both). */
export async function setPrimaryActivity(
  value: "strength" | "running" | "both",
): Promise<ActionResult> {
  const check = validate(z.enum(["strength", "running", "both"]), value);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ primary_activity: check.data })
    .eq("id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Update the signed-in user's profile details. */
export async function updateProfileAction(
  input: ProfileUpdateInput,
): Promise<ActionResult> {
  const check = validate(profileSchema, input);
  if (!check.ok) return check.result;
  const data = check.data;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      name: data.name,
      bio: data.bio || null,
      height_cm: data.heightCm ?? null,
      weight_kg: data.weightKg ?? null,
      goal: data.goal || null,
      church: data.church || null,
      favorite_verse: data.favoriteVerse || null,
      ...(data.level ? { level: data.level } : {}),
      ...(data.equipment ? { equipment: data.equipment } : {}),
      ...(data.trainingDays ? { training_days: data.trainingDays } : {}),
      ...(data.reminderTime ? { reminder_time: data.reminderTime } : {}),
    })
    .eq("id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/profile");
  return { ok: true };
}

"use server";

import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

const onboardingSchema = z.object({
  goals: z.array(z.string().min(1)).min(1, "errors.goalRequired").max(20),
  identities: z.array(z.string().min(1)).min(1, "errors.identityRequired").max(20),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  equipment: z.enum(["none", "home", "gym"]).optional(),
  trainingDays: z.number().int().min(1).max(7).optional(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  heightCm: z.number().finite().min(50).max(300).nullable().optional(),
  weightKg: z.number().finite().min(20).max(500).nullable().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export interface OnboardingInput {
  goals: string[];
  identities: string[];
  level?: "beginner" | "intermediate" | "advanced";
  equipment?: "none" | "home" | "gym";
  trainingDays?: number;
  reminderTime?: string;
  // Optional metrics — the user may skip them.
  heightCm?: number | null;
  weightKg?: number | null;
  birthDate?: string | null;
}

/** Minimum age (Loi 25 / Terms). */
const MIN_AGE = 16;

function ageFrom(birthDate: string): number {
  const born = new Date(`${birthDate}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const m = now.getUTCMonth() - born.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < born.getUTCDate())) age--;
  return age;
}

/** Save goals, identities, and the training profile chosen during onboarding. */
export async function saveOnboarding(input: OnboardingInput): Promise<ActionResult> {
  const check = validate(onboardingSchema, input);
  if (!check.ok) return check.result;

  if (input.birthDate) {
    const age = ageFrom(input.birthDate);
    // "age" is a control sentinel the wizard handles with its own localized UI.
    if (Number.isNaN(age) || age < MIN_AGE) {
      return { ok: false, error: "age" };
    }
  }

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // Only write fields that were provided; skipped optional metrics stay null.
  const update: Record<string, unknown> = {
    primary_goals: input.goals,
    identities: input.identities,
    onboarded_at: new Date().toISOString(),
  };
  if (input.level) update.level = input.level;
  if (input.equipment) update.equipment = input.equipment;
  if (input.trainingDays) update.training_days = input.trainingDays;
  if (input.reminderTime) update.reminder_time = input.reminderTime;
  if (input.heightCm) update.height_cm = input.heightCm;
  if (input.weightKg) update.weight_kg = input.weightKg;
  if (input.birthDate) update.birth_date = input.birthDate;

  const { error } = await ctx.supabase.from("profiles").update(update).eq("id", ctx.userId);
  if (error) return logAndFail(error);

  return { ok: true };
}

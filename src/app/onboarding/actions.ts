"use server";

import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

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
  if (!input.goals.length) {
    return { ok: false, error: "Choose at least one goal." };
  }
  if (!input.identities.length) {
    return { ok: false, error: "Choose at least one identity." };
  }
  if (input.birthDate) {
    const age = ageFrom(input.birthDate);
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
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

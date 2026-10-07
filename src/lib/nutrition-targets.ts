/**
 * Personalized daily nutrition targets — a transparent estimate, never medical
 * advice. Uses the Mifflin–St Jeor equation for BMR, an activity factor from
 * planned training days, and a goal adjustment that never allows an aggressive
 * deficit. Falls back to clearly-marked defaults when inputs are missing. Pure
 * and unit-tested.
 */

export interface TargetInput {
  weightKg?: number;
  heightCm?: number;
  birthDate?: string; // YYYY-MM-DD
  gender?: string; // "male" | "female" | other/unknown
  trainingDays?: number; // per week
  goals?: string[]; // primary goal ids
}

export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
  /** True when inputs were insufficient and generic defaults were used. */
  isDefault: boolean;
}

/** Clearly-marked generic defaults (also what demo mode shows). */
export const DEFAULT_TARGETS: NutritionTargets = {
  calories: 2400,
  proteinG: 180,
  carbsG: 240,
  fatG: 70,
  waterMl: 3000,
  isDefault: true,
};

function ageFrom(birthDate: string, now: Date): number | null {
  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return null;
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const m = now.getUTCMonth() - born.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < born.getUTCDate())) age--;
  return age;
}

function activityFactor(trainingDays?: number): number {
  if (trainingDays == null) return 1.375;
  if (trainingDays <= 1) return 1.2;
  if (trainingDays <= 3) return 1.375;
  if (trainingDays <= 5) return 1.55;
  return 1.725;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

export function computeNutritionTargets(
  input: TargetInput,
  now: Date = new Date(),
): NutritionTargets {
  const { weightKg, heightCm, birthDate, gender, trainingDays, goals = [] } = input;
  const age = birthDate ? ageFrom(birthDate, now) : null;

  if (!weightKg || !heightCm || age == null) {
    return { ...DEFAULT_TARGETS };
  }

  const s = gender === "male" ? 5 : gender === "female" ? -161 : -78;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  const tdee = bmr * activityFactor(trainingDays);

  // Goal adjustment — only a mild deficit/surplus; never aggressive.
  let calories = tdee;
  if (goals.includes("lose-weight")) {
    calories = Math.max(tdee * 0.85, bmr * 1.1, 1500); // cap the deficit, hard floor
  } else if (goals.includes("build-muscle")) {
    calories = tdee * 1.1;
  }
  calories = round10(calories);

  const perKgProtein = goals.includes("build-muscle") ? 2.0 : 1.6;
  const proteinG = Math.round(perKgProtein * weightKg);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  const waterMl = round10(weightKg * 35);

  return { calories, proteinG, carbsG, fatG, waterMl, isDefault: false };
}

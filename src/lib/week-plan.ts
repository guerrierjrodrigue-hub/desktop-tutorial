import type { Program, ProgramCategory, FitnessLevel } from "@/types";

/** Goal id → preferred program category (mirrors the recommendations engine). */
const GOAL_CATEGORY: Record<string, ProgramCategory> = {
  "build-muscle": "strength",
  "lose-weight": "fat-loss",
  "improve-endurance": "running",
  "live-healthier": "walking",
  "build-habits": "bodyweight",
  "increase-productivity": "mobility",
};

/** Categories that need no gym equipment. */
const NO_EQUIPMENT: ProgramCategory[] = ["bodyweight", "walking", "running", "mobility", "hiit"];

export interface WeekPlanInput {
  level?: FitnessLevel;
  equipment?: string; // "none" | "home" | "gym"
  trainingDays?: number;
  goals?: string[];
}

export interface WeekPlan {
  program: Omit<Program, "schedule"> | null;
  /** 7 slots, Monday→Sunday. */
  days: ("train" | "rest")[];
  trainingDays: number;
}

/** Spread `n` training days as evenly as possible across a 7-day week. */
export function spreadTrainingDays(n: number): ("train" | "rest")[] {
  const count = Math.max(0, Math.min(7, Math.round(n)));
  const set = new Set<number>();
  for (let k = 0; k < count; k++) set.add(Math.floor((k * 7) / count));
  return Array.from({ length: 7 }, (_, i) => (set.has(i) ? "train" : "rest"));
}

/**
 * Choose a program and a weekly cadence from the user's level, equipment, and
 * goals — a small, explainable rule, not an ML planner.
 */
export function buildWeekPlan(
  programs: Omit<Program, "schedule">[],
  input: WeekPlanInput,
): WeekPlan {
  const trainingDays = input.trainingDays ?? 3;
  const days = spreadTrainingDays(trainingDays);

  if (!programs.length) return { program: null, days, trainingDays };

  // Restrict to equipment-appropriate programs when the user has none.
  let candidates = programs;
  if (input.equipment === "none") {
    const noEquip = programs.filter((p) => NO_EQUIPMENT.includes(p.category));
    if (noEquip.length) candidates = noEquip;
  }

  // Prefer a program matching a stated goal's category.
  const goalCategory = (input.goals ?? [])
    .map((g) => GOAL_CATEGORY[g])
    .find((c): c is ProgramCategory => Boolean(c));
  const byGoal = goalCategory ? candidates.filter((p) => p.category === goalCategory) : [];
  const pool = byGoal.length ? byGoal : candidates;

  // Within the pool, prefer the user's level, else take the first.
  const program = pool.find((p) => p.level === input.level) ?? pool[0];

  return { program, days, trainingDays };
}

import { clamp, levelFromXp } from "@/lib/utils";
import type { Habit } from "@/types";

export interface Quest {
  id: string;
  label: string;
  done: boolean;
  xp: number;
}

/**
 * Three quests derived live from today's habit/workout/devotional state —
 * not stored. Recomputed on every render, so there's nothing to keep in sync.
 */
export function getDailyQuests(
  habits: Habit[],
  workoutDoneToday: boolean,
  devotionalDoneToday: boolean,
): Quest[] {
  const habitsDone = habits.filter((h) => h.done).length;
  const habitTarget = Math.min(3, habits.length || 1);

  return [
    {
      id: "habits",
      label: `Complete ${habitTarget} habit${habitTarget > 1 ? "s" : ""} today`,
      done: habitsDone >= habitTarget,
      xp: 30,
    },
    {
      id: "workout",
      label: "Finish today's workout",
      done: workoutDoneToday,
      xp: 50,
    },
    {
      id: "devotional",
      label: "Complete today's devotional",
      done: devotionalDoneToday,
      xp: 20,
    },
  ];
}

export interface TransformationScore {
  score: number;
  tier: string;
}

const TIERS: { min: number; label: string }[] = [
  { min: 75, label: "Transformed" },
  { min: 40, label: "Disciplined" },
  { min: 0, label: "Building Momentum" },
];

/**
 * A 0-100 composite of streak consistency, level progress, and today's habit
 * completion ratio — a lightweight, explainable stand-in for a real
 * historical trend (see the daily_stats table for a future upgrade path).
 */
export function getTransformationScore(
  user: { xp: number; streak: number },
  habits: Habit[],
): TransformationScore {
  const { progress } = levelFromXp(user.xp);
  const streakScore = clamp(user.streak / 30, 0, 1);
  const habitRatio = habits.length ? habits.filter((h) => h.done).length / habits.length : 0;

  const score = Math.round((streakScore * 0.4 + progress * 0.3 + habitRatio * 0.3) * 100);
  const tier = TIERS.find((t) => score >= t.min)!.label;

  return { score, tier };
}

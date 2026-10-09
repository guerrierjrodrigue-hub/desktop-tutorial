import { clamp, levelFromXp } from "@/lib/utils";
import type { Habit } from "@/types";

export interface Quest {
  id: string;
  /** English label; the UI prefers a localized string built from `id`/`target`. */
  label: string;
  /** For the habits quest: how many habits count toward "done" (for i18n labels). */
  target?: number;
  done: boolean;
  xp: number;
}

export interface DailyQuestOptions {
  /** Today is a planned rest day in the user's 7-day plan. */
  isRestDay?: boolean;
  /** Recovery counts as done (a recovery habit, hydration, or a session anyway). */
  recoveryDoneToday?: boolean;
}

/**
 * Three quests derived live from today's habit/workout/devotional state —
 * not stored. Recomputed on every render, so there's nothing to keep in sync.
 *
 * On a planned rest day the workout quest is swapped for a recovery quest, so
 * resting is rewarded rather than looking like a missed workout.
 */
export function getDailyQuests(
  habits: Habit[],
  workoutDoneToday: boolean,
  devotionalDoneToday: boolean,
  options: DailyQuestOptions = {},
): Quest[] {
  const habitsDone = habits.filter((h) => h.done).length;
  const habitTarget = Math.min(3, habits.length || 1);

  const trainingQuest: Quest = options.isRestDay
    ? {
        id: "recovery",
        label: "Recover: stretch, hydrate, or pray",
        done: options.recoveryDoneToday ?? false,
        xp: 50,
      }
    : {
        id: "workout",
        label: "Finish today's workout",
        done: workoutDoneToday,
        xp: 50,
      };

  return [
    {
      id: "habits",
      label: `Complete ${habitTarget} habit${habitTarget > 1 ? "s" : ""} today`,
      target: habitTarget,
      done: habitsDone >= habitTarget,
      xp: 30,
    },
    trainingQuest,
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
  /** English tier label. */
  tier: string;
  /** Stable id so the UI can show a localized tier name. */
  tierId: "transformed" | "disciplined" | "momentum";
}

const TIERS: { min: number; label: string; id: TransformationScore["tierId"] }[] = [
  { min: 75, label: "Transformed", id: "transformed" },
  { min: 40, label: "Disciplined", id: "disciplined" },
  { min: 0, label: "Building Momentum", id: "momentum" },
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
  const matched = TIERS.find((t) => score >= t.min)!;

  return { score, tier: matched.label, tierId: matched.id };
}

/**
 * XP rewards per action type. These MIRROR the amounts awarded server-side by
 * the database triggers (migration 0024) — the DB is the source of truth; these
 * constants are only used to show the "+N XP" confirmation to the user after an
 * action. XP can never be set by the client.
 */
export const XP_REWARDS = {
  habit: 10,
  workout: 30,
  journal: 15,
  prayer: 10,
  reading_day: 10,
  challenge_join: 20,
  meditation: 10,
} as const;

export type XpType = keyof typeof XP_REWARDS;

import { computeStreak } from "@/lib/habit-streak";
import {
  spreadTrainingDays,
  mondayIndexFromDateStr,
  isRestWeekday,
} from "@/lib/week-plan";

/**
 * Global streak: consecutive days (ending today, or yesterday if today has no
 * event yet) with at least one XP event. A planned rest day — derived from the
 * user's weekly training cadence — is skipped over, so it never breaks the
 * streak. Pure and timezone-correct (works on YYYY-MM-DD strings).
 */
export function globalStreak(
  eventDays: string[],
  trainingDays: number,
  todayStr: string,
): number {
  const pattern = spreadTrainingDays(trainingDays || 3);
  const isRest = (d: string) => isRestWeekday(pattern, mondayIndexFromDateStr(d));
  return computeStreak(new Set(eventDays), todayStr, isRest);
}

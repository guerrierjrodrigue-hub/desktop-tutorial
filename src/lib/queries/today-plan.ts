import { getCurrentUser } from "@/lib/queries/profile";
import { getPrograms } from "@/lib/queries/programs";
import { buildWeekPlan, mondayIndexFromDateStr, type WeekPlan } from "@/lib/week-plan";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import type { LocaleCode } from "@/i18n/locales";

export interface TodayPlan {
  /** Today is a rest day in the user's 7-day plan. */
  isRestDay: boolean;
  /** Monday-based weekday index (Mon=0 … Sun=6). */
  weekdayIndex: number;
  /** The recommended program for the week (may be null when no programs exist). */
  program: WeekPlan["program"];
  trainingDays: number;
}

/**
 * Today's position in the user's weekly plan, shared by the dashboard cards and
 * quests so the "today's workout" card, the daily quest and the habit all agree
 * on whether today is a training or a rest day.
 */
export async function getTodayPlan(locale: LocaleCode = "en"): Promise<TodayPlan> {
  const [user, programs] = await Promise.all([getCurrentUser(), getPrograms(locale)]);
  const plan = buildWeekPlan(programs, {
    level: user.level,
    equipment: user.equipment,
    trainingDays: user.trainingDays,
    goals: user.primaryGoals,
  });
  const weekdayIndex = mondayIndexFromDateStr(getUserToday(await getUserTimezone()));
  return {
    isRestDay: plan.days[weekdayIndex] === "rest",
    weekdayIndex,
    program: plan.program,
    trainingDays: plan.trainingDays,
  };
}

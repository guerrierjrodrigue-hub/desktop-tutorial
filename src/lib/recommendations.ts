import type { Dictionary } from "@/i18n/dictionaries/en";
import { PRIMARY_GOAL_OPTIONS } from "@/lib/personalization";
import { buildWeekPlan } from "@/lib/week-plan";
import type { Habit, Program, FitnessLevel } from "@/types";

export interface Recommendation {
  id: string;
  label: string;
  description: string;
  href: string;
}

/**
 * Small, explainable rule-based recommendations — not a behavioral/ML
 * engine. The suggested program now comes from the same plan builder as the
 * dashboard's 7-day plan, so it respects the user's level, equipment and
 * goals. Combined with today's habit completion into up to 3 suggestions.
 */
export function getRecommendations(
  user: {
    primaryGoals: string[];
    identities: string[];
    level?: FitnessLevel;
    equipment?: string;
    trainingDays?: number;
  },
  programs: Omit<Program, "schedule">[],
  habits: Habit[],
  dict: Dictionary,
): Recommendation[] {
  const recs: Recommendation[] = [];

  const matchedGoal = user.primaryGoals
    .map((id) => PRIMARY_GOAL_OPTIONS.find((g) => g.id === id))
    .find((g): g is (typeof PRIMARY_GOAL_OPTIONS)[number] => Boolean(g));
  const { program: suggestedProgram } = buildWeekPlan(programs, {
    level: user.level,
    equipment: user.equipment,
    trainingDays: user.trainingDays,
    goals: user.primaryGoals,
  });
  if (suggestedProgram) {
    recs.push({
      id: "program",
      label: suggestedProgram.title,
      description: matchedGoal
        ? `${dict["recommendations.matchesGoal"]} ${dict[matchedGoal.labelKey]}.`
        : dict["recommendations.wellRounded"],
      href: `/fitness/${suggestedProgram.id}`,
    });
  }

  const doneRatio = habits.length ? habits.filter((h) => h.done).length / habits.length : 0;
  if (doneRatio < 0.5) {
    recs.push({
      id: "focus",
      label: dict["recommendations.takeFocusSession"],
      description: dict["recommendations.focusDescription"],
      href: "/focus",
    });
  }

  recs.push({
    id: "community",
    label: dict["recommendations.joinChallenge"],
    description: dict["recommendations.communityDescription"],
    href: "/challenges",
  });

  return recs.slice(0, 3);
}

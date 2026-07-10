import type { Dictionary } from "@/i18n/dictionaries/en";
import { PRIMARY_GOAL_OPTIONS, type GoalId } from "@/lib/personalization";
import type { Habit, Program, ProgramCategory } from "@/types";

export interface Recommendation {
  id: string;
  label: string;
  description: string;
  href: string;
}

const GOAL_CATEGORY: Partial<Record<GoalId, ProgramCategory>> = {
  "build-muscle": "strength",
  "lose-weight": "fat-loss",
  "improve-endurance": "running",
  "live-healthier": "walking",
  "build-habits": "bodyweight",
  "increase-productivity": "mobility",
};

/**
 * Small, explainable rule-based recommendations — not a behavioral/ML
 * engine. Combines the user's stated goal, program catalog, and today's
 * habit completion into up to 3 suggestions.
 */
export function getRecommendations(
  user: { primaryGoals: string[]; identities: string[] },
  programs: Program[],
  habits: Habit[],
  dict: Dictionary,
): Recommendation[] {
  const recs: Recommendation[] = [];

  const goalOptions = user.primaryGoals
    .map((id) => PRIMARY_GOAL_OPTIONS.find((g) => g.id === id))
    .filter((g): g is (typeof PRIMARY_GOAL_OPTIONS)[number] => Boolean(g));
  const matchedGoal = goalOptions.find((g) => GOAL_CATEGORY[g.id]);
  const category = matchedGoal ? GOAL_CATEGORY[matchedGoal.id] : undefined;
  const categoryMatch = category ? programs.find((p) => p.category === category) : undefined;
  const suggestedProgram = categoryMatch ?? programs[0];
  if (suggestedProgram) {
    recs.push({
      id: "program",
      label: suggestedProgram.title,
      description:
        categoryMatch && matchedGoal
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

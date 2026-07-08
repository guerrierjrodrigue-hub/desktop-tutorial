import type { Habit, Program, ProgramCategory } from "@/types";

export interface Recommendation {
  id: string;
  label: string;
  description: string;
  href: string;
}

const GOAL_CATEGORY: Record<string, ProgramCategory> = {
  "Build Muscle": "strength",
  "Lose Weight": "fat-loss",
  "Improve Endurance": "running",
  "Live Healthier": "walking",
  "Build Better Habits": "bodyweight",
  "Increase Productivity": "mobility",
};

/**
 * Small, explainable rule-based recommendations — not a behavioral/ML
 * engine. Combines the user's stated goal, program catalog, and today's
 * habit completion into up to 3 suggestions.
 */
export function getRecommendations(
  user: { primaryGoal?: string; identities: string[] },
  programs: Program[],
  habits: Habit[],
): Recommendation[] {
  const recs: Recommendation[] = [];

  const category = user.primaryGoal ? GOAL_CATEGORY[user.primaryGoal] : undefined;
  const categoryMatch = category ? programs.find((p) => p.category === category) : undefined;
  const suggestedProgram = categoryMatch ?? programs[0];
  if (suggestedProgram) {
    recs.push({
      id: "program",
      label: suggestedProgram.title,
      description: categoryMatch
        ? `Matches your goal: ${user.primaryGoal}.`
        : "A well-rounded place to start.",
      href: `/fitness/${suggestedProgram.id}`,
    });
  }

  const doneRatio = habits.length ? habits.filter((h) => h.done).length / habits.length : 0;
  if (doneRatio < 0.5) {
    recs.push({
      id: "focus",
      label: "Take a Focus session",
      description: "A quiet 15-minute reset can help momentum return.",
      href: "/focus",
    });
  }

  recs.push({
    id: "community",
    label: "Join a challenge",
    description: "Iron sharpens iron — find accountability in Community.",
    href: "/challenges",
  });

  return recs.slice(0, 3);
}

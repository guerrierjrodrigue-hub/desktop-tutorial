import { Check, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyQuests, type Quest } from "@/lib/quests";
import { getHabits } from "@/lib/queries/habits";
import { getWorkoutDoneToday } from "@/lib/queries/stats";
import { getTodayPlan } from "@/lib/queries/today-plan";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

/** The localized label for a quest, built from its stable id (+ target). */
function questLabel(quest: Quest, dict: Dictionary): string {
  if (quest.id === "habits") {
    const n = quest.target ?? 3;
    const template = n === 1 ? dict["quests.habitSingular"] : dict["quests.habitsPlural"];
    return template.replace("{n}", String(n));
  }
  if (quest.id === "workout") return dict["quests.workout"];
  if (quest.id === "recovery") return dict["quests.recovery"];
  if (quest.id === "devotional") return dict["quests.devotional"];
  return quest.label;
}

export async function DailyQuestsCard() {
  const locale = await getLocale();
  const [habits, workoutDone, today, dict] = await Promise.all([
    getHabits(locale),
    getWorkoutDoneToday(),
    getTodayPlan(locale),
    getDictionary(locale),
  ]);
  const devotionalDone = false; // no per-day devotional-completion tracking yet
  // Recovery counts as done if they did any non-workout habit (prayer, water,
  // journal…) or trained anyway.
  const recoveryDoneToday = workoutDone || habits.some((h) => h.done && h.icon !== "Dumbbell");
  const quests = getDailyQuests(habits, workoutDone, devotionalDone, {
    isRestDay: today.isRestDay,
    recoveryDoneToday,
  });
  const earnedXp = quests.reduce((sum, q) => sum + (q.done ? q.xp : 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["dashboard.dailyQuests"]}</CardTitle>
        <span className="text-xs font-semibold text-gold-bright">
          +{earnedXp} {dict["quests.xpToday"]}
        </span>
      </CardHeader>
      <ul className="space-y-2">
        {quests.map((quest) => (
          <li
            key={quest.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              quest.done ? "border-green-bright/30 bg-green/10" : "border-border bg-surface-2",
            )}
          >
            {quest.done ? (
              <Check className="size-4 shrink-0 text-green-bright" />
            ) : (
              <Circle className="size-4 shrink-0 text-faint" />
            )}
            <span className={cn("flex-1 text-sm font-medium", quest.done && "text-muted line-through")}>
              {questLabel(quest, dict)}
            </span>
            <span className="text-xs text-faint">+{quest.xp} XP</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

import { Check, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyQuests } from "@/lib/quests";
import { getHabits } from "@/lib/queries/habits";
import { getWorkoutDoneToday } from "@/lib/queries/stats";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export async function DailyQuestsCard() {
  const [habits, workoutDone, dict] = await Promise.all([
    getHabits(),
    getWorkoutDoneToday(),
    getDictionary(await getLocale()),
  ]);
  const devotionalDone = false; // no per-day devotional-completion tracking yet
  const quests = getDailyQuests(habits, workoutDone, devotionalDone);
  const earnedXp = quests.reduce((sum, q) => sum + (q.done ? q.xp : 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["dashboard.dailyQuests"]}</CardTitle>
        <span className="text-xs font-semibold text-gold-bright">+{earnedXp} XP today</span>
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
              {quest.label}
            </span>
            <span className="text-xs text-faint">+{quest.xp} XP</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

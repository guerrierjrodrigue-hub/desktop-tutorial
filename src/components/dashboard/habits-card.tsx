import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getHabits } from "@/lib/queries/habits";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { HabitsCardClient } from "./habits-card-client";

export async function HabitsCard() {
  const locale = await getLocale();
  const [habits, dict] = await Promise.all([getHabits(locale), getDictionary(locale)]);

  if (!habits.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict["dashboard.todaysHabits"]}</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted">
          {dict["empty.noHabitsYet"]}{" "}
          <a href="/habits" className="font-semibold text-gold-bright hover:underline">
            {dict["empty.addFirstHabit"]} →
          </a>
        </p>
      </Card>
    );
  }

  return <HabitsCardClient initial={habits} title={dict["dashboard.todaysHabits"]} />;
}

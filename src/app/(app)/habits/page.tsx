import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { HabitsList } from "@/components/habits/habits-list";
import { getHabits } from "@/lib/queries/habits";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.habits"],
  };
}

export default async function HabitsPage() {
  const locale = await getLocale();
  const [habits, dict] = await Promise.all([getHabits(locale), getDictionary(locale)]);

  return (
    <>
      <Topbar title="Habits" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <HabitsList initial={habits} title={dict["dashboard.todaysHabits"]} dict={dict} />
      </main>
    </>
  );
}

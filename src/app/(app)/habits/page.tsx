import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { HabitsList } from "@/components/habits/habits-list";
import { habits } from "@/data/dashboard";

export const metadata: Metadata = {
  title: "Habits",
};

export default function HabitsPage() {
  return (
    <>
      <Topbar title="Habits" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <HabitsList initial={habits} />
      </main>
    </>
  );
}

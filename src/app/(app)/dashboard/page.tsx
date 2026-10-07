import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { Greeting } from "@/components/dashboard/greeting";
import { DevotionalCard } from "@/components/dashboard/devotional-card";
import { WorkoutCard } from "@/components/dashboard/workout-card";
import { WeekPlanCard } from "@/components/dashboard/week-plan-card";
import { HabitsCard } from "@/components/dashboard/habits-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { BadgesCard } from "@/components/dashboard/badges-card";
import { ChallengeCard } from "@/components/dashboard/challenge-card";
import { DailyQuestsCard } from "@/components/dashboard/daily-quests-card";
import { TransformationScoreCard } from "@/components/dashboard/transformation-score-card";
import { RecommendationsCard } from "@/components/dashboard/recommendations-card";
import { QuoteOfDayCard } from "@/components/dashboard/quote-of-day-card";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { getUserPreferences } from "@/lib/queries/preferences";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [{ dashboardLayout }, dict] = await Promise.all([
    getUserPreferences(),
    getDictionary(await getLocale()),
  ]);

  const widgets = [
    { id: "progress", label: dict["dashboard.progress"], node: <ProgressCard /> },
    { id: "week-plan", label: dict["dashboard.weekPlan"], node: <WeekPlanCard /> },
    { id: "workout", label: dict["dashboard.todaysWorkout"], node: <WorkoutCard /> },
    { id: "habits", label: dict["dashboard.todaysHabits"], node: <HabitsCard /> },
    { id: "stats", label: dict["dashboard.todaysActivity"], node: <StatsCard /> },
    { id: "devotional", label: dict["dashboard.devotional"], node: <DevotionalCard /> },
    { id: "quote-of-day", label: dict["dashboard.quoteOfDay"], node: <QuoteOfDayCard /> },
    { id: "daily-quests", label: dict["dashboard.dailyQuests"], node: <DailyQuestsCard /> },
    { id: "transformation-score", label: dict["dashboard.transformationScore"], node: <TransformationScoreCard /> },
    { id: "challenge", label: dict["dashboard.activeChallenge"], node: <ChallengeCard /> },
    { id: "recommendations", label: dict["dashboard.recommended"], node: <RecommendationsCard /> },
    { id: "badges", label: dict["dashboard.achievements"], node: <BadgesCard /> },
  ];

  return (
    <>
      <Topbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Greeting />
        <div className="mt-6">
          <DashboardGrid widgets={widgets} initialLayout={dashboardLayout} dict={dict} />
        </div>
      </main>
    </>
  );
}

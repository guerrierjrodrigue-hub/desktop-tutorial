import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { Greeting } from "@/components/dashboard/greeting";
import { DevotionalCard } from "@/components/dashboard/devotional-card";
import { WorkoutCard } from "@/components/dashboard/workout-card";
import { HabitsCard } from "@/components/dashboard/habits-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { BadgesCard } from "@/components/dashboard/badges-card";
import { ChallengeCard } from "@/components/dashboard/challenge-card";
import { DailyQuestsCard } from "@/components/dashboard/daily-quests-card";
import { TransformationScoreCard } from "@/components/dashboard/transformation-score-card";
import { RecommendationsCard } from "@/components/dashboard/recommendations-card";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { getUserPreferences } from "@/lib/queries/preferences";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { dashboardLayout } = await getUserPreferences();

  const widgets = [
    { id: "progress", label: "Level & progress", node: <ProgressCard /> },
    { id: "workout", label: "Today's workout", node: <WorkoutCard /> },
    { id: "devotional", label: "Devotional", node: <DevotionalCard /> },
    { id: "daily-quests", label: "Daily quests", node: <DailyQuestsCard /> },
    { id: "transformation-score", label: "Transformation score", node: <TransformationScoreCard /> },
    { id: "stats", label: "Today's activity", node: <StatsCard /> },
    { id: "challenge", label: "Active challenge", node: <ChallengeCard /> },
    { id: "recommendations", label: "Recommended for you", node: <RecommendationsCard /> },
    { id: "habits", label: "Today's habits", node: <HabitsCard /> },
    { id: "badges", label: "Achievements", node: <BadgesCard /> },
  ];

  return (
    <>
      <Topbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Greeting />
        <div className="mt-6">
          <DashboardGrid widgets={widgets} initialLayout={dashboardLayout} />
        </div>
      </main>
    </>
  );
}

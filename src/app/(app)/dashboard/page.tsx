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

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Greeting />

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-5 lg:col-span-2">
            <ProgressCard />
            <div className="grid gap-5 sm:grid-cols-2">
              <WorkoutCard />
              <DevotionalCard />
            </div>
            <StatsCard />
            <ChallengeCard />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <HabitsCard />
            <BadgesCard />
          </div>
        </div>
      </main>
    </>
  );
}

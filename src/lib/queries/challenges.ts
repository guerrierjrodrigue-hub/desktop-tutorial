import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { daysLeftFor, workoutProgress } from "@/lib/challenge-progress";
import { challenges as mockChallenges } from "@/data/dashboard";
import type { Challenge } from "@/types";

/**
 * The challenge catalog with real participant counts and the signed-in user's
 * own window + progress. Each user's window runs from the day they joined for
 * `duration_days` days, so "days left" is personal (not a stale seeded date).
 * Workout-metric challenges derive progress from the user's real workout_logs.
 * Demo data when Supabase isn't configured.
 */
export async function getChallenges(): Promise<Challenge[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockChallenges;

  const [challengeRes, participantRes] = await Promise.all([
    ctx.supabase
      .from("challenges")
      .select("id, title, description, type, duration_days, metric")
      .order("created_at", { ascending: true }),
    ctx.supabase
      .from("challenge_participants")
      .select("challenge_id, user_id, progress, joined_at"),
  ]);
  const challengeRows = challengeRes.data;
  if (!challengeRows) return [];

  const counts = new Map<string, number>();
  const mineByChallenge = new Map<string, { progress: number; joined_at: string }>();
  for (const p of participantRes.data ?? []) {
    counts.set(p.challenge_id, (counts.get(p.challenge_id) ?? 0) + 1);
    if (p.user_id === ctx.userId) {
      mineByChallenge.set(p.challenge_id, { progress: p.progress, joined_at: p.joined_at });
    }
  }

  const tz = await getUserTimezone();
  const todayStr = getUserToday(tz);

  return Promise.all(
    challengeRows.map(async (row) => {
      const mine = mineByChallenge.get(row.id);
      const joined = Boolean(mine);
      const durationDays = row.duration_days ?? 30;

      let progress = mine?.progress ?? 0;
      if (joined && mine && row.metric === "workouts") {
        const { count } = await ctx.supabase
          .from("workout_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.userId)
          .gte("completed_at", mine.joined_at);
        progress = workoutProgress(count ?? 0);
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        participants: counts.get(row.id) ?? 0,
        durationDays,
        daysLeft: joined && mine
          ? daysLeftFor(getUserToday(tz, new Date(mine.joined_at)), durationDays, todayStr)
          : durationDays,
        joined,
        progress,
        type: row.type,
      };
    }),
  );
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  you: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Marcus T.", points: 2840, you: false },
  { rank: 2, name: "Sarah M.", points: 2610, you: false },
  { rank: 3, name: "David Bennett", points: 2480, you: true },
  { rank: 4, name: "Elena R.", points: 2210, you: false },
  { rank: 5, name: "James P.", points: 1990, you: false },
];

/** Top challenge participants by total points across all challenges (demo data when unconfigured). */
export async function getChallengeLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return MOCK_LEADERBOARD;

  const { data } = await ctx.supabase
    .from("challenge_participants")
    .select("user_id, points");
  if (!data || !data.length) return [];

  const totals = new Map<string, number>();
  for (const row of data) {
    totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + row.points);
  }

  const { data: profiles } = await ctx.supabase
    .from("profile_public")
    .select("id, name")
    .in("id", [...totals.keys()]);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.name]));

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([userId, points], i) => ({
      rank: i + 1,
      name: nameById.get(userId) ?? "Athlete",
      points,
      you: userId === ctx.userId,
    }));
}

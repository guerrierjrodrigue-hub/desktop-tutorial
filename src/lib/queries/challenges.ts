import { getAuthedContext } from "@/lib/supabase/auth";
import { challenges as mockChallenges } from "@/data/dashboard";
import type { Challenge } from "@/types";

/** The challenge catalog with participant counts and the signed-in user's own progress (demo data when unconfigured). */
export async function getChallenges(): Promise<Challenge[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockChallenges;

  const { data: challengeRows } = await ctx.supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: true });
  if (!challengeRows) return [];

  const { data: participantRows } = await ctx.supabase
    .from("challenge_participants")
    .select("*");

  const byChallenge = new Map<string, { user_id: string; progress: number }[]>();
  for (const p of participantRows ?? []) {
    if (!byChallenge.has(p.challenge_id)) byChallenge.set(p.challenge_id, []);
    byChallenge.get(p.challenge_id)!.push(p);
  }

  const today = Date.now();
  return challengeRows.map((row) => {
    const participants = byChallenge.get(row.id) ?? [];
    const mine = participants.find((p) => p.user_id === ctx.userId);
    const daysLeft = row.ends_at
      ? Math.max(0, Math.ceil((new Date(row.ends_at).getTime() - today) / 86_400_000))
      : 0;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      participants: participants.length,
      daysLeft,
      progress: mine?.progress ?? 0,
      type: row.type,
    };
  });
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
    .from("profiles")
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

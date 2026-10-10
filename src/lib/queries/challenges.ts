import { getAuthedContext } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { daysLeftFor, cohortStatus, workoutProgress } from "@/lib/challenge-progress";
import { pick, CHALLENGE_FR } from "@/lib/content-i18n";
import { challenges as mockChallenges } from "@/data/dashboard";
import type { LocaleCode } from "@/i18n/locales";
import type { Challenge } from "@/types";

/**
 * The challenge catalog with real participant counts and the signed-in user's
 * own window + progress. Each user's window runs from the day they joined for
 * `duration_days` days, so "days left" is personal (not a stale seeded date).
 * Workout-metric challenges derive progress from the user's real workout_logs.
 * Demo data when Supabase isn't configured.
 */
export async function getChallenges(locale: LocaleCode = "en"): Promise<Challenge[]> {
  const ctx = await getAuthedContext();
  if (!ctx) {
    return mockChallenges.map((c) => {
      const fr = locale === "fr" ? CHALLENGE_FR[c.title] : undefined;
      return fr ? { ...c, title: fr.title, description: fr.description } : c;
    });
  }

  const [challengeRes, participantRes] = await Promise.all([
    ctx.supabase
      .from("challenges")
      .select("id, title, title_fr, description, description_fr, type, duration_days, metric, start_date, invite_code")
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

      // A dated cohort shares one window from its start_date (late joiners keep
      // the common end); everything else runs from the user's own join date.
      let started = true;
      let daysLeft = durationDays;
      if (row.start_date) {
        const status = cohortStatus(row.start_date, durationDays, todayStr);
        started = status.started;
        daysLeft = status.daysLeft;
      } else if (joined && mine) {
        daysLeft = daysLeftFor(getUserToday(tz, new Date(mine.joined_at)), durationDays, todayStr);
      }

      return {
        id: row.id,
        title: pick(locale, row.title, row.title_fr),
        description: pick(locale, row.description, row.description_fr),
        participants: counts.get(row.id) ?? 0,
        durationDays,
        daysLeft,
        started,
        joined,
        progress,
        type: row.type,
        startDate: row.start_date,
        inviteCode: row.invite_code,
      };
    }),
  );
}

export interface CohortInvite {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  participants: number;
  startDate: string | null;
}

/**
 * A cohort resolved by its invite code, readable by anyone (public SELECT RLS)
 * so even logged-out invitees see the /join/<code> landing. Null in demo mode
 * (no backend) or when the code doesn't exist.
 */
export async function getChallengeByInviteCode(
  code: string,
  locale: LocaleCode = "en",
): Promise<CohortInvite | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("challenges")
    .select("id, title, title_fr, description, description_fr, duration_days, start_date")
    .eq("invite_code", code)
    .maybeSingle();
  const row = data as {
    id: string;
    title: string;
    title_fr: string | null;
    description: string;
    description_fr: string | null;
    duration_days: number;
    start_date: string | null;
  } | null;
  if (!row) return null;

  const { count } = await supabase
    .from("challenge_participants")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", row.id);

  return {
    id: row.id,
    title: pick(locale, row.title, row.title_fr),
    description: pick(locale, row.description, row.description_fr),
    durationDays: row.duration_days ?? 21,
    participants: count ?? 0,
    startDate: row.start_date,
  };
}

/** How many people the signed-in user has referred into challenges. */
export async function getReferralCount(): Promise<number> {
  const ctx = await getAuthedContext();
  if (!ctx) return 0;
  const { count } = await ctx.supabase
    .from("challenge_participants")
    .select("*", { count: "exact", head: true })
    .eq("referred_by", ctx.userId);
  return count ?? 0;
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

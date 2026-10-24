import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/auth";
import { isFreeMode } from "@/lib/flags";
import { globalStreak } from "@/lib/gamification";
import { getUserToday, addDaysToDateStr } from "@/lib/date";
import { currentUser as mockUser } from "@/data/user";
import type { UserProfile } from "@/types";
import type { ProfileRow } from "@/types/database";

/**
 * During the free-beta phase (APP_FREE_MODE), unlock everything gated behind
 * `user.isPremium` by forcing it true on every returned profile — real or mock —
 * regardless of the stored status. This single choke point means no premium
 * gate elsewhere in the app needs touching. The real `is_premium` column is
 * untouched, so admin KPIs still report true numbers.
 */
function applyFreeMode(user: UserProfile): UserProfile {
  return isFreeMode() ? { ...user, isPremium: true } : user;
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    church: row.church ?? undefined,
    favoriteVerse: row.favorite_verse ?? undefined,
    level: row.level,
    heightCm: row.height_cm ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    goal: row.goal ?? undefined,
    gender: row.gender ?? undefined,
    birthDate: row.birth_date ?? undefined,
    equipment: row.equipment ?? undefined,
    trainingDays: row.training_days ?? undefined,
    reminderTime: row.reminder_time ?? undefined,
    isPremium: row.is_premium,
    xp: row.xp,
    streak: row.streak,
    joinedAt: row.joined_at,
    identities: row.identities,
    primaryGoals: row.primary_goals,
    onboardedAt: row.onboarded_at ?? undefined,
    showOnLeaderboard: row.show_on_leaderboard,
    primaryActivity: row.primary_activity ?? undefined,
    runLevel: row.run_level ?? null,
    runGoalKind: row.run_goal_kind ?? null,
  };
}

/**
 * The signed-in user's profile. Falls back to demo data when Supabase is not
 * configured or no session exists, so every screen renders in any environment.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<UserProfile> {
  const user = await getSessionUser();
  if (!user) return applyFreeMode(mockUser);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    const row = data as ProfileRow;
    const profile = applyFreeMode(mapProfile(row));
    // Global streak derived from xp_events (planned rest days don't break it).
    const todayStr = getUserToday(row.timezone ?? "UTC");
    const { data: dayRows } = await supabase
      .from("xp_events")
      .select("day")
      .eq("user_id", user.id)
      .gte("day", addDaysToDateStr(todayStr, -200));
    profile.streak = globalStreak(
      ((dayRows ?? []) as { day: string }[]).map((r) => r.day),
      row.training_days ?? 3,
      todayStr,
    );
    // Write the freshly computed streak back to the cached column so readers that
    // query profiles.streak directly (leaderboard, coach context) stay in sync
    // with the dashboard instead of showing a stale 0. Best-effort; a failed
    // write never blocks the page.
    if (row.streak !== profile.streak) {
      // Permissive cast for the write: the hand-written Database type exposes no
      // Update types (reads stay fully typed). Matches getAuthedContext's pattern.
      await (supabase as SupabaseClient)
        .from("profiles")
        .update({ streak: profile.streak })
        .eq("id", user.id);
    }
    return profile;
  }

  // Authenticated but no profile row yet (e.g. the database migrations
  // haven't been applied, so the handle_new_user trigger never ran). Return
  // a blank profile derived from the auth record — a real signed-in user
  // must never see the demo persona's stats.
  return applyFreeMode({
    id: user.id,
    name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Athlete",
    email: user.email ?? "",
    avatarUrl: user.user_metadata?.avatar_url ?? undefined,
    level: "beginner",
    isPremium: false,
    xp: 0,
    streak: 0,
    joinedAt: user.created_at,
    identities: [],
    primaryGoals: [],
    showOnLeaderboard: true,
  });
});

/** Whether a real authenticated session exists (false in demo mode). */
export async function hasSession(): Promise<boolean> {
  return Boolean(await getSessionUser());
}

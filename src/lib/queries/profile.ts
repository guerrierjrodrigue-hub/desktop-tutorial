import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { currentUser as mockUser } from "@/data/user";
import type { UserProfile } from "@/types";
import type { ProfileRow } from "@/types/database";

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
    isPremium: row.is_premium,
    xp: row.xp,
    streak: row.streak,
    joinedAt: row.joined_at,
    identities: row.identities,
    primaryGoals: row.primary_goals,
    onboardedAt: row.onboarded_at ?? undefined,
  };
}

/**
 * The signed-in user's profile. Falls back to demo data when Supabase is not
 * configured or no session exists, so every screen renders in any environment.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  if (!isSupabaseConfigured()) return mockUser;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return mockUser;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) return mapProfile(data);

  // Authenticated but no profile row yet (e.g. the database migrations
  // haven't been applied, so the handle_new_user trigger never ran). Return
  // a blank profile derived from the auth record — a real signed-in user
  // must never see the demo persona's stats.
  return {
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
  };
}

/** Whether a real authenticated session exists (false in demo mode). */
export async function hasSession(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

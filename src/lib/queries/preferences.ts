import { getAuthedContext } from "@/lib/supabase/auth";

export interface UserPreferences {
  activeCoach: string;
  dashboardLayout: { id: string; hidden: boolean }[];
}

/**
 * A lean default: only the essentials are visible on first load. Everything
 * else stays one tap away via the dashboard's "Customize" toggle.
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  activeCoach: "barnabas",
  dashboardLayout: [
    { id: "progress", hidden: false },
    { id: "workout", hidden: false },
    { id: "habits", hidden: false },
    { id: "stats", hidden: false },
    { id: "devotional", hidden: false },
    { id: "quote-of-day", hidden: false },
    { id: "daily-quests", hidden: true },
    { id: "transformation-score", hidden: true },
    { id: "challenge", hidden: true },
    { id: "recommendations", hidden: true },
    { id: "badges", hidden: true },
  ],
};

/** The signed-in user's saved coach + dashboard layout (empty/default when unconfigured). */
export async function getUserPreferences(): Promise<UserPreferences> {
  const ctx = await getAuthedContext();
  if (!ctx) return DEFAULT_PREFERENCES;

  const { data } = await ctx.supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", ctx.userId)
    .single();

  if (!data) return DEFAULT_PREFERENCES;
  return { activeCoach: data.active_coach, dashboardLayout: data.dashboard_layout ?? [] };
}

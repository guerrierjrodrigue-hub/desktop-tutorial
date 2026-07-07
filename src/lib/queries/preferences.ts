import { getAuthedContext } from "@/lib/supabase/auth";

export interface UserPreferences {
  activeCoach: string;
  dashboardLayout: { id: string; hidden: boolean }[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  activeCoach: "barnabas",
  dashboardLayout: [],
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

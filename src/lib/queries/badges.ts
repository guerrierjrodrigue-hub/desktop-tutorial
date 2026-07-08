import { getAuthedContext } from "@/lib/supabase/auth";
import { badges as mockBadges } from "@/data/dashboard";
import type { Badge } from "@/types";

/** The full badge catalog with the signed-in user's earned status (demo data when unconfigured). */
export async function getBadges(): Promise<Badge[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockBadges;

  const { data: badgeRows } = await ctx.supabase.from("badges").select("*");
  if (!badgeRows) return [];

  const { data: earnedRows } = await ctx.supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", ctx.userId);

  const earnedAtByBadge = new Map((earnedRows ?? []).map((r) => [r.badge_id, r.earned_at]));

  return badgeRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    earned: earnedAtByBadge.has(row.id),
    earnedAt: earnedAtByBadge.get(row.id),
  }));
}

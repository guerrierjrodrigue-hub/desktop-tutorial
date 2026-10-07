import { getAuthedContext } from "@/lib/supabase/auth";
import { badges as mockBadges } from "@/data/dashboard";
import { pick, BADGE_FR } from "@/lib/content-i18n";
import type { LocaleCode } from "@/i18n/locales";
import type { Badge } from "@/types";

/**
 * The full badge catalog with the signed-in user's earned status, localized by
 * `locale` (French names/descriptions from the `*_fr` columns, English
 * fallback). Demo data — localized from the static dictionary — when
 * Supabase is unconfigured.
 */
export async function getBadges(locale: LocaleCode = "en"): Promise<Badge[]> {
  const ctx = await getAuthedContext();
  if (!ctx) {
    return mockBadges.map((b) => {
      const fr = locale === "fr" ? BADGE_FR[b.name] : undefined;
      return fr ? { ...b, name: fr.name, description: fr.description } : b;
    });
  }

  const { data: badgeRows } = await ctx.supabase
    .from("badges")
    .select("id, name, name_fr, description, description_fr, icon");
  if (!badgeRows) return [];

  const { data: earnedRows } = await ctx.supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", ctx.userId);

  const earnedAtByBadge = new Map((earnedRows ?? []).map((r) => [r.badge_id, r.earned_at]));

  return badgeRows.map((row) => ({
    id: row.id,
    name: pick(locale, row.name, row.name_fr),
    description: pick(locale, row.description, row.description_fr),
    icon: row.icon,
    earned: earnedAtByBadge.has(row.id),
    earnedAt: earnedAtByBadge.get(row.id),
  }));
}

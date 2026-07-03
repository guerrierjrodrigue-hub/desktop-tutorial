import { getAuthedContext } from "@/lib/supabase/auth";
import { prayerRequests as mockPrayers } from "@/data/spiritual";
import type { PrayerRequest } from "@/types";
import type { PrayerRequestRow } from "@/types/database";

function mapPrayer(row: PrayerRequestRow): PrayerRequest {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    answered: row.answered,
    createdAt: row.created_at,
  };
}

/** The signed-in user's prayer requests (demo data when unconfigured). */
export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockPrayers;

  const { data } = await ctx.supabase
    .from("prayer_requests")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  return data ? data.map(mapPrayer) : mockPrayers;
}

import { getAuthedContext } from "@/lib/supabase/auth";
import type { FoodLogEntry } from "@/types";

const MOCK_ENTRIES: FoodLogEntry[] = [
  { id: "s1", name: "Sunrise Egg & Oats", calories: 420, proteinG: 28 },
  { id: "s2", name: "Warrior Protein Bowl", calories: 540, proteinG: 45 },
];

/** The signed-in user's food log entries for today (demo data when unconfigured, empty for a real account with none yet). */
export async function getFoodLogsToday(): Promise<FoodLogEntry[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return MOCK_ENTRIES;

  const todayStr = new Date().toISOString().slice(0, 10);
  const { data } = await ctx.supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("log_date", todayStr)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    calories: row.calories,
    proteinG: row.protein_g,
  }));
}

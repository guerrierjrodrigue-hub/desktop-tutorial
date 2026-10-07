import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { recipes as mockRecipes } from "@/data/nutrition";
import type { FoodLogEntry, Recipe } from "@/types";

const MOCK_ENTRIES: FoodLogEntry[] = [
  { id: "s1", name: "Sunrise Egg & Oats", calories: 420, proteinG: 28 },
  { id: "s2", name: "Warrior Protein Bowl", calories: 540, proteinG: 45 },
];

/** The signed-in user's food log entries for today (demo data when unconfigured, empty for a real account with none yet). */
export async function getFoodLogsToday(): Promise<FoodLogEntry[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return MOCK_ENTRIES;

  const todayStr = getUserToday(await getUserTimezone());
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

/** The recipe catalog (demo data when unconfigured). */
export async function getRecipes(): Promise<Recipe[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockRecipes;

  const { data } = await ctx.supabase.from("recipes").select("*").order("name", { ascending: true });
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    minutes: row.minutes,
    tags: row.tags,
    category: row.category,
  }));
}

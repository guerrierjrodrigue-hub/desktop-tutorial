import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { pick, localizeTags, localizeRecipeName } from "@/lib/content-i18n";
import { generateRecipeDetails } from "@/lib/recipe-details";
import { recipes as mockRecipes } from "@/data/nutrition";
import type { LocaleCode } from "@/i18n/locales";
import type { RecipeRow } from "@/types/database";
import type { FoodLogEntry, Recipe } from "@/types";

/**
 * Build the detail fields (ingredients, steps, photo) for a recipe. Prefers real
 * stored content; falls back to the deterministic estimate when the columns are
 * empty (as they are for the whole catalog today). The English name drives the
 * estimate's keyword matching, so it is passed explicitly.
 */
function withDetails(
  base: Recipe,
  englishName: string,
  locale: LocaleCode,
  stored?: Partial<
    Pick<RecipeRow, "ingredients" | "ingredients_fr" | "steps" | "steps_fr" | "image_url">
  >,
): Recipe {
  // Localized array pick (pick() in content-i18n is string-only).
  const arr = (en: string[], fr: string[]) =>
    locale === "fr" ? (fr.length ? fr : en) : en.length ? en : fr;

  const ingEn = stored?.ingredients ?? [];
  const ingFr = stored?.ingredients_fr ?? [];
  const stepEn = stored?.steps ?? [];
  const stepFr = stored?.steps_fr ?? [];
  const hasStored = (ingEn.length || ingFr.length) && (stepEn.length || stepFr.length);

  if (hasStored) {
    return {
      ...base,
      ingredients: arr(ingEn, ingFr),
      steps: arr(stepEn, stepFr),
      imageUrl: stored?.image_url ?? undefined,
      estimatedDetails: false,
    };
  }

  const gen = generateRecipeDetails({
    name: englishName,
    category: base.category,
    proteinG: base.proteinG,
    carbsG: base.carbsG,
    fatG: base.fatG,
    minutes: base.minutes,
  });
  return {
    ...base,
    ingredients: arr(gen.ingredients, gen.ingredientsFr),
    steps: arr(gen.steps, gen.stepsFr),
    imageUrl: stored?.image_url ?? gen.imageUrl,
    estimatedDetails: true,
  };
}

const MOCK_ENTRIES: FoodLogEntry[] = [
  { id: "s1", name: "Sunrise Egg & Oats", calories: 420, proteinG: 28, carbsG: 44, fatG: 14 },
  { id: "s2", name: "Warrior Protein Bowl", calories: 540, proteinG: 45, carbsG: 48, fatG: 16 },
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
    carbsG: row.carbs_g ?? 0,
    fatG: row.fat_g ?? 0,
  }));
}

function mapRow(row: RecipeRow, locale: LocaleCode): Recipe {
  const base: Recipe = {
    id: row.id,
    name: pick(locale, row.name, row.name_fr),
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    minutes: row.minutes,
    tags: localizeTags(row.tags, locale),
    category: row.category,
  };
  return withDetails(base, row.name, locale, row);
}

/** The recipe catalog, localized by `locale` (demo data when unconfigured). */
export async function getRecipes(locale: LocaleCode = "en"): Promise<Recipe[]> {
  const ctx = await getAuthedContext();
  if (!ctx) {
    return mockRecipes.map((r) =>
      withDetails(
        { ...r, name: localizeRecipeName(r.name, locale), tags: localizeTags(r.tags, locale) },
        r.name,
        locale,
      ),
    );
  }

  const { data } = await ctx.supabase.from("recipes").select("*").order("name", { ascending: true });
  if (!data) return [];
  return (data as RecipeRow[]).map((row) => mapRow(row, locale));
}

/** A single recipe by id, with ingredients/steps/photo (demo data when unconfigured). */
export async function getRecipe(id: string, locale: LocaleCode = "en"): Promise<Recipe | null> {
  const ctx = await getAuthedContext();
  if (!ctx) {
    const r = mockRecipes.find((m) => m.id === id);
    if (!r) return null;
    return withDetails(
      { ...r, name: localizeRecipeName(r.name, locale), tags: localizeTags(r.tags, locale) },
      r.name,
      locale,
    );
  }

  const { data } = await ctx.supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return mapRow(data as RecipeRow, locale);
}

#!/usr/bin/env node
/**
 * Categorizes the 9 pre-existing recipes and inserts the 100 new original
 * recipes (20+ per category: weight-loss, muscle-gain, fasting, breakfast,
 * quick-easy) from recipe-catalog-data.mjs into the live `recipes` table.
 *
 * Requires migration 0007_recipe_categories.sql to already be applied
 * (adds the `category` column) — run it in the Supabase SQL Editor first.
 *
 * Safe to re-run: existing rows are matched/skipped by name, so this never
 * creates duplicates.
 *
 * Usage: node --env-file=.env.local scripts/seed-recipe-catalog.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { EXISTING_RECIPE_CATEGORIES, NEW_RECIPES } from "./recipe-catalog-data.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/seed-recipe-catalog.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: existingRows, error: fetchError } = await supabase.from("recipes").select("id,name,category");
if (fetchError) {
  console.error("Failed to read recipes table:", fetchError.message);
  if (fetchError.message.includes("category")) {
    console.error(
      "\nThe `category` column doesn't exist yet. Paste supabase/migrations/0007_recipe_categories.sql " +
        "into the Supabase SQL Editor (Project → SQL Editor → New query) and run it, then re-run this script.",
    );
  }
  process.exit(1);
}

const existingByName = new Map(existingRows.map((r) => [r.name, r]));

// 1. Categorize the 9 pre-existing recipes.
let categorized = 0;
for (const [name, category] of Object.entries(EXISTING_RECIPE_CATEGORIES)) {
  const row = existingByName.get(name);
  if (!row) {
    console.warn(`⚠ Existing recipe not found (skipped categorization): ${name}`);
    continue;
  }
  if (row.category === category) continue;
  const { error } = await supabase.from("recipes").update({ category }).eq("id", row.id);
  if (error) {
    console.error(`✗ Failed to categorize "${name}":`, error.message);
  } else {
    categorized++;
  }
}
console.log(`Categorized ${categorized} pre-existing recipe(s).`);

// 2. Insert the new recipes that don't already exist (by name).
const toInsert = NEW_RECIPES.filter((r) => !existingByName.has(r.name)).map((r) => ({
  name: r.name,
  calories: r.calories,
  protein_g: r.proteinG,
  carbs_g: r.carbsG,
  fat_g: r.fatG,
  minutes: r.minutes,
  tags: r.tags,
  category: r.category,
}));

if (toInsert.length === 0) {
  console.log("No new recipes to insert — catalog already up to date.");
} else {
  const { error: insertError } = await supabase.from("recipes").insert(toInsert);
  if (insertError) {
    console.error("Failed to insert new recipes:", insertError.message);
    process.exit(1);
  }
  console.log(`Inserted ${toInsert.length} new recipe(s).`);
}

const counts = {};
for (const r of NEW_RECIPES) counts[r.category] = (counts[r.category] ?? 0) + 1;
for (const category of Object.values(EXISTING_RECIPE_CATEGORIES)) {
  counts[category] = counts[category] ?? 0;
}
console.log("\nRecipes added per category:", counts);
console.log("Done.");

#!/usr/bin/env node
/**
 * Backfills exercise photos + step-by-step instructions from free-exercise-db
 * (github.com/yuhonas/free-exercise-db, Unlicense — public domain, safe for
 * commercial use, unlike sites such as Darebee whose terms explicitly forbid
 * inclusion in any app). Where no confident name match exists, the exercise
 * is renamed to the closest real substitute so every exercise ends up with a
 * photo — except two deliberately faith-themed practices (breathing/prayer)
 * that aren't physical exercises and have no honest equivalent in the
 * dataset, which are left untouched.
 *
 * Safe to re-run any time (e.g. after `supabase db reset` reseeds the
 * catalog) — matching is by current exercise name, so it just re-applies.
 *
 * Usage: node --env-file=.env.local scripts/enrich-exercise-media.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/enrich-exercise-media.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

function titleCase(s) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

/**
 * Original exercise name -> { newName, source }. `source` is the exact name
 * in free-exercise-db to pull instructions/muscles/image from. A `day` key
 * disambiguates names that are reused across programs for different moves
 * (only "Burpee" needs this today).
 */
const RENAME_MAP = [
  // Direct 1:1 matches — same exercise, just adding media.
  ["Back Squat", "Back Squat", "Barbell Full Squat"],
  ["Romanian Deadlift", "Romanian Deadlift", "Romanian Deadlift"],
  ["Bench Press", "Bench Press", "Barbell Bench Press - Medium Grip"],
  ["Dips", "Dips", "Dips - Triceps Version"],
  ["Barbell Row", "Barbell Row", "Bent Over Barbell Row"],
  ["Pull-ups", "Pull-ups", "Pullups"],
  ["Goblet Squat", "Goblet Squat", "Goblet Squat"],
  ["Push-up", "Push-up", "Pushups"],
  ["Russian Twist", "Russian Twist", "Russian Twist"],
  ["Plank", "Plank", "Plank"],
  ["Cat-Cow", "Cat-Cow", "Cat Stretch"],
  ["World's Greatest Stretch", "World's Greatest Stretch", "World's Greatest Stretch"],
  ["Deep Squat Hold", "Deep Squat Hold", "Bodyweight Squat"],
  ["Mountain Climbers", "Mountain Climbers", "Mountain Climbers"],
  ["Power Clean", "Power Clean", "Power Clean"],
  ["Push-up Variations", "Push-up Variations", "Pushups"],
  ["Bench Dips", "Bench Dips", "Bench Dips"],
  ["Inverted Row", "Inverted Row", "Inverted Row"],
  ["Chin-ups", "Chin-ups", "Chin-Up"],
  ["Superman Hold", "Superman Hold", "Superman"],
  ["Leg Raises", "Leg Raises", "Hanging Leg Raise"],
  ["Walking Lunge", "Walking Lunge", "Bodyweight Walking Lunge"],
  ["Thruster", "Thruster", "Kettlebell Thruster"],
  ["Renegade Row", "Renegade Row", "Alternating Renegade Row"],

  // Replacements — no honest direct match, swapped for the closest real
  // exercise so every program exercise ends up with a photo.
  ["Overhead Press", "Barbell Shoulder Press", "Barbell Shoulder Press"],
  ["Dumbbell Curl", "Dumbbell Bicep Curl", "Dumbbell Bicep Curl"],
  ["Kettlebell Swing", "One-Arm Kettlebell Swing", "One-Arm Kettlebell Swings"],
  ["Burpee", "Mountain Climbers", "Mountain Climbers", "Full-Body Burn"],
  ["Burpee", "Box Jump", "Box Jump (Multiple Response)", "AMRAP Chaos"],
  ["Rowing Intervals", "Stationary Rowing Intervals", "Rowing, Stationary"],
  ["Hill / Bike Sprint", "Stationary Bike Sprint", "Bicycling, Stationary"],
  ["Brisk Walk Warm-up", "Treadmill Walk Warm-up", "Walking, Treadmill"],
  ["Run / Walk Intervals", "Treadmill Jog Intervals", "Jogging, Treadmill"],
  ["Cool-down Walk", "Treadmill Cool-down Walk", "Walking, Treadmill"],
  ["Easy Jog Warm-up", "Easy Treadmill Jog", "Jogging, Treadmill"],
  ["Comfortably-Hard Tempo", "Tempo Treadmill Run", "Running, Treadmill"],
  ["Cool-down", "Treadmill Cool-down Walk", "Walking, Treadmill"],
  ["Conversational-Pace Run", "Trail Run / Walk", "Trail Running/Walking"],
  ["Post-run Stretch", "Standing Hamstring and Calf Stretch", "Standing Hamstring and Calf Stretch"],
  ["Pigeon Stretch", "Hip & Glute Stretch", "IT Band and Glute Stretch"],
  ["Thread the Needle", "Spinal Stretch", "Spinal Stretch"],
  ["Wall Angels", "Shoulder Circles", "Shoulder Circles"],
  ["Hamstring Floss", "Hamstring Stretch", "Hamstring Stretch"],
  ["Calf Wall Stretch", "Calf Stretch Against Wall", "Calf Stretch Elbows Against Wall"],
  ["Sun Salutation Flow", "Dynamic Back Stretch", "Dynamic Back Stretch"],
  ["Jump Squat", "Freehand Jump Squat", "Freehand Jump Squat"],
  ["Wall Ball", "Medicine Ball Chest Pass", "Medicine Ball Chest Pass"],
  ["Toes-to-Bar", "Hanging Pike", "Hanging Pike"],
  ["Thruster Ladder", "Kettlebell Thruster Ladder", "Kettlebell Thruster"],
  ["Row Sprint", "Stationary Row Sprint", "Rowing, Stationary"],
  ["Pike Push-up", "Handstand Push-Up Progression", "Handstand Push-Ups"],
  ["Assisted Pistol Squat", "Kettlebell Pistol Squat", "Kettlebell Pistol Squat"],
  ["Bulgarian Split Squat", "Dumbbell Split Squat", "Split Squat with Dumbbells"],
  ["Glute Bridge", "Single-Leg Glute Bridge", "Single Leg Glute Bridge"],
  ["Hollow Body Hold", "Plank Hold", "Plank"],
  ["Hollow Hold", "Plank Hold", "Plank"],
  ["Side Plank", "Push-Up to Side Plank", "Push Up to Side Plank"],

  // Deliberately NOT replaced: "Box Breathing" and "Psalm 23 Breath Prayer"
  // are faith/mindfulness practices, not physical exercises — free-exercise-db
  // has no honest equivalent, and swapping them for a generic stretch would
  // erase a distinctive, intentional piece of this app's Christian voice.
].map(([originalName, newName, source, day]) => ({ originalName, newName, source: source ?? newName, day }));

async function main() {
  const res = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json");
  if (!res.ok) {
    console.error(`Failed to fetch free-exercise-db: HTTP ${res.status}`);
    process.exit(1);
  }
  const dataset = await res.json();
  const bySourceName = new Map(dataset.map((ex) => [ex.name, ex]));

  const { data: days } = await supabase.from("workout_days").select("id, title");
  const dayTitleById = new Map((days ?? []).map((d) => [d.id, d.title]));

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, workout_day_id, name");

  let updated = 0;
  let skipped = 0;
  for (const ex of exercises ?? []) {
    const dayTitle = dayTitleById.get(ex.workout_day_id);
    const candidates = RENAME_MAP.filter((r) => r.originalName === ex.name);
    const rule = candidates.length > 1 ? candidates.find((r) => r.day === dayTitle) : candidates[0];
    if (!rule) {
      skipped++;
      continue;
    }

    const source = bySourceName.get(rule.source);
    if (!source) {
      console.error(`✗ Source exercise not found in dataset: ${rule.source}`);
      continue;
    }

    const muscles = [...source.primaryMuscles, ...source.secondaryMuscles].map(titleCase);
    const imageUrl = source.images?.[0] ? IMAGE_BASE + source.images[0] : null;

    const { error } = await supabase
      .from("exercises")
      .update({
        name: rule.newName,
        muscles: muscles.length ? muscles : undefined,
        instructions: source.instructions,
        image_url: imageUrl,
      })
      .eq("id", ex.id);

    if (error) {
      console.error(`✗ ${ex.name} -> ${rule.newName}: ${error.message}`);
    } else {
      updated++;
    }
  }

  console.log(`Updated ${updated} exercises with photos + instructions.`);
  console.log(`Left ${skipped} unchanged (no rule matched — likely already enriched or new content).`);
}

main();

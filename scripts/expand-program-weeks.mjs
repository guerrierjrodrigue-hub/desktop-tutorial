#!/usr/bin/env node
/**
 * Every program catalog entry advertises a week count (e.g. "8 weeks"), but
 * only week 1 ever had real workout_days/exercises content — a user who
 * finished week 1 hit a dead end. This duplicates week 1's days + exercises
 * (same structure/instructions/photos — progressive overload is left to the
 * user increasing weight/reps over time, same as the original mock data's
 * design) across every remaining week so the full advertised program exists.
 *
 * Idempotent — skips any program that already has more than one week.
 *
 * Usage: node --env-file=.env.local scripts/expand-program-weeks.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/expand-program-weeks.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const { data: programs, error: programsError } = await supabase
    .from("programs")
    .select("id, slug, weeks");
  if (programsError) throw programsError;

  for (const program of programs) {
    const { data: existingWeeks } = await supabase
      .from("program_weeks")
      .select("id, week_number")
      .eq("program_id", program.id)
      .order("week_number", { ascending: true });

    if (!existingWeeks?.length) {
      console.log(`- ${program.slug}: no week 1 found, skipping (run seed.sql first)`);
      continue;
    }
    if (existingWeeks.length >= program.weeks) {
      console.log(`- ${program.slug}: already has all ${program.weeks} week(s), skipping`);
      continue;
    }

    const week1 = existingWeeks[0];
    const { data: days } = await supabase
      .from("workout_days")
      .select("*")
      .eq("program_week_id", week1.id)
      .order("day_order", { ascending: true });

    const { data: exercises } = await supabase
      .from("exercises")
      .select("*")
      .in("workout_day_id", days.map((d) => d.id))
      .order("exercise_order", { ascending: true });

    const exercisesByDay = new Map();
    for (const ex of exercises ?? []) {
      if (!exercisesByDay.has(ex.workout_day_id)) exercisesByDay.set(ex.workout_day_id, []);
      exercisesByDay.get(ex.workout_day_id).push(ex);
    }

    const existingWeekNumbers = new Set(existingWeeks.map((w) => w.week_number));
    let weeksAdded = 0;

    for (let weekNumber = 2; weekNumber <= program.weeks; weekNumber++) {
      if (existingWeekNumbers.has(weekNumber)) continue;

      const { data: newWeek, error: weekError } = await supabase
        .from("program_weeks")
        .insert({ program_id: program.id, week_number: weekNumber })
        .select("id")
        .single();
      if (weekError) {
        console.error(`✗ ${program.slug} week ${weekNumber}: ${weekError.message}`);
        continue;
      }

      for (const day of days) {
        const { data: newDay, error: dayError } = await supabase
          .from("workout_days")
          .insert({
            program_week_id: newWeek.id,
            day_order: day.day_order,
            title: day.title,
            focus: day.focus,
            duration_minutes: day.duration_minutes,
          })
          .select("id")
          .single();
        if (dayError) {
          console.error(`✗ ${program.slug} week ${weekNumber} / ${day.title}: ${dayError.message}`);
          continue;
        }

        const dayExercises = exercisesByDay.get(day.id) ?? [];
        if (!dayExercises.length) continue;

        const rows = dayExercises.map((ex) => ({
          workout_day_id: newDay.id,
          exercise_order: ex.exercise_order,
          name: ex.name,
          muscles: ex.muscles,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          video_url: ex.video_url,
          instructions: ex.instructions,
          image_url: ex.image_url,
        }));
        const { error: exError } = await supabase.from("exercises").insert(rows);
        if (exError) {
          console.error(`✗ ${program.slug} week ${weekNumber} / ${day.title} exercises: ${exError.message}`);
        }
      }
      weeksAdded++;
    }

    console.log(`✓ ${program.slug}: added ${weeksAdded} week(s) (now ${existingWeeks.length + weeksAdded}/${program.weeks})`);
  }
}

main();

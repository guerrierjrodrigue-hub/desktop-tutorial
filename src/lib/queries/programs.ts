import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { programs as mockPrograms, getProgram as getMockProgram } from "@/data/programs";
import type { Program, ProgramWeek, WorkoutDay, Exercise } from "@/types";
import type { ProgramRow, ProgramWeekRow, WorkoutDayRow, ExerciseRow } from "@/types/database";

function mapProgram(row: ProgramRow): Omit<Program, "schedule"> {
  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    level: row.level,
    weeks: row.weeks,
    daysPerWeek: row.days_per_week,
    durationMinutes: row.duration_minutes,
    coverColor: row.cover_color,
    premium: row.premium,
  };
}

function mapExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscles: row.muscles,
    sets: row.sets,
    reps: row.reps,
    restSeconds: row.rest_seconds,
    notes: row.notes ?? undefined,
    videoUrl: row.video_url ?? undefined,
    instructions: row.instructions?.length ? row.instructions : undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

/** Program catalog (schedule omitted; loaded per-program in detail views). */
export async function getPrograms(): Promise<Omit<Program, "schedule">[]> {
  if (!isSupabaseConfigured()) return mockPrograms;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: true });

  return data && data.length ? data.map(mapProgram) : mockPrograms;
}

/**
 * A single program by slug, with its full week → day → exercise schedule.
 * Falls back to the mock catalog in demo mode or if the real catalog is
 * somehow empty (e.g. before seed.sql has been run).
 */
export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  if (!isSupabaseConfigured()) return getMockProgram(slug);

  const supabase = await createSupabaseServerClient();
  const programQuery = await supabase.from("programs").select("*").eq("slug", slug).single();
  const programRow = programQuery.data as ProgramRow | null;
  if (!programRow) return getMockProgram(slug);

  const weekQuery = await supabase
    .from("program_weeks")
    .select("*")
    .eq("program_id", programRow.id)
    .order("week_number", { ascending: true });
  const weekRows = weekQuery.data as ProgramWeekRow[] | null;
  if (!weekRows?.length) return getMockProgram(slug);

  const dayQuery = await supabase
    .from("workout_days")
    .select("*")
    .in(
      "program_week_id",
      weekRows.map((w) => w.id),
    )
    .order("day_order", { ascending: true });
  const dayRows = dayQuery.data as WorkoutDayRow[] | null;

  const exerciseQuery = await supabase
    .from("exercises")
    .select("*")
    .in(
      "workout_day_id",
      (dayRows ?? []).map((d) => d.id),
    )
    .order("exercise_order", { ascending: true });
  const exerciseRows = exerciseQuery.data as ExerciseRow[] | null;

  const exercisesByDay = new Map<string, Exercise[]>();
  for (const row of exerciseRows ?? []) {
    if (!exercisesByDay.has(row.workout_day_id)) exercisesByDay.set(row.workout_day_id, []);
    exercisesByDay.get(row.workout_day_id)!.push(mapExercise(row));
  }

  const daysByWeek = new Map<string, WorkoutDay[]>();
  for (const row of dayRows ?? []) {
    const day: WorkoutDay = {
      id: row.id,
      title: row.title,
      focus: row.focus,
      durationMinutes: row.duration_minutes,
      exercises: exercisesByDay.get(row.id) ?? [],
    };
    if (!daysByWeek.has(row.program_week_id)) daysByWeek.set(row.program_week_id, []);
    daysByWeek.get(row.program_week_id)!.push(day);
  }

  const schedule: ProgramWeek[] = weekRows.map((w) => ({
    week: w.week_number,
    days: daysByWeek.get(w.id) ?? [],
  }));

  return { ...mapProgram(programRow), schedule };
}

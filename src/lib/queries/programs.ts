import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { programs as mockPrograms, getProgram as getMockProgram } from "@/data/programs";
import {
  pick,
  localizeMuscles,
  localizeProgramText,
  localizeDayTitle,
  localizeDayFocus,
  localizeExerciseName,
} from "@/lib/content-i18n";
import type { LocaleCode } from "@/i18n/locales";
import type { Program, ProgramWeek, WorkoutDay, Exercise } from "@/types";
import type { ProgramRow, ProgramWeekRow, WorkoutDayRow, ExerciseRow } from "@/types/database";

function mapProgram(row: ProgramRow, locale: LocaleCode): Omit<Program, "schedule"> {
  return {
    id: row.slug,
    title: pick(locale, row.title, row.title_fr),
    description: pick(locale, row.description, row.description_fr),
    category: row.category,
    level: row.level,
    weeks: row.weeks,
    daysPerWeek: row.days_per_week,
    durationMinutes: row.duration_minutes,
    coverColor: row.cover_color,
    premium: row.premium,
  };
}

function mapExercise(row: ExerciseRow, locale: LocaleCode): Exercise {
  const instructions =
    locale === "fr" && row.instructions_fr?.length ? row.instructions_fr : row.instructions;
  return {
    id: row.id,
    name: pick(locale, row.name, row.name_fr),
    muscles: localizeMuscles(row.muscles, locale),
    sets: row.sets,
    reps: row.reps,
    restSeconds: row.rest_seconds,
    notes: row.notes ?? undefined,
    videoUrl: row.video_url ?? undefined,
    instructions: instructions?.length ? instructions : undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

/** Localize a demo (mock) program summary by its English strings. */
function localizeMockProgram(
  program: Omit<Program, "schedule">,
  locale: LocaleCode,
): Omit<Program, "schedule"> {
  const { title, description } = localizeProgramText(program.title, program.description, locale);
  return { ...program, title, description };
}

/** Localize a full demo (mock) program, including its schedule. */
function localizeMockFullProgram(program: Program, locale: LocaleCode): Program {
  const { title, description } = localizeProgramText(program.title, program.description, locale);
  return {
    ...program,
    title,
    description,
    schedule: program.schedule.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        title: localizeDayTitle(day.title, locale),
        focus: localizeDayFocus(day.focus, locale),
        exercises: day.exercises.map((ex) => ({
          ...ex,
          name: localizeExerciseName(ex.name, locale),
          muscles: localizeMuscles(ex.muscles, locale),
        })),
      })),
    })),
  };
}

/** Program catalog (schedule omitted; loaded per-program in detail views). */
export async function getPrograms(
  locale: LocaleCode = "en",
): Promise<Omit<Program, "schedule">[]> {
  if (!isSupabaseConfigured()) {
    return mockPrograms.map((p) => localizeMockProgram(p, locale));
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: true });

  return data && data.length
    ? data.map((row) => mapProgram(row, locale))
    : mockPrograms.map((p) => localizeMockProgram(p, locale));
}

/**
 * A single program by slug, with its full week → day → exercise schedule,
 * localized to `locale`. Falls back to the mock catalog in demo mode or if the
 * real catalog is somehow empty (e.g. before seed.sql has been run).
 */
export async function getProgramBySlug(
  slug: string,
  locale: LocaleCode = "en",
): Promise<Program | undefined> {
  if (!isSupabaseConfigured()) {
    const mock = getMockProgram(slug);
    return mock ? localizeMockFullProgram(mock, locale) : undefined;
  }

  const supabase = await createSupabaseServerClient();
  const programQuery = await supabase.from("programs").select("*").eq("slug", slug).single();
  const programRow = programQuery.data as ProgramRow | null;
  if (!programRow) {
    const mock = getMockProgram(slug);
    return mock ? localizeMockFullProgram(mock, locale) : undefined;
  }

  const weekQuery = await supabase
    .from("program_weeks")
    .select("*")
    .eq("program_id", programRow.id)
    .order("week_number", { ascending: true });
  const weekRows = weekQuery.data as ProgramWeekRow[] | null;
  if (!weekRows?.length) {
    const mock = getMockProgram(slug);
    return mock ? localizeMockFullProgram(mock, locale) : undefined;
  }

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
    exercisesByDay.get(row.workout_day_id)!.push(mapExercise(row, locale));
  }

  const daysByWeek = new Map<string, WorkoutDay[]>();
  for (const row of dayRows ?? []) {
    const day: WorkoutDay = {
      id: row.id,
      title: pick(locale, row.title, row.title_fr),
      focus: pick(locale, row.focus, row.focus_fr),
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

  return { ...mapProgram(programRow, locale), schedule };
}

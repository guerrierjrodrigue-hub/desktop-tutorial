import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { programs as mockPrograms, getProgram as getMockProgram } from "@/data/programs";
import type { Program } from "@/types";
import type { ProgramRow } from "@/types/database";

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
 * A single program by slug. Currently returns the seeded mock program (which
 * includes the full week/day/exercise schedule). Supabase detail loading —
 * joining program_weeks → workout_days → exercises — plugs in here.
 */
export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  return getMockProgram(slug);
}

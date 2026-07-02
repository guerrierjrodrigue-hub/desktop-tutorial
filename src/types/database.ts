/**
 * Minimal, hand-written Database type for Supabase clients.
 * Covers the tables the app reads/writes today. Once a Supabase project exists,
 * replace this file with the output of:
 *   supabase gen types typescript --local > src/types/database.ts
 */

type Timestamptz = string;
type DateStr = string;

/** A table whose Insert/Update are derived loosely from its Row. */
interface T<Row> {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
}

export interface ProfileRow {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  church: string | null;
  favorite_verse: string | null;
  level: "beginner" | "intermediate" | "advanced";
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  gender: string | null;
  birth_date: DateStr | null;
  is_premium: boolean;
  is_admin: boolean;
  xp: number;
  streak: number;
  joined_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface ProgramRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category:
    | "strength"
    | "fat-loss"
    | "running"
    | "walking"
    | "mobility"
    | "hiit"
    | "bodyweight";
  level: "beginner" | "intermediate" | "advanced";
  weeks: number;
  days_per_week: number;
  duration_minutes: number;
  cover_color: string;
  premium: boolean;
  created_at: Timestamptz;
}

export interface ExerciseRow {
  id: string;
  workout_day_id: string;
  exercise_order: number;
  name: string;
  muscles: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
  video_url: string | null;
}

export interface WorkoutDayRow {
  id: string;
  program_week_id: string;
  day_order: number;
  title: string;
  focus: string;
  duration_minutes: number;
}

export interface ProgramWeekRow {
  id: string;
  program_id: string;
  week_number: number;
}

export interface VerseRow {
  id: string;
  reference: string;
  text: string;
  translation: string;
}

export interface DevotionalRow {
  id: string;
  devotional_date: DateStr;
  quote: string;
  verse_id: string | null;
  prayer: string;
  reflection: string;
}

export interface BadgeRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface ReadingPlanRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  total_days: number;
}

export interface RecipeRow {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  minutes: number;
  tags: string[];
}

export interface PrayerRequestRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  answered: boolean;
  created_at: Timestamptz;
}

export interface MemoryVerseRow {
  id: string;
  user_id: string;
  reference: string;
  text: string;
  mastery: number;
  created_at: Timestamptz;
}

export interface CommunityPostRow {
  id: string;
  user_id: string;
  content: string;
  kind: "testimony" | "progress" | "prayer";
  created_at: Timestamptz;
}

export interface Database {
  public: {
    Tables: {
      profiles: T<ProfileRow>;
      programs: T<ProgramRow>;
      program_weeks: T<ProgramWeekRow>;
      workout_days: T<WorkoutDayRow>;
      exercises: T<ExerciseRow>;
      verses: T<VerseRow>;
      devotionals: T<DevotionalRow>;
      badges: T<BadgeRow>;
      reading_plans: T<ReadingPlanRow>;
      recipes: T<RecipeRow>;
      prayer_requests: T<PrayerRequestRow>;
      memory_verses: T<MemoryVerseRow>;
      community_posts: T<CommunityPostRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      fitness_level: "beginner" | "intermediate" | "advanced";
      program_category:
        | "strength"
        | "fat-loss"
        | "running"
        | "walking"
        | "mobility"
        | "hiit"
        | "bodyweight";
      challenge_type: "personal" | "friends" | "church";
      post_kind: "testimony" | "progress" | "prayer";
    };
  };
}

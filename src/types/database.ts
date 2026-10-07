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
  primary_goal: string | null;
  primary_goals: string[];
  identities: string[];
  onboarded_at: Timestamptz | null;
  joined_at: Timestamptz;
  updated_at: Timestamptz;
  timezone: string;
}

export interface ProgramRow {
  id: string;
  slug: string;
  title: string;
  title_fr: string | null;
  description: string;
  description_fr: string | null;
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
  name_fr: string | null;
  muscles: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
  video_url: string | null;
  instructions: string[];
  instructions_fr: string[] | null;
  image_url: string | null;
}

export interface WorkoutDayRow {
  id: string;
  program_week_id: string;
  day_order: number;
  title: string;
  title_fr: string | null;
  focus: string;
  focus_fr: string | null;
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
  name_fr: string | null;
  description: string;
  description_fr: string | null;
  icon: string;
}

export interface ReadingPlanRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  total_days: number;
}

export type RecipeCategory = "weight-loss" | "muscle-gain" | "fasting" | "breakfast" | "quick-easy";

export interface RecipeRow {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  minutes: number;
  tags: string[];
  category: RecipeCategory | null;
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

export interface PostLikeRow {
  post_id: string;
  user_id: string;
}

export interface HabitRow {
  id: string;
  user_id: string;
  label: string;
  icon: string;
  created_at: Timestamptz;
}

export interface HabitLogRow {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: DateStr;
  done: boolean;
}

export interface DailyStatRow {
  user_id: string;
  stat_date: DateStr;
  calories_burned: number;
  calories_goal: number;
  active_minutes: number;
  active_minutes_goal: number;
  protein_g: number;
  water_ml: number;
  water_goal_ml: number;
}

export interface UserBadgeRow {
  user_id: string;
  badge_id: string;
  earned_at: Timestamptz;
}

export interface ChallengeRow {
  id: string;
  title: string;
  title_fr: string | null;
  description: string;
  description_fr: string | null;
  type: "personal" | "friends" | "church";
  ends_at: DateStr | null;
  created_at: Timestamptz;
  created_by: string | null;
  duration_days: number;
  metric: string;
}

export interface ChallengeParticipantRow {
  challenge_id: string;
  user_id: string;
  progress: number;
  points: number;
  joined_at: Timestamptz;
}

export interface FoodLogRow {
  id: string;
  user_id: string;
  log_date: DateStr;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: Timestamptz;
}

export interface WorkoutLogRow {
  id: string;
  user_id: string;
  workout_day_id: string | null;
  duration_minutes: number;
  completed_at: Timestamptz;
}

export interface UserPreferencesRow {
  user_id: string;
  active_coach: string;
  dashboard_layout: { id: string; hidden: boolean }[];
  updated_at: Timestamptz;
}

export interface JournalEntryRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: Timestamptz;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: Timestamptz;
}

export interface NotificationPreferencesRow {
  user_id: string;
  locale: string;
  timezone: string;
  verse_reminder_enabled: boolean;
  verse_reminder_time: string | null;
  workout_reminder_enabled: boolean;
  workout_reminder_time: string | null;
  last_verse_sent_date: DateStr | null;
  last_workout_sent_date: DateStr | null;
  updated_at: Timestamptz;
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
      post_likes: T<PostLikeRow>;
      habits: T<HabitRow>;
      habit_logs: T<HabitLogRow>;
      daily_stats: T<DailyStatRow>;
      user_badges: T<UserBadgeRow>;
      challenges: T<ChallengeRow>;
      challenge_participants: T<ChallengeParticipantRow>;
      workout_logs: T<WorkoutLogRow>;
      food_logs: T<FoodLogRow>;
      user_preferences: T<UserPreferencesRow>;
      journal_entries: T<JournalEntryRow>;
      push_subscriptions: T<PushSubscriptionRow>;
      notification_preferences: T<NotificationPreferencesRow>;
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

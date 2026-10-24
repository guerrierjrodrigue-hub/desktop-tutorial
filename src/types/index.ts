/**
 * Core domain types for Kingdom Athlete.
 * These describe the shape of app data independent of any backend, so the UI
 * can run on mock data today and on Supabase later without changing consumers.
 */

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type ProgramCategory =
  | "strength"
  | "fat-loss"
  | "running"
  | "walking"
  | "mobility"
  | "hiit"
  | "bodyweight";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  church?: string;
  favoriteVerse?: string;
  level: FitnessLevel;
  heightCm?: number;
  weightKg?: number;
  goal?: string;
  gender?: string;
  birthDate?: string;
  /** Equipment access: "none" | "home" | "gym". */
  equipment?: string;
  /** Planned training days per week (1–7). */
  trainingDays?: number;
  /** Preferred daily reminder time, "HH:MM". */
  reminderTime?: string;
  isPremium: boolean;
  xp: number;
  streak: number;
  joinedAt: string;
  identities: string[];
  primaryGoals: string[];
  onboardedAt?: string;
  /** Whether the member appears (by name) in leaderboards and groups. */
  showOnLeaderboard: boolean;
  /** Runner mode: "strength" | "running" | "both". */
  primaryActivity?: "strength" | "running" | "both";
  /** Runner onboarding: current experience (null until the 2 questions are answered). */
  runLevel?: RunLevel | null;
  /** Runner onboarding: chosen objective (null until answered). */
  runGoalKind?: RunGoalKind | null;
}

/** Runner experience answered at the first /course visit. */
export type RunLevel = "new" | "5k" | "10k";

/** Runner objective answered at the first /course visit. "free" = no plan, journal only. */
export type RunGoalKind = "5k" | "10k" | "half" | "free";

export type RunKind = "easy" | "tempo" | "intervals" | "long" | "race";

/** A logged run (metric units; pace is seconds per kilometre). */
export interface Run {
  id: string;
  ranOn: string;
  distanceM: number;
  durationS: number;
  paceSPerKm: number;
  kind: RunKind;
  effort?: number;
  note?: string;
  source: "manual" | "chrono";
  planSessionId?: string;
  /** The shoe pair this run was logged against, if any. */
  shoeId?: string | null;
}

/** A pair of running shoes with cumulative distance, for wear tracking (owner-only). */
export interface Shoe {
  id: string;
  name: string;
  distanceM: number;
  retired: boolean;
  createdAt: string;
}

export interface RunSegment {
  kind: "warmup" | "run" | "walk" | "cooldown";
  seconds: number;
}

export interface RunPlanSession {
  id: string;
  planId: string;
  week: number;
  dayInWeek: number;
  title: string;
  /** Short coaching cue for this session (localized). */
  instructions?: string;
  segments: RunSegment[];
}

export interface RunWeek {
  week: number;
  verseRef: string;
  verseText: string;
  prayer: string;
  sessions: RunPlanSession[];
}

export interface RunPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  weeks: number;
  goalDistanceM?: number;
  weekMeta: RunWeek[];
}

export interface RunGoal {
  id: string;
  targetDistanceM: number;
  raceDate?: string;
  targetTimeS?: number;
}

/** Current-week running summary for the /course dashboard. */
export interface RunWeekStats {
  distanceM: number;
  runs: number;
  longestM: number;
}

/** Personal records at the standard distances (fastest duration in seconds). */
export interface RunRecords {
  oneK?: number;
  fiveK?: number;
  tenK?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  sets: number;
  reps: string; // e.g. "8-12" or "30s"
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  instructions?: string[];
  imageUrl?: string;
}

export interface WorkoutDay {
  id: string;
  title: string;
  focus: string;
  durationMinutes: number;
  exercises: Exercise[];
}

export interface ProgramWeek {
  week: number;
  days: WorkoutDay[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  category: ProgramCategory;
  level: FitnessLevel;
  weeks: number;
  daysPerWeek: number;
  durationMinutes: number;
  coverColor: string; // gradient class fragment
  premium: boolean;
  schedule: ProgramWeek[];
}

export interface Verse {
  reference: string;
  text: string;
  translation: string;
}

export interface DevotionalContent {
  quote: string;
  verse: Verse;
  prayer: string;
  reflection: string;
}

export interface Habit {
  id: string;
  label: string;
  icon: string; // lucide icon name
  done: boolean;
  streak: number;
  /** Today is a planned rest day for this habit (workout habit only): it's
   * optional and not counted against the user, and rest days don't break its streak. */
  restExempt?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  earned: boolean;
  earnedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  /** Total length of the challenge window (shown as "Lasts N days" before joining). */
  durationDays: number;
  /** Days remaining in the user's own window; only meaningful once `joined`. */
  daysLeft: number;
  /** Whether the signed-in user has joined (window runs from their join date). */
  joined: boolean;
  progress: number; // 0..1
  type: "personal" | "friends" | "church";
  /** Cohort start date (YYYY-MM-DD) when this is a group cohort. */
  startDate?: string | null;
  /**
   * Whether the challenge window has begun. Always true for personal/ad-hoc
   * challenges; for a dated cohort it's false until its `startDate`, which is
   * when the "N days left" countdown begins (before then the UI shows the
   * start date instead).
   */
  started?: boolean;
  /** Invite code for the shareable /join/<code> link (cohorts). */
  inviteCode?: string | null;
}

export interface DailyStats {
  caloriesBurned: number;
  caloriesGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  proteinG: number;
  waterMl: number;
  waterGoalMl: number;
}

export interface FoodLogEntry {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type RecipeCategory = "weight-loss" | "muscle-gain" | "fasting" | "breakfast" | "quick-easy";

export interface Recipe {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  minutes: number;
  tags: string[];
  category: RecipeCategory | null;
  /** A real stored photo, if one exists (else the UI shows a palette placeholder). */
  imageUrl?: string;
  /** Hand-written ingredients, localized. Absent until a real recipe is written. */
  ingredients?: string[];
  /** Hand-written step-by-step method, localized. Absent until a real recipe is written. */
  steps?: string[];
  /** True once a recipe has hand-written ingredients + steps (not just macros). */
  hasFullRecipe?: boolean;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  completedDays: number;
  /** The canonical English title, used to look up the day-by-day passage schedule. */
  titleEn?: string;
}

export interface MemoryVerse {
  key: string;
  reference: string;
  text: string;
  mastery: number;
}

export interface PrayerRequest {
  id: string;
  title: string;
  body: string;
  answered: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatarColor: string;
  timeAgo: string;
  content: string;
  kind: "testimony" | "progress" | "prayer";
  likes: number;
  comments: number;
  liked: boolean;
  /** The author's user id — drives "report"/"block" and own-post deletion. */
  authorId?: string;
  /** Whether the signed-in user is the author (shows the delete action). */
  isOwn?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type CoachId = "barnabas" | "titan" | "forge" | "haven";

export type IdentityId =
  | "athlete"
  | "disciplined"
  | "christian"
  | "student"
  | "entrepreneur"
  | "wellness"
  | "parent"
  | "creator";

export interface NotificationPreferences {
  timezone: string;
  verseReminderEnabled: boolean;
  verseReminderTime: string | null;
  workoutReminderEnabled: boolean;
  workoutReminderTime: string | null;
}

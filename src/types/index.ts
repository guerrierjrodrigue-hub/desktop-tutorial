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
  isPremium: boolean;
  xp: number;
  streak: number;
  joinedAt: string;
  identities: string[];
  primaryGoals: string[];
  onboardedAt?: string;
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
  daysLeft: number;
  progress: number; // 0..1
  type: "personal" | "friends" | "church";
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
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  completedDays: number;
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

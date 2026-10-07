import type {
  Habit,
  Badge,
  Challenge,
  DailyStats,
} from "@/types";

export const habits: Habit[] = [
  { id: "h1", label: "Morning prayer", icon: "Sunrise", done: true, streak: 26 },
  { id: "h2", label: "Read Scripture", icon: "BookOpen", done: true, streak: 26 },
  { id: "h3", label: "Complete workout", icon: "Dumbbell", done: false, streak: 12 },
  { id: "h4", label: "Drink 3L water", icon: "Droplets", done: false, streak: 8 },
  { id: "h5", label: "Gratitude journal", icon: "Heart", done: true, streak: 19 },
];

export const badges: Badge[] = [
  { id: "b1", name: "First Steps", description: "Completed your first workout", icon: "Footprints", earned: true, earnedAt: "2025-11-03" },
  { id: "b2", name: "Seven-Day Fire", description: "7-day streak", icon: "Flame", earned: true, earnedAt: "2025-11-10" },
  { id: "b3", name: "Word Warrior", description: "Read Scripture 30 days", icon: "Sword", earned: true, earnedAt: "2025-12-05" },
  { id: "b4", name: "Iron Discipline", description: "50 workouts logged", icon: "Dumbbell", earned: false },
  { id: "b5", name: "Marathon Soul", description: "100-day streak", icon: "Trophy", earned: false },
  { id: "b6", name: "Prayer Pillar", description: "Logged 100 prayers", icon: "HandHeart", earned: false },
];

export const challenges: Challenge[] = [
  {
    id: "c1",
    title: "40 Days of Discipline",
    description: "Complete a workout and a devotional every day for 40 days.",
    participants: 1284,
    durationDays: 40,
    daysLeft: 14,
    joined: true,
    progress: 0.65,
    type: "personal",
  },
  {
    id: "c2",
    title: "Church vs. Church: 30 workouts this month",
    description: "Your church vs. others — log 30 workouts this month.",
    participants: 312,
    durationDays: 30,
    daysLeft: 30,
    joined: false,
    progress: 0,
    type: "church",
  },
  {
    id: "c3",
    title: "Iron Sharpens Iron",
    description: "You & 3 friends: 12 workouts in 2 weeks.",
    participants: 4,
    durationDays: 14,
    daysLeft: 5,
    joined: true,
    progress: 0.75,
    type: "friends",
  },
];

export const todayStats: DailyStats = {
  caloriesBurned: 420,
  caloriesGoal: 650,
  activeMinutes: 32,
  activeMinutesGoal: 45,
  proteinG: 96,
  waterMl: 1800,
  waterGoalMl: 3000,
};

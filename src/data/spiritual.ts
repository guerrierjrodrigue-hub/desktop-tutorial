import type { ReadingPlan, PrayerRequest } from "@/types";

export const readingPlans: ReadingPlan[] = [
  { id: "rp1", title: "The Gospels in 30 Days", description: "Walk through the life of Jesus, one chapter at a time.", totalDays: 30, completedDays: 12 },
  { id: "rp2", title: "Psalms of Strength", description: "31 days of courage, refuge, and praise.", totalDays: 31, completedDays: 5 },
  { id: "rp3", title: "Proverbs for Discipline", description: "Daily wisdom for a disciplined life.", totalDays: 31, completedDays: 31 },
  { id: "rp4", title: "Fitness & Faith", description: "Curated readings on stewardship of the body.", totalDays: 14, completedDays: 0 },
];

/**
 * Curated memory verses to practice. The list is app-defined; per-user mastery
 * lives in `memory_verse_progress` (0 for new users). `demoMastery` is only used
 * in demo mode (Supabase not configured). French text is Louis Segond 1910.
 */
export interface MemoryVerseSeed {
  key: string;
  demoMastery: number;
  en: { reference: string; text: string };
  fr: { reference: string; text: string };
}

export const memoryVerseSeeds: MemoryVerseSeed[] = [
  {
    key: "php-4-13",
    demoMastery: 0.9,
    en: { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
    fr: { reference: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },
  },
  {
    key: "1co-9-27",
    demoMastery: 0.6,
    en: { reference: "1 Corinthians 9:27", text: "I discipline my body and keep it under control." },
    fr: { reference: "1 Corinthiens 9:27", text: "Je traite durement mon corps et je le tiens assujetti." },
  },
  {
    key: "isa-40-31",
    demoMastery: 0.3,
    en: { reference: "Isaiah 40:31", text: "Those who hope in the Lord will renew their strength." },
    fr: { reference: "Ésaïe 40:31", text: "Ceux qui se confient en l'Éternel renouvellent leur force." },
  },
];

export const prayerRequests: PrayerRequest[] = [
  { id: "pr1", title: "Consistency & discipline", body: "That God would help me stay faithful to this journey even when motivation fades.", answered: false, createdAt: "2026-06-28" },
  { id: "pr2", title: "Healing for my knee", body: "Praying for recovery so I can return to running.", answered: false, createdAt: "2026-06-20" },
  { id: "pr3", title: "Wisdom at work", body: "For a big decision coming up this month.", answered: true, createdAt: "2026-05-30" },
];

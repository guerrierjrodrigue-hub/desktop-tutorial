import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names while resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number of minutes as a compact human string, e.g. 95 -> "1h 35m". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Clamp a value between a lower and upper bound. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Return the XP required to reach a given level (gentle exponential curve). */
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

/** Derive level + progress from a total XP amount. */
export function levelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) level++;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = clamp(
    (totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp),
    0,
    1,
  );
  return { level, currentLevelXp, nextLevelXp, progress };
}

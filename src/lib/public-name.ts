/**
 * A privacy-preserving public display name: first name + last-name initial,
 * e.g. "Jean Guerrier" -> "Jean G.". Shown on the leaderboard and anywhere else
 * other members see a name, so the full surname is never exposed.
 *
 * - A single-word name is returned unchanged ("Jean" -> "Jean").
 * - Middle names are ignored; the initial comes from the last word.
 * - Empty/whitespace falls back to "Athlete".
 */
export function publicDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Athlete";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

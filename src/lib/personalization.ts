import { BookOpen, Compass } from "lucide-react";
import type { NavItem } from "@/lib/nav";
import type { DictionaryKey } from "@/i18n/dictionaries/en";
import type { CoachId, IdentityId } from "@/types";

/** Selectable identities in onboarding — "who do you want to become?" */
export const IDENTITY_OPTIONS: { id: IdentityId; labelKey: DictionaryKey }[] = [
  { id: "athlete", labelKey: "identity.athlete" },
  { id: "disciplined", labelKey: "identity.disciplined" },
  { id: "christian", labelKey: "identity.christian" },
  { id: "student", labelKey: "identity.student" },
  { id: "entrepreneur", labelKey: "identity.entrepreneur" },
  { id: "wellness", labelKey: "identity.wellness" },
  { id: "parent", labelKey: "identity.parent" },
  { id: "creator", labelKey: "identity.creator" },
];

export type GoalId =
  | "build-muscle"
  | "lose-weight"
  | "improve-endurance"
  | "become-disciplined"
  | "live-healthier"
  | "build-habits"
  | "improve-mental-wellness"
  | "grow-spiritually"
  | "increase-productivity";

/** Selectable primary goals in onboarding — `id` is the stable stored value; `labelKey` is display-only. */
export const PRIMARY_GOAL_OPTIONS: { id: GoalId; labelKey: DictionaryKey }[] = [
  { id: "build-muscle", labelKey: "goal.buildMuscle" },
  { id: "lose-weight", labelKey: "goal.loseWeight" },
  { id: "improve-endurance", labelKey: "goal.improveEndurance" },
  { id: "become-disciplined", labelKey: "goal.becomeDisciplined" },
  { id: "live-healthier", labelKey: "goal.liveHealthier" },
  { id: "build-habits", labelKey: "goal.buildHabits" },
  { id: "improve-mental-wellness", labelKey: "goal.improveMentalWellness" },
  { id: "grow-spiritually", labelKey: "goal.growSpiritually" },
  { id: "increase-productivity", labelKey: "goal.increaseProductivity" },
];

/**
 * The Purpose pillar's single nav item adapts to the user's identities:
 * Christian users get the existing Spiritual (Bible/prayer/devotionals) hub;
 * everyone else gets the generic Purpose Journal.
 */
export function getPurposeNavItem(identities: string[]): NavItem {
  return identities.includes("christian")
    ? { href: "/spiritual", label: "Spiritual", labelKey: "nav.spiritual", icon: BookOpen }
    : { href: "/journal", label: "Purpose Journal", labelKey: "nav.purposeJournal", icon: Compass };
}

/** Suggests which coach persona best fits a user's selected identities. */
export function suggestedCoachId(identities: string[]): CoachId {
  if (identities.includes("christian")) return "barnabas";
  if (identities.includes("athlete")) return "titan";
  if (identities.includes("entrepreneur") || identities.includes("disciplined")) {
    return "forge";
  }
  return "haven";
}

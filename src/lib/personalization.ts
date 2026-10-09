import { BookOpen } from "lucide-react";
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

/** Fitness level options for the training-profile step. */
export const LEVEL_OPTIONS: { id: "beginner" | "intermediate" | "advanced"; labelKey: DictionaryKey }[] = [
  { id: "beginner", labelKey: "level.beginner" },
  { id: "intermediate", labelKey: "level.intermediate" },
  { id: "advanced", labelKey: "level.advanced" },
];

/** Equipment-access options for the training-profile step. */
export const EQUIPMENT_OPTIONS: { id: "none" | "home" | "gym"; labelKey: DictionaryKey }[] = [
  { id: "none", labelKey: "equipment.none" },
  { id: "home", labelKey: "equipment.home" },
  { id: "gym", labelKey: "equipment.gym" },
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

/** Spiritual hub (devotionals / reading plans / prayer) — Bible lives under it. */
const SPIRITUAL_NAV_ITEM: NavItem = {
  href: "/spiritual",
  label: "Spiritual",
  labelKey: "nav.spiritual",
  icon: BookOpen,
};

/** Dedicated Bible reader entry, shown under Spiritual for everyone. */
const BIBLE_NAV_ITEM: NavItem = {
  href: "/spiritual/bible",
  label: "Bible",
  labelKey: "nav.bible",
  icon: BookOpen,
};

/**
 * The Purpose pillar's items. This is a faith app, so the Spiritual hub (which
 * contains the Bible) and the dedicated Bible entry are ALWAYS shown to every
 * user, regardless of identity. (The old "Purpose Journal" entry was dropped:
 * it pointed at /journal, the exact same page as the Mind pillar's "Journal",
 * so it was a duplicate.)
 */
export function getPurposeNavItems(): NavItem[] {
  return [SPIRITUAL_NAV_ITEM, BIBLE_NAV_ITEM];
}

/** The pillar's primary destination (Spiritual) — used for the mobile bottom bar. */
export function getSpiritualNavItem(): NavItem {
  return SPIRITUAL_NAV_ITEM;
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

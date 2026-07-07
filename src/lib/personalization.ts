import { BookOpen, Compass } from "lucide-react";
import type { NavItem } from "@/lib/nav";
import type { CoachId, IdentityId } from "@/types";

/** Selectable identities in onboarding — "who do you want to become?" */
export const IDENTITY_OPTIONS: { id: IdentityId; label: string }[] = [
  { id: "athlete", label: "Athlete" },
  { id: "disciplined", label: "Disciplined Person" },
  { id: "christian", label: "Christian" },
  { id: "student", label: "Student" },
  { id: "entrepreneur", label: "Entrepreneur" },
  { id: "wellness", label: "Wellness Seeker" },
  { id: "parent", label: "Parent" },
  { id: "creator", label: "Creator" },
];

/** Selectable primary goals in onboarding. */
export const PRIMARY_GOAL_OPTIONS = [
  "Build Muscle",
  "Lose Weight",
  "Improve Endurance",
  "Become More Disciplined",
  "Live Healthier",
  "Build Better Habits",
  "Improve Mental Wellness",
  "Grow Spiritually",
  "Increase Productivity",
] as const;

/**
 * The Purpose pillar's single nav item adapts to the user's identities:
 * Christian users get the existing Spiritual (Bible/prayer/devotionals) hub;
 * everyone else gets the generic Purpose Journal.
 */
export function getPurposeNavItem(identities: string[]): NavItem {
  return identities.includes("christian")
    ? { href: "/spiritual", label: "Spiritual", icon: BookOpen }
    : { href: "/journal", label: "Purpose Journal", icon: Compass };
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

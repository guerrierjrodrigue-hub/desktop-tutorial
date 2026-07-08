import type { LucideIcon } from "lucide-react";
import type { DictionaryKey } from "@/i18n/dictionaries/en";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Brain,
  Timer,
  NotebookPen,
  Repeat,
  Sparkles,
  Users,
  Trophy,
  User,
  Compass,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Dictionary key used to translate `label` — see `@/i18n/dictionaries/en`. */
  labelKey?: DictionaryKey;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  labelKey?: DictionaryKey;
  icon: LucideIcon;
  items: NavItem[];
}

/** Always shown above the pillar groups. */
export const dashboardNavItem: NavItem = {
  href: "/dashboard",
  label: "Dashboard",
  labelKey: "nav.dashboard",
  icon: LayoutDashboard,
};

/**
 * Navigation grouped into the app's 5 Life Pillars. The Purpose pillar's item
 * adapts to the signed-in user's identities — see `getPurposeNavItem` in
 * `@/lib/personalization`.
 */
export function getNavGroups(purposeItem: NavItem): NavGroup[] {
  return [
    {
      id: "body",
      label: "Body",
      labelKey: "nav.body",
      icon: Dumbbell,
      items: [
        { href: "/fitness", label: "Fitness", labelKey: "nav.fitness", icon: Dumbbell },
        { href: "/nutrition", label: "Nutrition", labelKey: "nav.nutrition", icon: Apple },
      ],
    },
    {
      id: "mind",
      label: "Mind",
      labelKey: "nav.mind",
      icon: Brain,
      items: [
        { href: "/focus", label: "Focus", labelKey: "nav.focus", icon: Timer },
        { href: "/journal", label: "Journal", labelKey: "nav.journal", icon: NotebookPen },
      ],
    },
    {
      id: "habits",
      label: "Habits",
      labelKey: "nav.habits",
      icon: Repeat,
      items: [{ href: "/habits", label: "Habits", labelKey: "nav.habits", icon: Repeat }],
    },
    {
      id: "purpose",
      label: "Purpose",
      labelKey: "nav.purpose",
      icon: Compass,
      items: [purposeItem],
    },
    {
      id: "community",
      label: "Community",
      labelKey: "nav.community",
      icon: Users,
      items: [
        { href: "/community", label: "Community", labelKey: "nav.community", icon: Users },
        { href: "/challenges", label: "Challenges", labelKey: "nav.challenges", icon: Trophy },
      ],
    },
  ];
}

/** Cross-cutting items rendered below the pillar groups (not pillar-specific). */
export const standaloneNavItems: NavItem[] = [
  { href: "/coach", label: "Coach", labelKey: "nav.coach", icon: Sparkles },
  { href: "/profile", label: "Profile", labelKey: "nav.profile", icon: User },
];

/** Curated 5-item bottom bar for mobile — one shortcut per pillar. */
export function getMobileNavItems(purposeItem: NavItem): NavItem[] {
  return [
    dashboardNavItem,
    { href: "/fitness", label: "Body", labelKey: "nav.body", icon: Dumbbell },
    { href: "/habits", label: "Habits", labelKey: "nav.habits", icon: Repeat },
    purposeItem,
    { href: "/community", label: "Community", labelKey: "nav.community", icon: Users },
  ];
}

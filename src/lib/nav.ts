import type { LucideIcon } from "lucide-react";
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
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

/** Always shown above the pillar groups. */
export const dashboardNavItem: NavItem = {
  href: "/dashboard",
  label: "Dashboard",
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
      icon: Dumbbell,
      items: [
        { href: "/fitness", label: "Fitness", icon: Dumbbell },
        { href: "/nutrition", label: "Nutrition", icon: Apple },
      ],
    },
    {
      id: "mind",
      label: "Mind",
      icon: Brain,
      items: [
        { href: "/focus", label: "Focus", icon: Timer },
        { href: "/journal", label: "Journal", icon: NotebookPen },
      ],
    },
    {
      id: "habits",
      label: "Habits",
      icon: Repeat,
      items: [{ href: "/habits", label: "Habits", icon: Repeat }],
    },
    {
      id: "purpose",
      label: "Purpose",
      icon: Compass,
      items: [purposeItem],
    },
    {
      id: "community",
      label: "Community",
      icon: Users,
      items: [
        { href: "/community", label: "Community", icon: Users },
        { href: "/challenges", label: "Challenges", icon: Trophy },
      ],
    },
  ];
}

/** Cross-cutting items rendered below the pillar groups (not pillar-specific). */
export const standaloneNavItems: NavItem[] = [
  { href: "/coach", label: "Coach", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

/** Curated 5-item bottom bar for mobile — one shortcut per pillar. */
export function getMobileNavItems(purposeItem: NavItem): NavItem[] {
  return [
    dashboardNavItem,
    { href: "/fitness", label: "Body", icon: Dumbbell },
    { href: "/habits", label: "Habits", icon: Repeat },
    purposeItem,
    { href: "/community", label: "Community", icon: Users },
  ];
}

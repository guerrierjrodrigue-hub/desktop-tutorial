import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  BookOpen,
  Sparkles,
  Users,
  Trophy,
  User,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/spiritual", label: "Spiritual", icon: BookOpen },
  { href: "/coach", label: "Barnabas", icon: Sparkles },
  { href: "/community", label: "Community", icon: Users },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

/** Primary items surfaced in the mobile bottom bar. */
export const mobileNavItems: NavItem[] = [
  navItems[0],
  navItems[1],
  navItems[4],
  navItems[3],
  navItems[5],
];

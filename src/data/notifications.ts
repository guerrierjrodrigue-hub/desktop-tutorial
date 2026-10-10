export interface AppNotification {
  id: string;
  icon: string; // lucide icon name
  title: string;
  body: string;
  time: string;
  read: boolean;
  accent: "accent" | "green" | "ember";
}

export const notifications: AppNotification[] = [
  {
    id: "n1",
    icon: "Flame",
    title: "26-day streak!",
    body: "You're on fire. Keep the discipline going today.",
    time: "just now",
    read: false,
    accent: "accent",
  },
  {
    id: "n2",
    icon: "HandHeart",
    title: "Prayer answered",
    body: "Sarah marked your shared request as answered. 🙌",
    time: "1h ago",
    read: false,
    accent: "green",
  },
  {
    id: "n3",
    icon: "Trophy",
    title: "Challenge update",
    body: "You climbed to #3 in “40 Days of Discipline”.",
    time: "3h ago",
    read: false,
    accent: "ember",
  },
  {
    id: "n4",
    icon: "Sparkles",
    title: "Barnabas checked in",
    body: "“How did today's workout feel? I'm here when you're ready.”",
    time: "yesterday",
    read: true,
    accent: "accent",
  },
  {
    id: "n5",
    icon: "BookOpen",
    title: "New devotional",
    body: "Today's reading: honoring God with your body.",
    time: "yesterday",
    read: true,
    accent: "green",
  },
];

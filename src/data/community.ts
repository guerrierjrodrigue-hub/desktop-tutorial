import type { CommunityPost } from "@/types";

export const communityPosts: CommunityPost[] = [
  {
    id: "p1",
    author: "Sarah M.",
    avatarColor: "#1a5c43",
    timeAgo: "2h ago",
    kind: "testimony",
    content:
      "Six months ago I couldn't run to the mailbox. Today I finished my first 5K and cried the whole last mile. To God be the glory. 🙌",
    likes: 142,
    comments: 28,
    liked: false,
  },
  {
    id: "p2",
    author: "Marcus T.",
    avatarColor: "#a5842a",
    timeAgo: "5h ago",
    kind: "progress",
    content:
      "Day 26 of the 40 Days of Discipline challenge. Down 8 lbs and my morning prayer time has never been more consistent. Body and soul growing together.",
    likes: 89,
    comments: 12,
    liked: true,
  },
  {
    id: "p3",
    author: "Grace Community",
    avatarColor: "#0d3326",
    timeAgo: "1d ago",
    kind: "prayer",
    content:
      "Prayer request: Our brother James is recovering from surgery. Lifting him up as he heals and gets back to training. Please join us. 🙏",
    likes: 214,
    comments: 46,
    liked: false,
  },
];

export const groups = [
  { id: "g1", name: "Grace Community Athletes", members: 312, emoji: "⛪" },
  { id: "g2", name: "5AM Warriors", members: 1840, emoji: "🌅" },
  { id: "g3", name: "Strong Moms in Christ", members: 967, emoji: "💪" },
  { id: "g4", name: "Marathon Disciples", members: 428, emoji: "🏃" },
];

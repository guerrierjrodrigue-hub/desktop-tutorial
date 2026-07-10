export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "train-like-its-worship",
    title: "Train Like It's Worship: 5 Ways to Reframe Your Workout",
    excerpt:
      "Your workout doesn't have to compete with your quiet time. Here's how to make the barbell part of the same act of devotion.",
    author: "Kingdom Athlete Team",
    date: "2026-05-04",
    readMinutes: 5,
    content: [
      "Most of us were taught to separate the physical from the spiritual — one hour for the gym, another for the Word, and never the two shall meet. But Scripture doesn't draw that line. \"Do you not know that your bodies are temples of the Holy Spirit?\" Paul asks in 1 Corinthians 6:19. If that's true, a workout can be worship, not a distraction from it.",
      "Here are five small shifts that changed how our team trains.",
      "1. Start with a breath, not a playlist. Before the first rep, take thirty seconds of silence. Thank God for a body that can move at all — a gift a lot of people don't have on a given day.",
      "2. Name what you're training for. Strength isn't the goal; stewardship is. You're building a body that can serve, carry, kneel, and show up for the people who need you.",
      "3. Let struggle be a teacher, not an enemy. The failed rep, the slow mile — these are small rehearsals for perseverance. James 1:2-4 was written for your legs on squat day too.",
      "4. Replace the mirror with a mission. Vanity asks \"how do I look?\" Stewardship asks \"what is this body for?\" The second question makes consistency a lot easier to sustain.",
      "5. End in gratitude, not exhaustion. However hard the session, close it the same way you'd close a prayer — with thanks, not self-criticism.",
      "None of this requires new equipment. It just asks you to notice that the discipline you're building in the gym and the discipline you're building in your walk with God were never two different muscles.",
    ],
  },
  {
    slug: "strength-isaiah-40-31",
    title: "The Strength Isaiah 40:31 Actually Promises",
    excerpt:
      "\"Those who hope in the Lord will renew their strength\" gets quoted at every finish line. Here's what it actually meant — and what it means for your next rest day.",
    author: "Kingdom Athlete Team",
    date: "2026-04-18",
    readMinutes: 4,
    content: [
      "\"Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.\" It's one of the most quoted verses in fitness culture — stitched onto gym walls and finish-line banners everywhere.",
      "But read it in context (Isaiah 40) and it's not actually about athletic performance. It's written to an exhausted, exiled people who felt forgotten by God. The promise isn't that faith makes you tireless. It's that hope — actively waiting on God — is what sustains you through seasons where your own strength runs out.",
      "That reframes rest days entirely. A rest day isn't a failure of discipline; it's an enactment of the very posture this verse describes — trusting that your worth and your progress don't depend on grinding without pause.",
      "Practically, that might look like: taking your rest day without guilt, praying instead of scrolling during a recovery walk, or simply admitting on a hard week that your strength alone isn't enough — and that's the point.",
      "Eagles don't flap constantly. They ride currents they didn't create. Train hard. Rest on purpose. Hope isn't the opposite of effort — it's what makes effort sustainable.",
    ],
  },
  {
    slug: "building-a-habit-that-sticks",
    title: "What the Research on Habit Formation Means for Your 40-Day Challenge",
    excerpt:
      "Motivation fades by design. Here's what behavioral science says actually keeps people showing up — and how our 40 Days of Discipline challenge is built around it.",
    author: "Kingdom Athlete Team",
    date: "2026-03-02",
    readMinutes: 6,
    content: [
      "Every challenge season, people join our 40 Days of Discipline challenge — a workout and a devotional, every day, for forty days — full of motivation. And motivation, by its nature, doesn't last forty days. That's not a character flaw; it's how motivation works.",
      "So what actually predicts whether a habit sticks? A few well-documented patterns from habit-formation research are worth building your own rhythm around.",
      "First, consistency of timing beats intensity of effort. Anchoring a habit to a fixed time or an existing routine — \"implementation intentions,\" in the research literature — makes people dramatically more likely to follow through than a vague intention to \"find time somewhere.\"",
      "Second, don't aim for a perfect streak — aim to never miss twice in a row. A single missed day barely dents long-term habit formation. A missed day that turns into a missed week is what actually breaks a habit. Plan for the slip; just don't let it compound.",
      "Third, accountability changes outcomes. People pursuing a goal alongside someone else — a spouse, a small group, a church team on a shared leaderboard — consistently report higher follow-through than people going it alone.",
      "None of this is surprising once you say it out loud, but it's worth saying: discipline isn't a personality trait some people have and others don't. It's a handful of small, repeatable structures — a fixed time, a short memory for missed days, and someone else in the fight with you. That's exactly why the 40 Days of Discipline challenge is built around a daily time, a forgiving streak, and a leaderboard — not willpower alone.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

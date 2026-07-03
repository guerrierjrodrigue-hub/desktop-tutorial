/** Demo data for the admin dashboard. Replace with aggregate Supabase queries. */

export const adminStats = [
  { label: "Total users", value: "12,480", delta: "+8.2%", positive: true },
  { label: "Premium members", value: "3,110", delta: "+12.4%", positive: true },
  { label: "MRR", value: "$27,990", delta: "+9.1%", positive: true },
  { label: "Churn (30d)", value: "2.4%", delta: "-0.3%", positive: true },
];

export const adminUsers = [
  { id: "u1", name: "Sarah Mitchell", email: "sarah@example.com", plan: "Disciple", status: "active", joined: "2026-01-14" },
  { id: "u2", name: "Marcus Turner", email: "marcus@example.com", plan: "Legacy", status: "active", joined: "2025-11-02" },
  { id: "u3", name: "Elena Rodriguez", email: "elena@example.com", plan: "Seeker", status: "active", joined: "2026-05-21" },
  { id: "u4", name: "James Park", email: "james@example.com", plan: "Disciple", status: "past_due", joined: "2026-03-08" },
  { id: "u5", name: "Grace Community", email: "admin@grace.org", plan: "Legacy", status: "active", joined: "2025-09-30" },
  { id: "u6", name: "David Bennett", email: "david@example.com", plan: "Seeker", status: "active", joined: "2025-11-02" },
];

export const adminContent = [
  { id: "c1", type: "Program", title: "Foundations of Strength", status: "Published", updated: "2026-06-20" },
  { id: "c2", type: "Program", title: "Warrior HIIT", status: "Published", updated: "2026-06-18" },
  { id: "c3", type: "Devotional", title: "Temple of the Spirit", status: "Scheduled", updated: "2026-07-01" },
  { id: "c4", type: "Reading plan", title: "Fitness & Faith", status: "Draft", updated: "2026-06-29" },
  { id: "c5", type: "Verse", title: "Isaiah 40:31", status: "Published", updated: "2026-05-11" },
];

export const adminPayments = [
  { id: "p1", user: "Marcus Turner", amount: "$79.00", plan: "Legacy (annual)", status: "succeeded", date: "2026-07-01" },
  { id: "p2", user: "Sarah Mitchell", amount: "$9.00", plan: "Disciple (monthly)", status: "succeeded", date: "2026-07-01" },
  { id: "p3", user: "James Park", amount: "$9.00", plan: "Disciple (monthly)", status: "failed", date: "2026-06-30" },
  { id: "p4", user: "Anna Lee", amount: "$9.00", plan: "Disciple (monthly)", status: "succeeded", date: "2026-06-30" },
];

export const adminLogs = [
  { id: "l1", level: "info", message: "Stripe webhook processed: customer.subscription.updated", time: "2m ago" },
  { id: "l2", level: "info", message: "New user signup: elena@example.com", time: "18m ago" },
  { id: "l3", level: "warn", message: "Payment failed for james@example.com (card declined)", time: "1h ago" },
  { id: "l4", level: "info", message: "Program published: Warrior HIIT", time: "3h ago" },
  { id: "l5", level: "error", message: "OpenAI rate limit hit on /api/coach (retried, ok)", time: "5h ago" },
];

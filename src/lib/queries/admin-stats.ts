import { createSupabaseAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { STRIPE_PRICES } from "@/lib/stripe/config";
import { timeAgo } from "@/lib/utils";
import {
  adminStats as mockStats,
  adminUsers as mockUsers,
  adminPayments as mockPayments,
  adminLogs as mockLogs,
} from "@/data/admin";

// ─── Shapes (kept identical to src/data/admin.ts so pages are a drop-in swap) ──
export interface AdminKpi {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  joined: string;
}
export interface AdminPaymentRow {
  id: string;
  user: string;
  amount: string;
  plan: string;
  status: string;
  date: string;
}
export interface AdminLogRow {
  id: string;
  level: string;
  message: string;
  time: string;
}

/**
 * Admin reads bypass the owner-only RLS on `profiles`/`billing_events`, so they
 * use the service-role client — which requires SUPABASE_SERVICE_ROLE_KEY. When
 * that isn't configured (local/demo), everything falls back to mock data, the
 * same way the rest of the project falls back on `isSupabaseConfigured()`.
 * Callers are already gated by `requireAdmin()` in the (admin) layout.
 */

function planLabel(row: {
  is_premium?: boolean;
  subscription_price_id?: string | null;
}): string {
  if (!row.is_premium) return "Seeker";
  if (row.subscription_price_id && row.subscription_price_id === STRIPE_PRICES.annual)
    return "Legacy";
  return "Disciple";
}

/** KPIs: total users, premium members, estimated MRR, new signups (30d). */
export async function getAdminStats(): Promise<AdminKpi[]> {
  if (!isAdminClientConfigured()) return mockStats;
  const admin = createSupabaseAdminClient();

  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [totalRes, premiumRes, new30Res, subsRes] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("joined_at", since30),
    admin.from("profiles").select("subscription_price_id").eq("is_premium", true),
  ]);

  const total = totalRes.count ?? 0;
  const premium = premiumRes.count ?? 0;
  const new30 = new30Res.count ?? 0;

  // Estimated MRR: monthly plan at $9, annual ($79) amortised to ~$6.58/mo.
  // Premium users on an unknown price default to the monthly estimate.
  let mrr = 0;
  for (const s of (subsRes.data ?? []) as { subscription_price_id: string | null }[]) {
    if (s.subscription_price_id && s.subscription_price_id === STRIPE_PRICES.annual) {
      mrr += 79 / 12;
    } else {
      mrr += 9;
    }
  }

  const pct = total > 0 ? Math.round((premium / total) * 100) : 0;

  return [
    { label: "Total users", value: total.toLocaleString(), delta: `+${new30} new (30d)`, positive: true },
    { label: "Premium members", value: premium.toLocaleString(), delta: `${pct}% of users`, positive: true },
    { label: "MRR (est.)", value: `$${Math.round(mrr).toLocaleString()}`, delta: `${premium} active`, positive: true },
    { label: "New (30d)", value: new30.toLocaleString(), delta: "signups", positive: true },
  ];
}

/** Most recently joined users. */
export async function getRecentUsers(limit = 10): Promise<AdminUserRow[]> {
  if (!isAdminClientConfigured()) return mockUsers;
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id, name, email, is_premium, subscription_status, subscription_price_id, joined_at")
    .order("joined_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as Array<{
    id: string;
    name: string;
    email: string | null;
    is_premium: boolean;
    subscription_status: string | null;
    subscription_price_id: string | null;
    joined_at: string | null;
  }>).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? "—",
    plan: planLabel(u),
    status: u.subscription_status ?? "active",
    joined: (u.joined_at ?? "").slice(0, 10),
  }));
}

/** Resolve id → {name, email} for a set of user ids (service role, bypasses RLS). */
async function profileMap(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  ids: string[],
): Promise<Map<string, { name: string | null; email: string | null }>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const { data } = await admin
    .from("profiles")
    .select("id, name, email")
    .in("id", unique);
  return new Map(
    ((data ?? []) as Array<{ id: string; name: string | null; email: string | null }>).map(
      (p) => [p.id, { name: p.name, email: p.email }],
    ),
  );
}

/**
 * Recent billing activity. `billing_events` is an audit log (event type + user
 * + timestamp) — Stripe amounts are not persisted, so amount/plan show "—".
 * TODO: persist the charge amount on the billing_events row (or fetch it from
 * Stripe) to show real figures here.
 */
export async function getRecentPayments(limit = 10): Promise<AdminPaymentRow[]> {
  if (!isAdminClientConfigured()) return mockPayments;
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("billing_events")
    .select("id, type, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as Array<{
    id: string;
    type: string;
    created_at: string | null;
    user_id: string | null;
  }>;
  if (rows.length === 0) return [];

  const names = await profileMap(
    admin,
    rows.map((r) => r.user_id ?? ""),
  );

  return rows.map((e) => {
    const prof = e.user_id ? names.get(e.user_id) : undefined;
    return {
      id: e.id,
      user: prof?.name ?? prof?.email ?? "Unknown",
      amount: "—",
      plan: "—",
      status: statusFromEventType(e.type),
      date: (e.created_at ?? "").slice(0, 10),
    };
  });
}

function statusFromEventType(type: string): string {
  if (/deleted|canceled/i.test(type)) return "canceled";
  if (/failed/i.test(type)) return "failed";
  return "succeeded";
}

/**
 * A real activity feed built from billing events + recent signups, newest
 * first. This is genuine data, but it only covers info/warn-level activity.
 * TODO: brancher un vrai système de logs (erreurs/warnings applicatifs via
 * Sentry, déjà câblé) pour un vrai flux de logs système.
 */
export async function getAdminLogs(limit = 8): Promise<AdminLogRow[]> {
  if (!isAdminClientConfigured()) return mockLogs;
  const admin = createSupabaseAdminClient();

  const [eventsRes, signupsRes] = await Promise.all([
    admin
      .from("billing_events")
      .select("id, type, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("profiles")
      .select("id, email, joined_at")
      .order("joined_at", { ascending: false })
      .limit(limit),
  ]);

  const events = (eventsRes.data ?? []) as Array<{
    id: string;
    type: string;
    created_at: string;
    user_id: string | null;
  }>;
  const signups = (signupsRes.data ?? []) as Array<{
    id: string;
    email: string | null;
    joined_at: string;
  }>;

  const names = await profileMap(
    admin,
    events.map((e) => e.user_id ?? ""),
  );

  const entries: { id: string; level: string; message: string; ts: string }[] = [
    ...events.map((e) => {
      const email = e.user_id ? names.get(e.user_id)?.email : undefined;
      return {
        id: `be-${e.id}`,
        level: /failed/i.test(e.type) ? "warn" : "info",
        message: `Billing: ${e.type} — ${email ?? "unknown"}`,
        ts: e.created_at,
      };
    }),
    ...signups.map((s) => ({
      id: `su-${s.id}`,
      level: "info",
      message: `New signup: ${s.email ?? "unknown"}`,
      ts: s.joined_at,
    })),
  ];

  return entries
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, limit)
    .map((e) => ({ id: e.id, level: e.level, message: e.message, time: timeAgo(e.ts) }));
}

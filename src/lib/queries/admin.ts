import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Guard for admin routes. In demo mode (no Supabase) access is allowed so the
 * dashboard is explorable. With a real backend, requires profiles.is_admin.
 */
export async function requireAdmin(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login?redirect=/admin");

  const { data } = await ctx.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", ctx.userId)
    .single();

  if (!data?.is_admin) redirect("/dashboard");
}

export interface AdminReport {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  content: string;
  authorName: string;
  reporterName: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
  hidden: boolean;
}

interface ReportRow {
  id: string;
  reporter_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  status: "open" | "resolved";
  created_at: string;
}

/**
 * Reported content for the admin moderation view. RLS only returns rows to
 * admins, so this is empty for a non-admin (and in demo mode). Resolves the
 * target content, its author, and the reporter with keyed lookups.
 */
export async function getReports(): Promise<AdminReport[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("content_reports")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as ReportRow[];
  if (!rows.length) return [];

  const postIds = [...new Set(rows.map((r) => r.post_id).filter((id): id is string => !!id))];
  const commentIds = [...new Set(rows.map((r) => r.comment_id).filter((id): id is string => !!id))];

  const [postsRes, commentsRes] = await Promise.all([
    postIds.length
      ? ctx.supabase.from("community_posts").select("id, user_id, content, hidden").in("id", postIds)
      : Promise.resolve({ data: [] as unknown[] }),
    commentIds.length
      ? ctx.supabase.from("post_comments").select("id, user_id, body, hidden").in("id", commentIds)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  const posts = new Map(
    ((postsRes.data ?? []) as { id: string; user_id: string; content: string; hidden: boolean }[]).map(
      (p) => [p.id, p],
    ),
  );
  const comments = new Map(
    ((commentsRes.data ?? []) as { id: string; user_id: string; body: string; hidden: boolean }[]).map(
      (c) => [c.id, c],
    ),
  );

  // Names for both authors and reporters, from the safe public view.
  const authorIds = new Set<string>(rows.map((r) => r.reporter_id));
  for (const p of posts.values()) authorIds.add(p.user_id);
  for (const c of comments.values()) authorIds.add(c.user_id);
  const { data: nameRows } = await ctx.supabase
    .from("profile_public")
    .select("id, name")
    .in("id", [...authorIds]);
  const nameById = new Map(
    ((nameRows ?? []) as { id: string; name: string }[]).map((n) => [n.id, n.name]),
  );

  return rows.map((r) => {
    const isPost = !!r.post_id;
    const post = r.post_id ? posts.get(r.post_id) : undefined;
    const comment = r.comment_id ? comments.get(r.comment_id) : undefined;
    const authorId = post?.user_id ?? comment?.user_id ?? "";
    return {
      id: r.id,
      targetType: isPost ? "post" : "comment",
      targetId: (r.post_id ?? r.comment_id) as string,
      content: post?.content ?? comment?.body ?? "",
      authorName: nameById.get(authorId) ?? "Athlete",
      reporterName: nameById.get(r.reporter_id) ?? "Athlete",
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at,
      hidden: post?.hidden ?? comment?.hidden ?? false,
    };
  });
}

import { getAuthedContext } from "@/lib/supabase/auth";
import { communityPosts as mockPosts, groups as mockGroups } from "@/data/community";
import { timeAgo } from "@/lib/utils";
import type { CommunityPost } from "@/types";

export interface CommunityGroup {
  id: string;
  name: string;
  emoji: string;
  members: number;
  /** Whether the signed-in user is a member (drives "Your groups" vs "Discover"). */
  joined: boolean;
}

/** The group catalog with real member counts and the user's membership (demo data when unconfigured). */
export async function getGroups(): Promise<CommunityGroup[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockGroups;

  const { data: groupRows } = await ctx.supabase.from("groups").select("*");
  if (!groupRows?.length) return [];

  const { data: memberRows } = await ctx.supabase
    .from("group_members")
    .select("group_id, user_id");
  const countByGroup = new Map<string, number>();
  const mine = new Set<string>();
  for (const row of (memberRows ?? []) as { group_id: string; user_id: string }[]) {
    countByGroup.set(row.group_id, (countByGroup.get(row.group_id) ?? 0) + 1);
    if (row.user_id === ctx.userId) mine.add(row.group_id);
  }

  return groupRows.map((g) => ({
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    members: countByGroup.get(g.id) ?? 0,
    joined: mine.has(g.id),
  }));
}

const AVATAR_COLORS = ["#1e7a1b", "#c60d40", "#00838d", "#b8860b", "#5b3fa0", "#2f6f6e"];

/** Deterministic color per author so the same person always gets the same avatar color. */
function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface PostRow {
  id: string;
  user_id: string;
  content: string;
  kind: CommunityPost["kind"];
  created_at: string;
}

/** The community feed — real posts across all users (demo data when unconfigured). */
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockPosts;

  const postQuery = await ctx.supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const postRows = postQuery.data as PostRow[] | null;
  if (!postRows?.length) return [];

  // Author names come from the safe public view — PostgREST can't embed a view
  // across a foreign key, so resolve them with a separate keyed lookup.
  const authorIds = [...new Set(postRows.map((p) => p.user_id))];
  const { data: authorRows } = await ctx.supabase
    .from("profile_public")
    .select("id, name")
    .in("id", authorIds);
  const nameById = new Map(
    ((authorRows ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]),
  );

  const postIds = postRows.map((p) => p.id);
  const [likeQuery, commentQuery] = await Promise.all([
    ctx.supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds),
    ctx.supabase.from("post_comments").select("post_id").in("post_id", postIds),
  ]);
  const likeRows = (likeQuery.data ?? []) as { post_id: string; user_id: string }[];
  const commentRows = (commentQuery.data ?? []) as { post_id: string }[];

  const likesByPost = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const row of likeRows) {
    likesByPost.set(row.post_id, (likesByPost.get(row.post_id) ?? 0) + 1);
    if (row.user_id === ctx.userId) likedByMe.add(row.post_id);
  }
  const commentsByPost = new Map<string, number>();
  for (const row of commentRows) {
    commentsByPost.set(row.post_id, (commentsByPost.get(row.post_id) ?? 0) + 1);
  }

  return postRows.map((row) => ({
    id: row.id,
    author: nameById.get(row.user_id) ?? "Athlete",
    avatarColor: colorFor(row.user_id),
    timeAgo: timeAgo(row.created_at),
    content: row.content,
    kind: row.kind,
    likes: likesByPost.get(row.id) ?? 0,
    comments: commentsByPost.get(row.id) ?? 0,
    liked: likedByMe.has(row.id),
  }));
}

import { getAuthedContext } from "@/lib/supabase/auth";
import type { ChatMessage } from "@/types";

/** The signed-in user's saved conversation with one coach (oldest first). */
export async function getCoachHistory(coachId: string): Promise<ChatMessage[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("coach_messages")
    .select("id, role, content")
    .eq("user_id", ctx.userId)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as ChatMessage["role"],
    content: row.content as string,
  }));
}

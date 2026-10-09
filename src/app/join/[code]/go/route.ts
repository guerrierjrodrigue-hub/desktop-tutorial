import { NextResponse, type NextRequest } from "next/server";
import { getAuthedContext } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getChallengeByInviteCode } from "@/lib/queries/challenges";
import { joinChallenge } from "@/app/(app)/challenges/actions";

/**
 * Performs the cohort join and redirects — in a Route Handler, where
 * revalidatePath() is allowed (it is NOT during a Server Component render,
 * which is what previously crashed /join for signed-in users).
 *
 * - anonymous (Supabase configured, no session) → /login, preserving the invite
 * - cohort not found                             → back to the landing with an error
 * - join fails                                   → back to the landing with an error
 * - success / already a member / demo            → /challenges
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ref = req.nextUrl.searchParams.get("ref") ?? undefined;
  const to = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl.origin));

  const ctx = await getAuthedContext();
  const demo = !isSupabaseConfigured();

  if (!ctx && !demo) {
    return to(`/login?redirect=/join/${encodeURIComponent(code)}`);
  }

  const cohort = await getChallengeByInviteCode(code);
  if (!cohort && !demo) {
    return to(`/join/${encodeURIComponent(code)}?error=notfound`);
  }

  if (cohort) {
    const res = await joinChallenge(cohort.id, ref);
    if (!res.ok) return to(`/join/${encodeURIComponent(code)}?error=1`);
  }

  // Joined (or already a member — upsert is idempotent), or demo: go to the app.
  return to("/challenges");
}

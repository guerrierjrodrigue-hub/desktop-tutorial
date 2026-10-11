import { NextResponse, type NextRequest } from "next/server";
import { getAuthedContext } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getChallengeByInviteCode } from "@/lib/queries/challenges";
import { joinChallenge } from "@/app/(app)/challenges/actions";
import { resolveReferrer } from "@/lib/referral";

/**
 * A GET here must NOT mutate (it is safe/idempotent by the HTTP contract, and
 * link previews / prefetchers routinely fire it). So GET just redirects to the
 * confirmation page; the actual join happens only on POST, from the explicit
 * "Join this cohort?" confirmation form.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ref = req.nextUrl.searchParams.get("ref");
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return NextResponse.redirect(
    new URL(`/join/${encodeURIComponent(code)}${query}`, req.nextUrl.origin),
  );
}

/**
 * Performs the cohort join (a mutation) — only on POST, from the confirmation
 * form. revalidatePath() inside joinChallenge is allowed in a Route Handler.
 *
 * - anonymous (Supabase configured, no session) → /login, preserving the invite
 * - cohort not found                             → back to the landing with an error
 * - join fails                                   → back to the landing with an error
 * - success / already a member / demo            → /challenges
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  // Validate the ref param: only a well-formed, non-self user id is credited;
  // anything else is dropped before it reaches the action.
  const rawRef = req.nextUrl.searchParams.get("ref");
  const to = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl.origin), 303);

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
    // resolveReferrer validates the ref is a UUID and not the joining user.
    const ref = ctx ? resolveReferrer(rawRef, ctx.userId) : null;
    const res = await joinChallenge(cohort.id, ref);
    if (!res.ok) return to(`/join/${encodeURIComponent(code)}?error=1`);
  }

  // Joined (or already a member — upsert is idempotent), or demo: go to the app.
  return to("/challenges");
}

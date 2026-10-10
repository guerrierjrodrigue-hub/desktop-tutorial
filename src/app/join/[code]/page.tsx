import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, AlertTriangle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthedContext } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getChallengeByInviteCode } from "@/lib/queries/challenges";
import { cohortStartLabel } from "@/lib/cohort";
import { plural } from "@/lib/i18n-plural";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const { code } = await params;
  const { ref, error } = await searchParams;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const ctx = await getAuthedContext();
  const demo = !isSupabaseConfigured();
  const goHref = `/join/${code}/go${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;

  // Signed-in (or demo) and nothing went wrong yet: hand off to the route
  // handler, which does the join + redirect. We do NOT join during render.
  if ((ctx || demo) && !error) {
    redirect(goHref);
  }

  const cohort = await getChallengeByInviteCode(code, locale);
  const summary = cohort
    ? dict["join.cohortSummary"]
        .replace("{n}", String(cohort.durationDays))
        .replace("{day}", cohort.startDate ? cohortStartLabel(cohort.startDate, locale) : "—")
    : null;
  const enrolledLabel = cohort
    ? plural(
        cohort.participants,
        { one: dict["plural.enrolled.one"], other: dict["plural.enrolled.other"] },
        locale,
      )
    : null;

  // Preserve the invite (and referrer) through sign-up / sign-in.
  const returnTo = `/join/${code}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(returnTo)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(returnTo)}`;

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto flex max-w-xl flex-col items-center px-6 pb-24 pt-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold-bright">
            <Users className="size-7" />
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {dict["join.title"]}
          </h1>

          {error && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red-300">
              <AlertTriangle className="size-4 shrink-0" />
              {error === "notfound" ? dict["join.notFound"] : dict["join.error"]}
            </p>
          )}

          {cohort ? (
            <>
              <Card className="mt-8 w-full text-left">
                <h2 className="font-serif text-xl font-semibold">{cohort.title}</h2>
                <p className="mt-1 text-sm text-muted">{cohort.description}</p>
                <p className="mt-4 text-sm font-medium text-gold-bright">{summary}</p>
                <p className="mt-1 text-sm text-muted">{enrolledLabel}</p>
              </Card>
              <p className="mt-6 text-muted">{dict["join.subtitle"]}</p>
              <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                {ctx ? (
                  // Signed in but a previous attempt errored: let them retry.
                  <Link href={goHref}>
                    <Button size="lg" className="w-full sm:w-auto">
                      {dict["join.retry"]}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={signupHref}>
                      <Button size="lg" className="w-full sm:w-auto">
                        {dict["join.cta"]}
                      </Button>
                    </Link>
                    <Link href={loginHref}>
                      <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                        {dict["join.signInCta"]}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </>
          ) : (
            !error && <p className="mt-6 text-muted">{dict["join.notFound"]}</p>
          )}
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { Trophy, Medal } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengesList } from "@/components/challenges/challenges-list";
import { getChallenges, getChallengeLeaderboard, getReferralCount } from "@/lib/queries/challenges";
import { getCurrentUser } from "@/lib/queries/profile";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { plural } from "@/lib/i18n-plural";
import { timed } from "@/lib/perf";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.challenges"],
    description: "Personal, friend, and church challenges. Compete, encourage, and grow together.",
  };
}

export default async function ChallengesPage() {
  const locale = await getLocale();
  const [challenges, leaderboard, user, referrals, dict] = await timed("challenges", () =>
    Promise.all([
      getChallenges(locale),
      getChallengeLeaderboard(),
      getCurrentUser(),
      getReferralCount(),
      getDictionary(locale),
    ]),
  );

  return (
    <>
      <Topbar title={dict["challenges.title"]} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader title={dict["challenges.title"]} subtitle={dict["challenges.subtitle"]} />

        {referrals > 0 && (
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-bright">
            {plural(
              referrals,
              { one: dict["plural.referrals.one"], other: dict["plural.referrals.other"] },
              locale,
            )}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <ChallengesList
              initial={challenges}
              dict={dict}
              locale={locale}
              currentUserId={user.id}
            />
          </div>

          {/* Leaderboard */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <Trophy className="size-4 text-gold-bright" /> {dict["challenges.leaderboard"]}
                  </span>
                </CardTitle>
              </CardHeader>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted">{dict["empty.noOneOnLeaderboard"]}</p>
              ) : (
                <ul className="space-y-1">
                  {leaderboard.map((row) => (
                    <li
                      key={row.rank}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        row.you ? "bg-gold/10 ring-1 ring-gold/25" : ""
                      }`}
                    >
                      <span className="w-5 text-center text-sm font-semibold text-muted">
                        {row.rank <= 3 ? (
                          <Medal
                            className={`mx-auto size-4 ${
                              row.rank === 1
                                ? "text-gold-bright"
                                : row.rank === 2
                                  ? "text-muted"
                                  : "text-bronze"
                            }`}
                          />
                        ) : (
                          row.rank
                        )}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {row.name}
                        {row.you && (
                          <span className="ml-1.5 text-xs text-gold-bright">
                            ({dict["challenges.you"]})
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold text-gold-bright">
                        {row.points.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

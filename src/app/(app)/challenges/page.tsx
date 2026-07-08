import type { Metadata } from "next";
import { Users, Church, UserRound, Flame, Trophy, Medal } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChallenges, getChallengeLeaderboard } from "@/lib/queries/challenges";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Challenge } from "@/types";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Personal, friend, and church challenges. Compete, encourage, and grow together.",
};

const typeMeta: Record<Challenge["type"], { icon: typeof Users; label: string }> = {
  personal: { icon: UserRound, label: "Personal" },
  friends: { icon: Users, label: "Friends" },
  church: { icon: Church, label: "Church" },
};

export default async function ChallengesPage() {
  const [challenges, leaderboard, dict] = await Promise.all([
    getChallenges(),
    getChallengeLeaderboard(),
    getDictionary(await getLocale()),
  ]);

  return (
    <>
      <Topbar title="Challenges" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Challenges"
          subtitle="Discipline is easier together. Join a challenge and keep the streak alive."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {challenges.length === 0 && (
              <Card>
                <p className="text-sm text-muted">{dict["empty.noChallengesAvailable"]}</p>
              </Card>
            )}

            {challenges.map((c) => {
              const meta = typeMeta[c.type];
              return (
                <Card key={c.id}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green/20 text-green-bright">
                      <meta.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-semibold leading-tight">
                          {c.title}
                        </h3>
                        <Badge variant="neutral">{meta.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">{c.description}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Progress value={c.progress} />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {c.participants.toLocaleString()} joined
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Flame className="size-3.5 text-gold/70" />
                        {c.daysLeft} days left
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}

            <Card className="flex items-center justify-between bg-gradient-to-br from-gold/10 to-surface">
              <div>
                <h3 className="font-serif text-lg font-semibold">
                  Start your own challenge
                </h3>
                <p className="text-sm text-muted">
                  Rally your friends or your whole church.
                </p>
              </div>
              <Button>Create</Button>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <Trophy className="size-4 text-gold-bright" /> Leaderboard
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
                            (you)
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

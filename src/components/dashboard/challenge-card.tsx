import Link from "next/link";
import { Users, Church, UserRound, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { JoinChallengeButton } from "./join-challenge-button";
import { getChallenges } from "@/lib/queries/challenges";
import { pickDashboardChallenge } from "@/lib/challenge-progress";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

const typeMeta = {
  personal: { icon: UserRound },
  friends: { icon: Users },
  church: { icon: Church },
} as const;

export async function ChallengeCard() {
  const locale = await getLocale();
  const [challenges, dict] = await Promise.all([getChallenges(locale), getDictionary(locale)]);
  const featured = pickDashboardChallenge(challenges);

  if (!featured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict["dashboard.activeChallenge"]}</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted">
          {dict["empty.noChallengesYet"]}{" "}
          <Link href="/challenges" className="font-semibold text-gold-bright hover:underline">
            {dict["empty.browseChallenges"]} →
          </Link>
        </p>
      </Card>
    );
  }

  const meta = typeMeta[featured.type];
  // "In progress" only when the user has actually joined; otherwise recommend it.
  const title = featured.joined
    ? dict["dashboard.activeChallenge"]
    : dict["dashboard.recommendedChallenge"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Link
          href="/challenges"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-bright hover:underline"
        >
          {dict["common.seeAll"]} <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green/20 text-green-bright">
          <meta.icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold leading-tight">{featured.title}</h3>
          <p className="mt-0.5 text-sm text-muted">{featured.description}</p>
        </div>
      </div>

      {featured.joined ? (
        // JOINED: show the user's real progress and days left.
        <div className="mt-4">
          <Progress value={featured.progress} />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>
              {Math.round(featured.progress * 100)}% {dict["challenges.percentComplete"]}
            </span>
            <span>
              {featured.daysLeft} {dict["challenges.daysLeft"]}
            </span>
          </div>
        </div>
      ) : (
        // RECOMMENDED: show duration + a Join button (no fake progress bar).
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <Badge variant="gold">
              {dict["challenges.lastsDays"].replace("{n}", String(featured.durationDays))}
            </Badge>
            <span>
              {featured.participants} {dict["challenges.joined"]}
            </span>
          </div>
          <JoinChallengeButton challengeId={featured.id} label={dict["challenges.join"]} />
        </div>
      )}
    </Card>
  );
}

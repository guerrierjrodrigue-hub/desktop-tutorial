import Link from "next/link";
import { Users, Church, UserRound, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getChallenges } from "@/lib/queries/challenges";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

const typeMeta = {
  personal: { icon: UserRound, label: "Personal" },
  friends: { icon: Users, label: "Friends" },
  church: { icon: Church, label: "Church" },
} as const;

export async function ChallengeCard() {
  const [challenges, dict] = await Promise.all([getChallenges(), getDictionary(await getLocale())]);
  const featured = challenges[0];

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["dashboard.activeChallenge"]}</CardTitle>
        <Link
          href="/challenges"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-bright hover:underline"
        >
          All <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green/20 text-green-bright">
          <meta.icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold leading-tight">
            {featured.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{featured.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={featured.progress} />
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{Math.round(featured.progress * 100)}% complete</span>
          <span>{featured.daysLeft} days left</span>
        </div>
      </div>
    </Card>
  );
}

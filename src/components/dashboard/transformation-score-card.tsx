import { Card } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { getCurrentUser } from "@/lib/queries/profile";
import { getHabits } from "@/lib/queries/habits";
import { getTransformationScore } from "@/lib/quests";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function TransformationScoreCard() {
  const [user, habits, dict] = await Promise.all([
    getCurrentUser(),
    getHabits(),
    getDictionary(await getLocale()),
  ]);
  const { score, tierId } = getTransformationScore(user, habits);
  const tier = dict[`score.tier.${tierId}`];

  return (
    <Card className="flex items-center gap-5">
      <Ring value={score / 100} size={88} stroke={8} progressClassName="text-ember">
        <span className="font-serif text-xl font-semibold">{score}</span>
      </Ring>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {dict["dashboard.transformationScore"]}
        </p>
        <p className="mt-1 font-serif text-xl font-semibold text-accent-bright">{tier}</p>
        <p className="mt-1 text-xs text-faint">{dict["score.blurb"]}</p>
      </div>
    </Card>
  );
}

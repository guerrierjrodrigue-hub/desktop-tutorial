import { Card } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { getCurrentUser } from "@/lib/queries/profile";
import { getTransformationScore } from "@/lib/quests";
import { habits } from "@/data/dashboard";

export async function TransformationScoreCard() {
  const user = await getCurrentUser();
  const { score, tier } = getTransformationScore(user, habits);

  return (
    <Card className="flex items-center gap-5">
      <Ring value={score / 100} size={88} stroke={8} progressClassName="text-gold">
        <span className="font-serif text-xl font-semibold">{score}</span>
      </Ring>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Transformation score
        </p>
        <p className="mt-1 font-serif text-xl font-semibold text-gold-bright">{tier}</p>
        <p className="mt-1 text-xs text-faint">
          Blends your streak, level progress, and today&apos;s habits.
        </p>
      </div>
    </Card>
  );
}

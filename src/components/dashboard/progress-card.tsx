import { Flame, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShareStreakButton } from "./share-streak-button";
import { getCurrentUser } from "@/lib/queries/profile";
import { levelFromXp } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function ProgressCard() {
  const [currentUser, dict] = await Promise.all([getCurrentUser(), getDictionary(await getLocale())]);
  const { level, nextLevelXp, progress } = levelFromXp(currentUser.xp);
  const toNext = nextLevelXp - currentUser.xp;

  return (
    <Card className="bg-gradient-to-br from-gold/10 to-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict["dashboard.level"]}
          </p>
          <p className="font-serif text-4xl font-semibold text-gradient-gold">
            {level}
          </p>
        </div>
        <div className="flex gap-2">
          <Stat icon={Flame} label={dict["dashboard.dayStreak"]} value={currentUser.streak} />
          <Stat
            icon={Zap}
            label={dict["dashboard.totalXp"]}
            value={currentUser.xp.toLocaleString()}
          />
        </div>
      </div>

      <div className="mt-5">
        <Progress value={progress} />
        <p className="mt-2 text-xs text-muted">
          {dict["progress.xpToLevel"]
            .replace("{xp}", toNext.toLocaleString())
            .replace("{level}", String(level + 1))}
        </p>
        {currentUser.streak > 0 && (
          <div className="mt-3">
            <ShareStreakButton
              streak={currentUser.streak}
              label={dict["share.streak"]}
              caption={`${currentUser.streak} ${dict["dashboard.dayStreak"]}`}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-black/20 px-3 py-2 text-center">
      <Icon className="mx-auto size-4 text-gold/70" />
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  );
}

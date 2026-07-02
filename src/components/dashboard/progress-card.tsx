import { Flame, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currentUser } from "@/data/user";
import { levelFromXp } from "@/lib/utils";

export function ProgressCard() {
  const { level, nextLevelXp, progress } = levelFromXp(currentUser.xp);
  const toNext = nextLevelXp - currentUser.xp;

  return (
    <Card className="bg-gradient-to-br from-gold/10 to-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Level
          </p>
          <p className="font-serif text-4xl font-semibold text-gradient-gold">
            {level}
          </p>
        </div>
        <div className="flex gap-2">
          <Stat icon={Flame} label="Day streak" value={currentUser.streak} />
          <Stat
            icon={Zap}
            label="Total XP"
            value={currentUser.xp.toLocaleString()}
          />
        </div>
      </div>

      <div className="mt-5">
        <Progress value={progress} />
        <p className="mt-2 text-xs text-muted">
          <span className="font-semibold text-gold-bright">
            {toNext.toLocaleString()} XP
          </span>{" "}
          to level {level + 1}
        </p>
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

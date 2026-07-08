import { Flame, Timer, Droplets } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { getTodayStats } from "@/lib/queries/stats";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function StatsCard() {
  const [s, dict] = await Promise.all([getTodayStats(), getDictionary(await getLocale())]);
  const rings = [
    {
      label: "Calories",
      icon: Flame,
      value: s.caloriesBurned,
      goal: s.caloriesGoal,
      unit: "kcal",
      color: "text-gold",
    },
    {
      label: "Active",
      icon: Timer,
      value: s.activeMinutes,
      goal: s.activeMinutesGoal,
      unit: "min",
      color: "text-green-bright",
    },
    {
      label: "Water",
      icon: Droplets,
      value: s.waterMl / 1000,
      goal: s.waterGoalMl / 1000,
      unit: "L",
      color: "text-bronze",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["dashboard.todaysActivity"]}</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-3 gap-2">
        {rings.map((r) => (
          <div key={r.label} className="flex flex-col items-center gap-2">
            <Ring
              value={r.goal > 0 ? r.value / r.goal : 0}
              size={92}
              stroke={9}
              progressClassName={r.color}
            >
              <r.icon className={`size-5 ${r.color}`} />
            </Ring>
            <div className="text-center">
              <p className="text-sm font-semibold">
                {r.value % 1 === 0 ? r.value : r.value.toFixed(1)}
                <span className="text-xs font-normal text-muted"> {r.unit}</span>
              </p>
              <p className="text-xs text-faint">{r.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

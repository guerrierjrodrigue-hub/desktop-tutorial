import Link from "next/link";
import { Clock, CalendarDays, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import type { Program } from "@/types";

const levelLabel: Record<Program["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      href={`/fitness/${program.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-gold/30"
    >
      <div
        className={`relative h-32 bg-gradient-to-br ${program.coverColor} p-4`}
      >
        <div className="flex items-start justify-between">
          <Badge variant="neutral" className="bg-black/30 text-foreground backdrop-blur">
            {levelLabel[program.level]}
          </Badge>
          {program.premium && (
            <Badge variant="premium" className="bg-black/30 backdrop-blur">
              <Lock className="size-3" /> Premium
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-gold-bright">
          {program.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">
          {program.description}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-faint">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {program.weeks} wks · {program.daysPerWeek}×/wk
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatDuration(program.durationMinutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}

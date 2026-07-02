import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0..1
  className?: string;
  barClassName?: string;
}

export function Progress({ value, className, barClassName }: ProgressProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-gold to-gold-bright transition-[width] duration-700 ease-out",
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
